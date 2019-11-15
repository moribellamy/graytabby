import { archival, pageLoad } from './brokers';
import { actionButtonArchivePlan } from './archive';
import { appURL } from './utils';
import { optionsStore } from './storage';
import { browser } from 'webextension-polyfill-ts';
import { SavedPage } from '../@types/graytabby';

export async function actionButtonClickHandler(): Promise<void> {
  const [nativeTabs, options] = await Promise.all([browser.tabs.query({}), optionsStore.get()]);
  // eslint-disable-next-line
  let [homeTab, toArchiveTabs, toCloseTabs] = actionButtonArchivePlan(nativeTabs, appURL(), options.archiveDupes);
  if (!homeTab) {
    homeTab = await browser.tabs.create({ active: true, url: 'app.html' });
    await new Promise(resolve => {
      pageLoad.sub((_, sender) => {
        if (sender.tab && sender.tab.id === homeTab.id) {
          resolve();
        }
      });
    });
  }

  await Promise.all([
    browser.tabs.remove(toArchiveTabs.map(t => t.id)),
    browser.tabs.remove(toCloseTabs.map(t => t.id)),
    browser.tabs.update(homeTab.id, { active: true }),
    toArchiveTabs.length > 0 ? archival.pub(toArchiveTabs) : null,
  ]);
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
