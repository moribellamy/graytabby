import { BrowserTab, GrayTabGroup, GrayTab } from '../@types/graytabby';
import { getBrowser, getDocument, getArchival } from './globals';
import { faviconLocation, makeElement, snip } from './utils';
import { loadAllTabGroups, eraseTabGroup, saveTabGroup, keyFromGroup } from './tabs';
import { getOptions, setOptions } from './options';

async function bindOptions(): Promise<void> {
  const modal = <HTMLDivElement>getDocument().querySelector('#optionsModal');
  const button = <HTMLDivElement>getDocument().querySelector('#optionsButton');
  const close = <HTMLDivElement>getDocument().querySelector('#optionsModal .close');
  button.onclick = () => (modal.style.display = 'block');
  close.onclick = () => (modal.style.display = 'none');

  const optionsLimitNode = <HTMLInputElement>getDocument().querySelector('#optionsLimit');
  const optionsDupesNode = <HTMLInputElement>getDocument().querySelector('#optionsDupes');
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

function patchWindow(): void {
  getDocument().defaultView.getOptions = getOptions;
}

/**
 * The main entry point for GrayTabby.
 */
export async function grayTabby(): Promise<void> {
  getDocument().title = 'GrayTabby';

  await bindOptions();
  const tabGroups = await loadAllTabGroups();

  const infoNode = <HTMLParagraphElement>getDocument().querySelector('#info');
  const groupsNode = <HTMLDivElement>getDocument().querySelector('#groups');

  function totalTabs(): number {
    return tabGroups.reduce((acc, cur) => acc + cur.tabs.length, 0);
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

  function renderLinkRow( // TODO async?
    group: GrayTabGroup,
    tab: GrayTab,
    deleteFunc: () => void,
  ): HTMLDivElement {
    const row = <HTMLDivElement>makeElement('div');
    row.appendChild(renderFavicon(tab.url));
    const a = <HTMLAnchorElement>row.appendChild(makeElement('a', { href: tab.url }, tab.title));
    a.onclick = event => {
      event.preventDefault();
      getBrowser().tabs.create({ url: tab.url, active: false });
      row.remove();
      snip(group.tabs, t => t.key === tab.key);
      if (group.tabs.length == 0) {
        eraseTabGroup(group.date);
        deleteFunc();
      } else {
        saveTabGroup(group);
      }
      updateInfo();
    };
    return row;
  }

  function renderGroup(group: GrayTabGroup): HTMLDivElement {
    const div = <HTMLDivElement>makeElement('div', { id: keyFromGroup(group) });
    div.appendChild(makeElement('span', {}, new Date(group.date).toLocaleString()));
    const ul = div.appendChild(makeElement('ul'));
    for (const tab of group.tabs) {
      const li = ul.appendChild(makeElement('li'));
      li.appendChild(renderLinkRow(group, tab, () => div.remove()));
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

  async function ingestTabs(tabSummaries: BrowserTab[]): Promise<void> {
    if (tabSummaries.length == 0) return;
    let counter = 0;
    const group: GrayTabGroup = {
      tabs: tabSummaries.map(ts => {
        return { ...ts, key: counter++ };
      }),
      date: Math.round(new Date().getTime()),
    };
    tabGroups.unshift(group);
    prependInsideContainer(groupsNode, renderGroup(group));
    saveTabGroup(group);

    const tabLimit = (await getOptions()).tabLimit;
    while (totalTabs() > tabLimit) {
      const victim = tabGroups.pop();
      const div = getDocument().querySelector(`#${keyFromGroup(victim)}`);
      div.remove();
      eraseTabGroup(victim.date);
    }

    updateInfo();
  }

  getArchival().sub(ingestTabs);
  updateInfo();
  patchWindow();
}
