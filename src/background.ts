/**
 * Background script. See
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension
 *
 * No "long running logic" is implemented here. This is just the best place to register handlers.
 */

import { browser } from 'webextension-polyfill-ts';
import {
  archiveHandler,
  saveAsFavorites,
  restoreFavorites,
  archiveOthersHandler,
  archiveRightHandler,
  archiveLeftHandler,
  archiveOnlyHandler,
} from './clickHandlers';
import { setDocument, setBrowser } from './globals';

setBrowser(browser);
setDocument(document);

browser.browserAction.onClicked.addListener(archiveHandler);

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
  onclick: archiveOnlyHandler,
});

browser.contextMenus.create({
  contexts: ['tab'],
  title: '  Left',
  onclick: archiveLeftHandler,
});

browser.contextMenus.create({
  contexts: ['tab'],
  title: '  Right',
  onclick: archiveRightHandler,
});

browser.contextMenus.create({
  contexts: ['tab'],
  title: '  Others',
  onclick: archiveOthersHandler,
});
