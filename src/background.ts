/**
 * Background script. See
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension
 *
 * No "long running logic" is implemented here. This is just the best place to register handlers.
 *
 * Not included in coverage reports, so don't put non-trivial logic here.
 */

import { browser, Menus } from 'webextension-polyfill-ts';
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

async function init(): Promise<void> {
  console.log('init');
  getBrowser().browserAction.onClicked.addListener(archiveHandler);
  let isFirefox = false;
  try {
    const info = await getBrowser().runtime.getBrowserInfo();
    if (info.name.toLowerCase() === 'firefox') {
      isFirefox = true;
    }
  } catch {
    // let isFirefox stay false
  }

  const contexts: Menus.ContextType[] = isFirefox ? ['tab', 'browser_action'] : ['browser_action'];

  getBrowser().contextMenus.create({
    contexts: contexts,
    title: 'Save current tabs as favorites',
    onclick: saveAsFavorites,
  });

  getBrowser().contextMenus.create({
    contexts: contexts,
    title: 'Restore favorite tabs',
    onclick: restoreFavorites,
  });

  getBrowser().contextMenus.create({
    contexts: contexts,
    title: 'Archive...',
    onclick: archiveOnlyHandler,
  });

  getBrowser().contextMenus.create({
    contexts: contexts,
    title: '  Left',
    onclick: archiveLeftHandler,
  });

  getBrowser().contextMenus.create({
    contexts: contexts,
    title: '  Right',
    onclick: archiveRightHandler,
  });

  getBrowser().contextMenus.create({
    contexts: contexts,
    title: '  Others',
    onclick: archiveOthersHandler,
  });
}

init();
