/**
 * Background script. See
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension
 *
 * No "long running logic" is implemented here. This is just the best place to register
 * the handler for the main archival flow.
 */

import { browser } from 'webextension-polyfill-ts';
import { clickHandler } from './clickHandler';
import { archivalRequest } from './brokers';

browser.browserAction.onClicked.addListener(clickHandler);  // For prod.
archivalRequest.sub(clickHandler);  // For testing.
