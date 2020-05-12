import * as sinon from 'sinon-chrome';
import { Browser, browser } from 'webextension-polyfill-ts';
import { BrowserTab } from '../@types/graytabby';
import { Broker } from './brokers';

let registeredDocument: Document = null;
let registeredBrowser: Browser = browser;
let registeredArchival: Broker<BrowserTab[]> = new Broker<BrowserTab[]>('moreTabs');
let registeredPageLoad: Broker<void> = new Broker<void>('pageLoad');

try {
  registeredDocument = document;
} catch (err) {
  // Reference error, will happen in tests
}

export function getBrowser(): Browser {
  return registeredBrowser;
}

export function setBrowser(browser: Browser | typeof sinon): void {
  registeredBrowser = <Browser>browser;
}

export function getDocument(): Document {
  return registeredDocument;
}

export function setDocument(document: Document): void {
  registeredDocument = document;
}

export function setArchival(archival: Broker<BrowserTab[]>): void {
  registeredArchival = archival;
}

export function getArchival(): Broker<BrowserTab[]> {
  return registeredArchival;
}

export function setPageLoad(pageLoad: Broker<void>): void {
  registeredPageLoad = pageLoad;
}

export function getPageLoad(): Broker<void> {
  return registeredPageLoad;
}
