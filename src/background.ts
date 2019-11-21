/**
 * Background script. See
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension
 *
 * No "long running logic" is implemented here. This is just the best place to register handlers.
 */

import { browser } from 'webextension-polyfill-ts';
import { actionButtonClickHandler, saveAsFavorites, restoreFavorites, archiveOthersHandler } from './clickHandlers';
import { setDocument, setBrowser } from './globals';

setBrowser(browser);
setDocument(document);

browser.browserAction.onClicked.addListener(actionButtonClickHandler);

browser.contextMenus.create({
  contexts: ['browser_action'],
  title: 'Save current tabs as favorites',
  onclick: saveAsFavorites,
});

browser.contextMenus.create({
  contexts: ['browser_action'],
  title: 'Restore favorite tabs',
  onclick: restoreFavorites,
});

browser.contextMenus.create({
  contexts: ['tab'],
  title: 'Archive...',
  onclick: () => console.log('did it'),
});

browser.contextMenus.create({
  contexts: ['tab'],
  title: '  Left',
  onclick: (onClickData, tab) => console.log('did it', onClickData, tab),
});

browser.contextMenus.create({
  contexts: ['tab'],
  title: '  Right',
  onclick: () => console.log('did it'),
});

browser.contextMenus.create({
  contexts: ['tab'],
  title: '  Others',
  onclick: archiveOthersHandler,
});
