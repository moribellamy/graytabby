import { archival, pageLoad } from './brokers';
import { actionButtonArchivePlan } from './archive';
import { appURL } from './utils';
import { optionsStore } from './storage';
import { browser } from 'webextension-polyfill-ts';

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
