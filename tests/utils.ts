import { expect } from 'chai';
import { JSDOM } from 'jsdom';
import * as mockBrowser from 'sinon-chrome';
import { INDEX_V1_KEY, INDEX_V2_KEY } from '../src/app/tabs';
import { BROWSER, DOCUMENT } from '../src/lib/globals';
import { OPTIONS_KEY } from '../src/lib/options';
import { BrowserTab } from '../src/lib/types';
import SinonChrome from 'sinon-chrome';

export async function stubGlobals(): Promise<void> {
  BROWSER.set(<any>mockBrowser);
  const jsdom = await JSDOM.fromFile('src/app.html');
  DOCUMENT.set(jsdom.window.document);
  mockBrowser.tabs.query.returns([]);
  mockBrowser.storage.local.get.withArgs(INDEX_V1_KEY).returns('[]');
  mockBrowser.storage.local.get.withArgs(OPTIONS_KEY).returns([]);
  mockBrowser.storage.local.get.withArgs(INDEX_V2_KEY).returns([]);
}

export function unstubGlobals(): void {
  BROWSER.set(null);
  DOCUMENT.set(null);
}

export function mockedBrowser(): typeof SinonChrome {
  return <typeof SinonChrome>(<any>BROWSER.get());
}

export function testTab(args: Partial<BrowserTab>): BrowserTab {
  return {
    index: 1,
    highlighted: true,
    active: true,
    pinned: true,
    incognito: false,
    ...args,
  };
}

export function getElements(query: string, parent: ParentNode): Element[] {
  const nodes = parent.querySelectorAll(query);
  return Array.from(nodes);
}

export function assertElement(
  query: string,
  parent: ParentNode = null,
  total = 1,
  idx = 1,
): Element {
  const nodes = getElements(query, parent);
  expect(nodes.length).to.equal(total);
  if (total != 0) return nodes[idx - 1];
  return null;
}
