import { BrowserTab } from '../@types/graytabby';
import * as assert from 'assert';
import { BROWSER, DOCUMENT } from '../src/globals';
import * as mockBrowser from 'sinon-chrome';
import { JSDOM } from 'jsdom';
import { INDEX_V1_KEY, INDEX_V2_KEY } from '../src/tabs';
import { OPTIONS_KEY } from '../src/options';
import { grayTabby } from '../src/ui';

export async function initGrayTabby(): Promise<void> {
  BROWSER.set(<any>mockBrowser);
  const jsdom = await JSDOM.fromFile('src/app.html');
  DOCUMENT.set(jsdom.window.document);
  mockBrowser.tabs.query.returns([]);
  mockBrowser.storage.local.get.withArgs(INDEX_V1_KEY).returns('[]');
  mockBrowser.storage.local.get.withArgs(OPTIONS_KEY).returns([]);
  mockBrowser.storage.local.get.withArgs(INDEX_V2_KEY).returns([]);
  try {
    return await grayTabby();
  } catch (err) {
    assert.fail('Uncaught error: ' + err);
  }
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
  assert.equal(nodes.length, total);
  if (total != 0) return nodes[idx - 1];
  return null;
}
