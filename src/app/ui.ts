/**
 * User interface code for graytabby.
 *
 * Anything responsible for responding to user input or for displaying data to the user.
 */

import * as sizeof from 'object-sizeof';
import * as vlq from 'vlq';
import { ARCHIVAL, BROWSER, DOCUMENT } from '../lib/globals';
import { getOptions, setOptions } from '../lib/options';
import {
  dateFromKey,
  eraseTabGroup,
  keyFromDate,
  keyFromGroup,
  loadAllTabGroups,
  saveTabGroup,
  GrayTabGroup,
  GrayTab,
} from './tabs';
import { BrowserTab } from '../lib/types';

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
  const elem = DOCUMENT.get().createElement(type);
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
  const logo = <HTMLImageElement>document.querySelector('#logo');
  const content = <HTMLDivElement>document.querySelector('#optionsModal .content');
  logo.onclick = () => (modal.style.display = 'block');
  modal.onclick = event => {
    if (!content.contains(<HTMLElement>event.target)) modal.style.display = 'none';
  };

  const checkboxes: HTMLInputElement[] = Array.from(
    content.querySelectorAll('label input[type="checkbox"]'),
  );
  for (const checkbox of checkboxes) {
    const label = <HTMLLabelElement>checkbox.parentElement;
    const span = <HTMLSpanElement>label.querySelector('span');
    span.onclick = () => (checkbox.checked = !checkbox.checked);
  }

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

function renderFavicon(url: string): HTMLImageElement {
  const loc = faviconLocation(url);
  return <HTMLImageElement>makeElement('img', {
    src: loc,
    width: '16',
    height: '16',
  });
}

export function groupFromDiv(target: number | HTMLDivElement): GrayTabGroup {
  let div: HTMLDivElement;
  let date: number;
  if (typeof target === 'number') {
    date = target;
    div = DOCUMENT.get().querySelector(`#${keyFromDate(date)}`);
  } else {
    div = target;
    date = dateFromKey(div.id);
  }
  const group: GrayTabGroup = {
    date: date,
    tabs: [],
  };
  if (div == null) return group;
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
  return group;
}

/**
 * Updates the backend to match the DOM for the tab group with the given date.
 */
export async function syncGroupFromDOM(target: number | HTMLDivElement): Promise<void> {
  const group = groupFromDiv(target);
  if (group.tabs.length == 0) {
    return eraseTabGroup(group.date);
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

async function ingestTabs(
  tabSummaries: BrowserTab[],
  groupsNode: HTMLDivElement,
  now = () => new Date().getTime(),
): Promise<void> {
  if (tabSummaries.length == 0) return;
  let counter = 0;
  const group: GrayTabGroup = {
    tabs: tabSummaries.map(ts => {
      return { ...ts, key: counter++ };
    }),
    date: now(),
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

class Debugger {
  async double(): Promise<void> {
    const groups = await loadAllTabGroups();
    let earliest = Math.min(...groups.map(g => g.date));
    const groupDiv = DOCUMENT.get().querySelector('#groups');
    const promises: Promise<void>[] = [];
    for (const group of groups) {
      earliest -= 1000;
      group.date = earliest;
      groupDiv.appendChild(renderGroup(group));
      await syncGroupFromDOM(group.date);
      updateInfo(group.tabs.length);
    }
    await Promise.all(promises);
    console.log(sizeof.default(await loadAllTabGroups()));
  }

  async groupMeta(): Promise<void> {
    const retval: number[] = [];
    let groups = await loadAllTabGroups();
    const first = groups[0];
    retval.push(first.date);
    retval.push(first.tabs.length);
    groups = groups.slice(1);
    for (const group of groups) {
      retval.push(group.date - first.date);
      retval.push(group.tabs.length);
    }
    const encoding = vlq.encode(retval);
    console.log(encoding);
    console.log(sizeof.default(encoding));
    console.log(JSON.stringify(retval));
  }
}

declare global {
  interface Window {
    gt: Debugger;
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

  const window = DOCUMENT.get().defaultView;
  window.gt = new Debugger();
}
