/**
 * Background script. See
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension
 *
 * No "long running logic" is implemented here. This is just the best place to register
 * the handler for the main archival flow.
 */

import { browser } from 'webextension-polyfill-ts';
import { clickHandler } from './clickHandler';
import { optionsStore } from './storage';
import { SavedPage } from '../@types/graytabby';

browser.browserAction.onClicked.addListener(clickHandler);

browser.contextMenus.create({
  contexts: ['browser_action'],
  title: 'Save current tabs as favorites',
  onclick: async () => {
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
  },
});

browser.contextMenus.create({
  contexts: ['browser_action'],
  title: 'Restore favorite tabs',
  onclick: async () => {
    const homeGroup = (await optionsStore.get()).homeGroup;
    if (homeGroup.length === 0) return;

    const createdPromises = Promise.all(
      homeGroup.map(saved => browser.tabs.create({ pinned: saved.pinned, url: saved.url })),
    );
    const newTabs = new Set((await createdPromises).map(t => t.id));

    const tabs = await browser.tabs.query({});
    const toRemove = tabs.filter(t => !newTabs.has(t.id)).map(t => t.id);
    await browser.tabs.remove(toRemove);
  },
});
