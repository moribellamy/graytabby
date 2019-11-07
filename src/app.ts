/**
 * Importing this module (in an HTML page or otherwise) will initialize GrayTabby
 * data structures and will attach the GrayTabby app to DOM elements.
 */

import 'bootstrap'; // JS side of bootstrap.
import './scss/app.scss'; // Webpack uses MiniCssExtractPlugin when it sees this.
import nanoid from 'nanoid';

import { optionsStore, tabsStore } from './storage';
import { KeyedGrayTab, GrayTabGroup, GrayTab } from '../@types/graytabby';
import { faviconLocation, makeElement, snip } from './utils';
import { archival, pageLoad } from './brokers';
import { browser } from 'webextension-polyfill-ts';

async function bindOptions(): Promise<void> {
  const optionsLimitNode = <HTMLInputElement>document.querySelector('#optionsLimit');
  const optionsDupesNode = <HTMLInputElement>document.querySelector('#optionsDupes');
  const optionsAtLoad = await optionsStore.get();

  optionsLimitNode.value = optionsAtLoad.tabLimit.toString();
  optionsDupesNode.checked = optionsAtLoad.archiveDupes;

  // eslint-disable-next-line
  optionsDupesNode.onchange = async () => {
    await optionsStore.put({
      ...(await optionsStore.get()),
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

  // eslint-disable-next-line
  optionsLimitNode.onkeyup = async () => {
    const newLimit = Number(optionsLimitNode.value);
    if (newLimit != NaN) {
      await optionsStore.put({
        ...(await optionsStore.get()),
        tabLimit: newLimit,
      });
    }
  };
}

/**
 * The main entry point for GrayTabby.
 */
async function grayTabby(): Promise<void> {
  await bindOptions();
  const tabGroups = await tabsStore.get();

  const infoNode = <HTMLParagraphElement>document.querySelector('#info');
  const groupsNode = <HTMLDivElement>document.querySelector('#groups');

  function totalTabs(): number {
    return tabGroups.reduce((acc, cur) => acc + cur.tabs.length, 0);
  }

  function removeGroup(group: GrayTabGroup): Element {
    const found = document.querySelector(`[id='${group.key}']`);
    groupsNode.removeChild(found);
    snip(tabGroups, tg => tg.key === group.key);
    return found;
  }

  function updateInfo(): void {
    infoNode.innerText = 'Total tabs: ' + totalTabs().toString();
  }

  function renderFavicon(url: string): HTMLImageElement {
    const loc = faviconLocation(url);
    return <HTMLImageElement>makeElement('img', {
      src: loc,
      width: '16',
      height: '16',
    });
  }

  function renderLinkRow(group: GrayTabGroup, tab: KeyedGrayTab): HTMLDivElement {
    const row = <HTMLDivElement>makeElement('div');
    row.appendChild(renderFavicon(tab.url));
    const a = <HTMLAnchorElement>row.appendChild(makeElement('a', { href: tab.url }, tab.title));
    // eslint-disable-next-line
    a.onclick = event => {
      event.preventDefault();
      browser.tabs.create({ url: tab.url, active: false });
      row.parentElement.removeChild(row);
      snip(group.tabs, t => t.key === tab.key);
      if (group.tabs.length == 0) removeGroup(group);
      tabsStore.put(tabGroups);
      updateInfo();
    };
    return row;
  }

  function renderGroup(group: GrayTabGroup): HTMLDivElement {
    const div = <HTMLDivElement>makeElement('div', { id: group.key, class: 'se-group' });
    div.appendChild(makeElement('span', {}, new Date(group.date * 1000).toLocaleString()));
    const ul = div.appendChild(makeElement('ul'));
    for (const tab of group.tabs) {
      const li = ul.appendChild(makeElement('li'));
      li.appendChild(renderLinkRow(group, tab));
    }
    return div;
  }

  function prependInsideContainer(parent: Element, child: Element): Element {
    if (parent.firstChild == null) parent.appendChild(child);
    else parent.insertBefore(child, parent.firstChild);
    return child;
  }

  if (tabGroups) {
    for (const group of tabGroups) groupsNode.appendChild(renderGroup(group));
  }

  async function ingestTabs(tabSummaries: GrayTab[]): Promise<void> {
    const groupKey = nanoid(9);
    let counter = 0;
    const group: GrayTabGroup = {
      tabs: tabSummaries.map(ts => {
        return { ...ts, key: groupKey + counter++ };
      }),
      key: groupKey,
      date: Math.round(new Date().getTime() / 1000),
    };
    tabGroups.unshift(group);
    prependInsideContainer(groupsNode, renderGroup(group));

    while (totalTabs() > (await optionsStore.get()).tabLimit) {
      removeGroup(tabGroups[tabGroups.length - 1]);
    }

    tabsStore.put(tabGroups);
    updateInfo();
  }

  archival.sub(ingestTabs);
  updateInfo();
}

document.title = 'GrayTabby';

grayTabby().then(() => {
  pageLoad.pub(null);
  console.log('loaded graytabby');
});
