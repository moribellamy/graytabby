/**
 * Background script. See
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension
 *
 * No "long running logic" is implemented here. This is just the best place to register handlers.
 *
 * Not included in coverage reports, so don't put non-trivial logic here.
 */

import { Menus } from 'webextension-polyfill-ts';
import {
  archiveHandler,
  archiveLeftHandler,
  archiveOnlyHandler,
  archiveOthersHandler,
  archiveRightHandler,
} from './archive';
import { saveAsFavorites, restoreFavorites } from './options';
import { BROWSER } from './globals';

async function init(): Promise<void> {
  BROWSER.get().browserAction.onClicked.addListener(archiveHandler);
  let isFirefox = false;
  try {
    const info = await BROWSER.get().runtime.getBrowserInfo();
    if (info.name.toLowerCase() === 'firefox') {
      isFirefox = true;
    }
  } catch {
    // let isFirefox stay false
  }

  const contexts: Menus.ContextType[] = isFirefox ? ['tab', 'browser_action'] : ['browser_action'];

  BROWSER.get().contextMenus.create({
    contexts: contexts,
    title: 'Save current tabs as favorites',
    onclick: saveAsFavorites,
  });

  BROWSER.get().contextMenus.create({
    contexts: contexts,
    title: 'Restore favorite tabs',
    onclick: restoreFavorites,
  });

  BROWSER.get().contextMenus.create({
    contexts: contexts,
    title: 'Archive...',
    onclick: archiveOnlyHandler,
  });

  BROWSER.get().contextMenus.create({
    contexts: contexts,
    title: '  Left',
    onclick: archiveLeftHandler,
  });

  BROWSER.get().contextMenus.create({
    contexts: contexts,
    title: '  Right',
    onclick: archiveRightHandler,
  });

  BROWSER.get().contextMenus.create({
    contexts: contexts,
    title: '  Others',
    onclick: archiveOthersHandler,
  });
}

init().then(
  () => {
    console.log('loaded graytabby backend');
  },
  err => {
    console.error(err);
  },
);
