import { BrowserTab, GrayTabGroup, GrayTab } from '../@types/graytabby';
import {
  loadAllTabGroups,
  eraseTabGroup,
  saveTabGroup,
  keyFromGroup,
  dateFromKey,
  keyFromDate,
} from './tabs';
import { getOptions, setOptions } from './options';
import { DOCUMENT, BROWSER, ARCHIVAL } from './globals';

function getDomain(url: string): string {
  return new URL(url).hostname;
}

function faviconLocation(url: string): string {
  const domain = getDomain(url);
  if (domain) return `https://www.google.com/s2/favicons?domain=${domain}`;
  return '';
}

function makeElement(
  type: string,
  attrs: { [key: string]: string } = {},
  children?: string | Element[],
): Element {
  const elem = document.createElement(type);
  for (const key in attrs) {
    elem.setAttribute(key, attrs[key]);
  }

  if (children === undefined) return elem;

  if (typeof children === 'string') {
    elem.innerText = children;
  } else {
    children.map(c => elem.appendChild(c));
  }
  return elem;
}

async function bindOptions(): Promise<void> {
  const document = DOCUMENT.get();
  const modal = <HTMLDivElement>document.querySelector('#optionsModal');
  const button = <HTMLDivElement>document.querySelector('#optionsButton');
  const close = <HTMLDivElement>document.querySelector('#optionsModal .close');
  button.onclick = () => (modal.style.display = 'block');
  close.onclick = () => (modal.style.display = 'none');

  const optionsLimitNode = <HTMLInputElement>document.querySelector('#optionsLimit');
  const optionsDupesNode = <HTMLInputElement>document.querySelector('#optionsDupes');
  const optionsAtLoad = await getOptions();

  optionsLimitNode.value = optionsAtLoad.tabLimit.toString();
  optionsDupesNode.checked = optionsAtLoad.archiveDupes;

  optionsDupesNode.onchange = async () => {
    await setOptions({
      archiveDupes: optionsDupesNode.checked,
    });
  };

  // From https://stackoverflow.com/questions/469357/html-text-input-allow-only-numeric-input
  // HTML5 validators have poor support at the moment.
  optionsLimitNode.onkeydown = (e): boolean => {
    return (
      e.ctrlKey ||
      e.altKey ||
      (47 < e.keyCode && e.keyCode < 58 && e.shiftKey == false) ||
      (95 < e.keyCode && e.keyCode < 106) ||
      e.keyCode == 8 ||
      e.keyCode == 9 ||
      (e.keyCode > 34 && e.keyCode < 40) ||
      e.keyCode == 46
    );
  };

  optionsLimitNode.onkeyup = async () => {
    const newLimit = Number(optionsLimitNode.value);
    if (newLimit != NaN) {
      await setOptions({
        tabLimit: newLimit,
      });
    }
  };
}

// function patchWindow(): void {
//   getDocument().defaultView.getOptions = getOptions;
// }

function renderFavicon(url: string): HTMLImageElement {
  const loc = faviconLocation(url);
  return <HTMLImageElement>makeElement('img', {
    src: loc,
    width: '16',
    height: '16',
  });
}

/**
 * Updates the backend to match the DOM for the tab group with the given date.
 */
async function syncGroupFromDOM(target: number | HTMLDivElement): Promise<void> {
  let div: HTMLDivElement;
  let date: number;
  if (typeof target === 'number') {
    date = target;
    div = DOCUMENT.get().querySelector(`#${keyFromDate(date)}`);
    if (div == null) return eraseTabGroup(date);
  } else {
    div = target;
    date = dateFromKey(div.id);
  }
  const group: GrayTabGroup = {
    date: date,
    tabs: [],
  };
  const lis = div.querySelectorAll('li');
  lis.forEach(li => {
    const a: HTMLAnchorElement = li.querySelector('a');
    const tab: GrayTab = {
      key: Number(a.attributes.getNamedItem('key').value),
      url: a.href,
      title: a.innerText,
    };
    group.tabs.push(tab);
  });
  if (group.tabs.length == 0) {
    return eraseTabGroup(date);
  }
  return saveTabGroup(group);
}

