import { archival, pageLoad } from './brokers';
import { archivePlan } from './archive';
import { appURL, castTab } from './utils';
import { optionsStore } from './storage';
import { browser } from 'webextension-polyfill-ts';
import { TabSummary } from '../@types/graytabby';
/**
 * Function called when a user clicks on the "browserAction" button.
 * Presently this is the main flow of the GrayTabby app.
 *
 * @returns The list of TabSummarys we sent for archival.
 */
export async function clickHandler() {
  const [nativeTabs, options] = await Promise.all([
    browser.tabs.query({}),
    optionsStore.get()
  ]);
  const allTabs = nativeTabs.map(t => castTab(t));
  const keepDupes = options.toggles.indexOf('keepDupes') !== -1;
  let [homeTab, toArchiveTabs, toCloseTabs] = archivePlan(allTabs, appURL(), keepDupes);
  if (!homeTab) {
    homeTab = castTab(await browser.tabs.create({ active: true, url: 'app.html' }));
    await new Promise(resolve => {
      pageLoad.sub((msg, sender) => {
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
    toArchiveTabs.length > 0 ? archival.pub(toArchiveTabs) : null
  ]);
}