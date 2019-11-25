/**
 * Background script. See
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension
 *
 * No "long running logic" is implemented here. This is just the best place to register handlers.
 *
 * Not included in coverage reports, so don't put non-trivial logic here.
 */

import { browser } from 'webextension-polyfill-ts';
import {
  archiveHandler,
  archiveLeftHandler,
  archiveOnlyHandler,
  archiveOthersHandler,
  archiveRightHandler,
  restoreFavorites,
  saveAsFavorites,
} from './clickHandlers';
import { getBrowser, setBrowser, setDocument } from './globals';

setBrowser(browser);
setDocument(document);

getBrowser().browserAction.onClicked.addListener(archiveHandler);

getBrowser().contextMenus.create({
  contexts: ['browser_action'],
  title: 'Save current tabs as favorites',
  onclick: saveAsFavorites,
});

getBrowser().contextMenus.create({
  contexts: ['browser_action'],
  title: 'Restore favorite tabs',
  onclick: restoreFavorites,
});

getBrowser().contextMenus.create({
  contexts: ['tab'],
  title: 'Archive...',
  onclick: archiveOnlyHandler,
});

getBrowser().contextMenus.create({
  contexts: ['tab'],
  title: '  Left',
  onclick: archiveLeftHandler,
});

getBrowser().contextMenus.create({
  contexts: ['tab'],
  title: '  Right',
  onclick: archiveRightHandler,
});

getBrowser().contextMenus.create({
  contexts: ['tab'],
  title: '  Others',
  onclick: archiveOthersHandler,
});
