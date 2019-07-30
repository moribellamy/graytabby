/**
 * Background script. See
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension
 *
 * No "long running logic" is implemented here. This is just the best place to register
 * the handler for the main archival flow.
 */

import { moreTabs, pageLoad } from './brokers';
import { archivePlan } from './archive';
import { appURL, castTab } from './utils';
import { optionsStore } from './storage'
import { browser } from 'webextension-polyfill-ts';

/**
 * Function called when a user clicks on the "browserAction" button.
 * Presently this is the main flow of the GrayTabby app.
 */
async function clickHandler() {
  const allTabs = (await browser.tabs.query({})).map(t => castTab(t));
  const options = await optionsStore.get();
  const keepDupes = options.toggles.indexOf('keepDupes') !== -1;
  let [homeTab, toArchiveTabs, toCloseTabs] = archivePlan(allTabs, appURL(), keepDupes);
  if (!homeTab) {
    homeTab = castTab(await browser.tabs.create({ active: true, url: 'app.html' }));
    await new Promise(resolve => {
      pageLoad.sub((msg, sender) => {
        if (sender.tab && sender.tab.id === homeTab.id) {
          resolve();
        }
      })
    })
  }

  await browser.tabs.remove(toArchiveTabs.map(t => t.id));
  await browser.tabs.remove(toCloseTabs.map(t => t.id));
  let focus = browser.tabs.update(homeTab.id, { active: true });
  if (toArchiveTabs.length > 0) {
    await moreTabs.pub(toArchiveTabs);
  }
  await focus;
}

browser.browserAction.onClicked.addListener(clickHandler);
