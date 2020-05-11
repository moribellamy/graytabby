import { Browser } from 'webextension-polyfill-ts';
import * as sinon from 'sinon-chrome';

let registeredBrowser: Browser = null;
let registeredDocument: Document = null;

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
