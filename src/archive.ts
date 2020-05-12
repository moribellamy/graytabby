import { BrowserTab, OnClickData } from '../@types/graytabby';
import { getBrowser, getPageLoad, getArchival } from './globals';
import { appURL } from './utils';
import { getOptions } from './options';

function shouldJustClose(url: string): boolean {
  const neverEqualList = ['chrome://newtab/', ''];
  const neverStartWithList = ['about:', 'data:'];
  for (const datum of neverEqualList) {
    if (datum === url) return true;
  }
  for (const datum of neverStartWithList) {
    if (url.startsWith(datum)) return true;
  }
  return false;
}

/**
 * Figures out which tabs get archived and which get closed.
 *
 * @param browserTabs All tabs which are candidates for archival.
 * @param homeURL The URL that indicates a tab is a GrayTabby home tab
 * @param archiveDupes If false, multiple instances of the same page are collapsed in
 * to one entry during the archive operation.
 * @returns a tuple. The first element is a list of tabs that need to be
 * archived. Second element is tabs that will just be closed and not archived.
 * None of the GrayTabby tabs are counted in either member.
 */
function archivePlan(
  browserTabs: BrowserTab[],
  homeURL: string,
  archiveDupes: boolean,
): [BrowserTab[], BrowserTab[]] {
  const tabsToArchive: BrowserTab[] = [];
  const tabsToClose: BrowserTab[] = [];
  const seen: Set<string> = new Set();

  for (const tab of browserTabs) {
    if (tab.url === homeURL || tab.pinned) continue;
    else if (seen.has(tab.url) && !archiveDupes) tabsToClose.push(tab);
    else if (shouldJustClose(tab.url)) tabsToClose.push(tab);
    else {
      tabsToArchive.push(tab);
      seen.add(tab.url);
    }
  }

  return [tabsToArchive, tabsToClose];
}

function numberCmp(a: number | undefined, b: number | undefined): number {
  if (a == b && b == undefined) return 0; // ...or one is truthy
  if (a == undefined) return 1;
  if (b == undefined) return -1;
  return a - b;
}

function tabCmp(a: BrowserTab, b: BrowserTab): number {
  if (a.pinned != b.pinned) return a.pinned ? -1 : 1;
  const winCmp = numberCmp(a.windowId, b.windowId);
  if (winCmp != 0) return winCmp;
  return numberCmp(a.id, b.id);
}

export async function ensureExactlyOneHomeTab(): Promise<BrowserTab> {
  const homeTabs = await getBrowser().tabs.query({ url: appURL() });
  if (homeTabs.length > 0) {
    homeTabs.sort(tabCmp);
    const toClose: number[] = [];
    if (homeTabs.length > 1) {
      for (let i = 1; i < homeTabs.length; i++) {
        toClose.push(homeTabs[i].id);
      }
    }
    await getBrowser().tabs.remove(toClose);
    return homeTabs[0];
  } else {
    const loaded = new Promise(resolve => {
      getPageLoad().sub((_, sender, unsub) => {
        if (sender.tab && sender.tab.url === appURL()) {
          unsub();
          resolve();
        }
      });
    });
    const homeTab = await getBrowser().tabs.create({ active: true, url: appURL() });
    await loaded;
    return homeTab;
  }
}

async function doArchive(func: (arg0: BrowserTab) => boolean): Promise<void> {
  const [, options] = await Promise.all([ensureExactlyOneHomeTab(), getOptions()]);
  const tabs = await getBrowser().tabs.query({});
  const [toArchiveTabs, toCloseTabs] = archivePlan(
    tabs.filter(func),
    appURL(),
    options.archiveDupes,
  );
  await Promise.all([
    getBrowser().tabs.remove(toArchiveTabs.map(t => t.id)),
    getBrowser().tabs.remove(toCloseTabs.map(t => t.id)),
    getArchival().pub(toArchiveTabs),
  ]);
}

export async function archiveHandler(): Promise<void> {
  await doArchive(() => true);
  const homeTab = await ensureExactlyOneHomeTab();
  await getBrowser().tabs.update(homeTab.id, { active: true });
}

export async function archiveOthersHandler(_data: OnClickData, tab: BrowserTab): Promise<void> {
  return doArchive(t => t.windowId == tab.windowId && t.id != tab.id);
}

export async function archiveLeftHandler(_data: OnClickData, tab: BrowserTab): Promise<void> {
  return doArchive(t => t.windowId == tab.windowId && t.index < tab.index);
}

export async function archiveRightHandler(_data: OnClickData, tab: BrowserTab): Promise<void> {
  return doArchive(t => t.windowId == tab.windowId && t.index > tab.index);
}

export async function archiveOnlyHandler(_data: OnClickData, tab: BrowserTab): Promise<void> {
  return doArchive(t => t.id == tab.id);
}