let totalTabs = 0;
function updateInfo(delta: number): void {
  const infoNode = <HTMLParagraphElement>DOCUMENT.get().querySelector('#info');
  totalTabs += delta;
  infoNode.innerText = 'Total tabs: ' + totalTabs.toString();
}

async function linkRowClickhandler(event: MouseEvent): Promise<void> {
  const a = <HTMLAnchorElement>event.target;
  const row = <HTMLDivElement>a.parentElement;
  const li = <HTMLDivElement>row.parentElement;
  const ul = <HTMLUListElement>li.parentElement;
  const groupDiv = <HTMLDivElement>ul.parentElement;

  event.preventDefault();
  await BROWSER.get().tabs.create({ url: a.href, active: false });
  li.remove();
  updateInfo(-1);
  if (groupDiv.querySelector('li') == null) groupDiv.remove();
  await syncGroupFromDOM(dateFromKey(groupDiv.id));
}

function renderLinkRow(group: GrayTabGroup, tab: GrayTab): HTMLLIElement {
  const li = <HTMLLIElement>makeElement('li');
  const row = <HTMLDivElement>li.appendChild(makeElement('div'));
  row.appendChild(renderFavicon(tab.url));
  const a = <HTMLAnchorElement>(
    row.appendChild(makeElement('a', { href: tab.url, key: tab.key.toString() }, tab.title))
  );
  a.onclick = linkRowClickhandler;
  return li;
}

function renderGroup(group: GrayTabGroup): HTMLDivElement {
  const div = <HTMLDivElement>makeElement('div', { id: keyFromGroup(group) });
  div.appendChild(makeElement('span', {}, new Date(group.date).toLocaleString()));
  const ul = div.appendChild(makeElement('ul'));
  for (const tab of group.tabs) {
    ul.appendChild(renderLinkRow(group, tab));
  }
  return div;
}

function prependInsideContainer(parent: Element, child: Element): Element {
  if (parent.firstChild == null) parent.appendChild(child);
  else parent.insertBefore(child, parent.firstChild);
  return child;
}

function countGroups(): number {
  return DOCUMENT.get().querySelectorAll('#groups > div').length;
}

async function ingestTabs(tabSummaries: BrowserTab[], groupsNode: HTMLDivElement): Promise<void> {
  if (tabSummaries.length == 0) return;
  let counter = 0;
  const group: GrayTabGroup = {
    tabs: tabSummaries.map(ts => {
      return { ...ts, key: counter++ };
    }),
    date: Math.round(new Date().getTime()),
  };
  prependInsideContainer(groupsNode, renderGroup(group));
  await syncGroupFromDOM(group.date);
  updateInfo(group.tabs.length);

  const tabLimit = (await getOptions()).tabLimit;
  while (totalTabs > tabLimit && countGroups() > 1) {
    const victim = <HTMLDivElement>DOCUMENT.get().querySelector('#groups>div:last-child');
    const removed = victim.querySelectorAll('li').length;
    updateInfo(-removed);
    await eraseTabGroup(dateFromKey(victim.id));
    victim.remove();
  }
}

/**
 * The main entry point for GrayTabby.
 */
export async function grayTabby(): Promise<void> {
  DOCUMENT.get().title = 'GrayTabby';
  await bindOptions();
  const groupsNode = <HTMLDivElement>DOCUMENT.get().querySelector('#groups');

  // Begin binding.
  let counter = 0;
  for (const group of await loadAllTabGroups()) {
    counter += group.tabs.length;
    groupsNode.appendChild(renderGroup(group));
  }
  ARCHIVAL.get().sub(summaries => ingestTabs(summaries, groupsNode));
  updateInfo(counter);
  // updateInfo();
  // patchWindow();
}
