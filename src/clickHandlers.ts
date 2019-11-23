import { archival, pageLoad } from './brokers';
import { archivePlan } from './archive';
import { appURL } from './utils';
import { optionsStore } from './storage';
import { browser } from 'webextension-polyfill-ts';
import { SavedPage, BrowserTab, OnClickData, GrayTab } from '../@types/graytabby';

function numberCmp(a: number | undefined, b: number | undefined): number {
  if (a == b && b == undefined) return 0; // ...or one is truthy
  if (a == undefined) return 1;
  if (b == undefined) return -1;
  return a - b;
}

export function tabCmp(a: GrayTab, b: GrayTab): number {
  if (a.pinned != b.pinned) return a.pinned ? -1 : 1;
  const winCmp = numberCmp(a.windowId, b.windowId);
  if (winCmp != 0) return winCmp;
  return numberCmp(a.id, b.id);
}

export async function ensureExactlyOneHomeTab(): Promise<BrowserTab> {
  const homeTabs = await browser.tabs.query({ url: appURL() });
  if (homeTabs.length > 0) {
    homeTabs.sort(tabCmp);
    const toClose: number[] = [];
    if (homeTabs.length > 1) {
      for (let i = 1; i < homeTabs.length; i++) {
        toClose.push(homeTabs[i].id);
      }
    }
    await browser.tabs.remove(toClose);
    return homeTabs[0];
  } else {
    const homeTab = await browser.tabs.create({ active: true, url: 'app.html' });
    await new Promise(resolve => {
      pageLoad.sub((_, sender) => {
        if (sender.tab && sender.tab.id === homeTab.id) {
          resolve();
        }
      });
    });
    return homeTab;
  }
}

export async function saveAsFavorites(): Promise<void> {
  const tabs = await browser.tabs.query({});
  const saved: SavedPage[] = [];
  for (const tab of tabs) {
    saved.push({
      pinned: tab.pinned,
      url: tab.url,
    });
  }
  await optionsStore.put({
    ...(await optionsStore.get()),
    homeGroup: saved,
  });
}

export async function restoreFavorites(): Promise<void> {
  const homeGroup = (await optionsStore.get()).homeGroup;
  if (homeGroup.length === 0) return;

  const createdPromises = Promise.all(
    homeGroup.map(saved => browser.tabs.create({ pinned: saved.pinned, url: saved.url })),
  );
  const newTabs = new Set((await createdPromises).map(t => t.id));

  const tabs = await browser.tabs.query({});
  const toRemove = tabs.filter(t => !newTabs.has(t.id)).map(t => t.id);
  await browser.tabs.remove(toRemove);
}

async function doArchive(func: (arg0: BrowserTab) => boolean): Promise<void> {
  const [homeTab, options] = await Promise.all([ensureExactlyOneHomeTab(), optionsStore.get()]);
  const tabs = await browser.tabs.query({});
  const [toArchiveTabs, toCloseTabs] = archivePlan(tabs.filter(func), appURL(), options.archiveDupes);
  await Promise.all([
    browser.tabs.remove(toArchiveTabs.map(t => t.id)),
    browser.tabs.remove(toCloseTabs.map(t => t.id)),
    browser.tabs.update(homeTab.id, { active: true }),
    archival.pub(toArchiveTabs),
  ]);
}

export async function archiveHandler(): Promise<void> {
  return doArchive(() => true);
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
