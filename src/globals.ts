import { Browser } from 'webextension-polyfill-ts';

let registeredBrowser: Browser = null;
let registeredDocument: Document = null;

export function getBrowser(): Browser {
  return registeredBrowser;
}

export function setBrowser(browser: Browser): void {
  registeredBrowser = browser;
}

export function getDocument(): Document {
  return registeredDocument;
}

export function setDocument(document: Document): void {
  registeredDocument = document;
}
