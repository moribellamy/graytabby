import { BROWSER, DOCUMENT, ARCHIVAL } from '../lib/globals';
import { updateInfo, getTotalTabs } from './info_ui';
import {
  keyFromDate,
  dateFromKey,
  GrayTabGroup,
  GrayTab,
  eraseTabGroup,
  saveTabGroup,
  keyFromGroup,
  loadAllTabGroups,
} from './tabs_store';
import { makeElement } from './dom';
import { getOptions } from '../lib/options';
import { BrowserTab } from '../lib/types';

function prependInsideContainer(parent: Element, child: Element): Element {
  if (parent.firstChild == null) parent.appendChild(child);
  else parent.insertBefore(child, parent.firstChild);
  return child;
}

function countGroups(): number {
  return DOCUMENT.get().querySelectorAll('#groups > div').length;
}

function faviconLocation(url: string): string {
  const domain = new URL(url).hostname;
  if (domain) return `https://www.google.com/s2/favicons?domain=${domain}`;
  return '';
}

function renderFavicon(url: string): HTMLImageElement {
  const loc = faviconLocation(url);
  return <HTMLImageElement>makeElement('img', {
    src: loc,
    width: '16',
    height: '16',
  });
}

function groupFromDiv(target: number | HTMLDivElement): GrayTabGroup {
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
async function syncGroupFromDOM(target: number | HTMLDivElement): Promise<void> {
  const group = groupFromDiv(target);
  if (group.tabs.length == 0) {
    return eraseTabGroup(group.date);
  }
  return saveTabGroup(group);
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

export async function ingestTabs(
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
  while (getTotalTabs() > tabLimit && countGroups() > 1) {
    const victim = <HTMLDivElement>DOCUMENT.get().querySelector('#groups>div:last-child');
    const removed = victim.querySelectorAll('li').length;
    updateInfo(-removed);
    await eraseTabGroup(dateFromKey(victim.id));
    victim.remove();
  }
}

export async function bindTabs(): Promise<void> {
  const groupsNode = <HTMLDivElement>DOCUMENT.get().querySelector('#groups');
  let counter = 0;
  for (const group of await loadAllTabGroups()) {
    counter += group.tabs.length;
    groupsNode.appendChild(renderGroup(group));
  }
  ARCHIVAL.get().sub(summaries => ingestTabs(summaries, groupsNode));
  updateInfo(counter);
}
