/**
 * Importing this module (in an HTML page or otherwise) will initialize GrayTabby
 * data structures and will attach the GrayTabby app to DOM elements.
 */

import 'bootstrap'  // JS side of bootstrap.
import './scss/app.scss';  // Webpack uses MiniCssExtractPlugin when it sees this.
import nanoid from 'nanoid';

import { optionsStore, tabsStore } from './storage';
import { KeyedGrayTab, GrayTabGroup, GrayTab } from '../@types/graytabby';
import { faviconLocation, makeElement, snip } from './utils';
import { archival, pageLoad } from './brokers';
import { browser } from 'webextension-polyfill-ts';

async function bindOptions() {
  let optionsLimitNode = <HTMLInputElement>document.querySelector('#optionsLimit');
  let optionsDupesNode = <HTMLInputElement>document.querySelector('#optionsDupes');
  let optionsAtLoad = await optionsStore.get();

  optionsLimitNode.value = optionsAtLoad.tabLimit.toString();
  optionsDupesNode.checked = optionsAtLoad.archiveDupes;

  optionsDupesNode.onchange = async e => {
    await optionsStore.put({
      ...(await optionsStore.get()),
      archiveDupes: optionsDupesNode.checked
    })
  }

  // From https://stackoverflow.com/questions/469357/html-text-input-allow-only-numeric-input
  // HTML5 validators have poor support at the moment.
  optionsLimitNode.onkeydown = e => {
    return (
      e.ctrlKey || e.altKey
      || (47 < e.keyCode && e.keyCode < 58 && e.shiftKey == false)
      || (95 < e.keyCode && e.keyCode < 106)
      || (e.keyCode == 8) || (e.keyCode == 9)
      || (e.keyCode > 34 && e.keyCode < 40)
      || (e.keyCode == 46)
    )
  }

  optionsLimitNode.onkeyup = async e => {
    let newLimit = Number(optionsLimitNode.value)
    if (newLimit != NaN) {
      await optionsStore.put({
        ...(await optionsStore.get()),
        tabLimit: newLimit
      })
    }
  }
}


/**
 * The main entry point for GrayTabby.
 */
async function grayTabby() {
  await bindOptions();
  let tabGroups = await tabsStore.get();

  let infoNode = <HTMLParagraphElement>document.querySelector('#info');
  let groupsNode = <HTMLDivElement>document.querySelector('#groups')

  function totalTabs(): number {
    return tabGroups.reduce(
      (acc, cur) => acc + cur.tabs.length, 0
    )
  }

  function removeGroup(group: GrayTabGroup): Element {
    let found = document.querySelector(`[id='${group.key}']`);
    groupsNode.removeChild(found);
    snip(tabGroups, tg => tg.key === group.key);
    return found;
  }

  function updateInfo(): void {
    infoNode.innerText = 'Total tabs: ' + totalTabs().toString();
  }

  function renderLinkRow(group: GrayTabGroup, tab: KeyedGrayTab): HTMLDivElement {
    let row = <HTMLDivElement>makeElement('div');
    row.appendChild(renderFavicon(tab.url));
    let a = <HTMLAnchorElement>row.appendChild(
      makeElement('a', { href: tab.url }, tab.title));
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
    let div = <HTMLDivElement>makeElement('div', { 'id': group.key, 'class': 'se-group' });
    div.appendChild(makeElement('span', {}, new Date(group.date * 1000).toLocaleString()));
    let ul = div.appendChild(makeElement('ul'));
    for (let tab of group.tabs) {
      let li = ul.appendChild(makeElement('li'));
      li.appendChild(renderLinkRow(group, tab));
    }
    return div;
  }

  function renderFavicon(url: string): HTMLImageElement {
    let loc = faviconLocation(url);
    return <HTMLImageElement>makeElement('img', {
      src: loc,
      width: '16',
      height: '16'
    });
  }

  function prependInsideContainer(parent: Element, child: Element): Element {
    if (parent.firstChild == null) parent.appendChild(child);
    else parent.insertBefore(child, parent.firstChild);
    return child;
  }

  if (tabGroups) {
    for (let group of tabGroups) groupsNode.appendChild(renderGroup(group));
  }

  async function ingestTabs(tabSummaries: GrayTab[]) {
    let groupKey = nanoid(9);
    let counter = 0;
    let group: GrayTabGroup = {
      tabs: tabSummaries.map(ts => {
        return { ...ts, key: groupKey + counter++ }
      }),
      key: groupKey,
      date: Math.round(new Date().getTime() / 1000)
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
  console.log('loaded graytabby')
});
