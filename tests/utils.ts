import { expect } from 'chai';
import { JSDOM } from 'jsdom';
import * as mockBrowser from 'sinon-chrome';
import { INDEX_V1_KEY, INDEX_V2_KEY } from '../src/lib/tabs_store';
import { BROWSER, DOCUMENT } from '../src/lib/globals';
import { OPTIONS_KEY } from '../src/lib/options';
import { BrowserTab } from '../src/lib/types';
import SinonChrome from 'sinon-chrome';

class FakeStorageArea implements browser.storage.StorageArea {
  map: Map<string, any>;

  constructor() {
    this.map = new Map();
  }

  async get(getRequest?: string | string[] | { [key: string]: any }): Promise<{ [key: string]: any }> {
    let keys: string[];
    const defaults = new Map<string, any>();
    if (typeof getRequest === 'string') keys = [getRequest];
    else if (Array.isArray(getRequest)) keys = getRequest;
    else if (getRequest == undefined) keys = Array.from(this.map.keys());
    else {
      for (const prop in getRequest) {
        keys.push(prop);
        defaults.set(prop, getRequest[prop]);
      }
    }
    const retval: { [key: string]: any } = {};
    for (const key of keys) {
      const val: any = this.map.get(key) || defaults.get(key);
      if (val !== null) retval[key] = val;
    }
    return retval;
  }
  async set(items: { [key: string]: any }): Promise<void> {
    for (const prop in items) {
      this.map.set(prop, items[prop]);
    }
  }
  async remove(removeRequest: string | string[]): Promise<void> {
    let keys: string[];
    if (typeof removeRequest === 'string') keys = [removeRequest];
    else keys = removeRequest;
    for (const key in keys) {
      this.map.delete(key);
    }
  }
  async clear(): Promise<void> {
    this.map.clear();
  }
}

export async function stubGlobalsForTesting(): Promise<void> {
  BROWSER.set(mockBrowser as any);
  const jsdom = await JSDOM.fromFile('src/app.html');
  DOCUMENT.set(jsdom.window.document);
  mockBrowser.tabs.query.returns([]);

  // @ts-ignore
  global.document = jsdom.window.document;
  // @ts-ignore
  global.HTMLElement = jsdom.window.HTMLElement;

  const fakeStorage = new FakeStorageArea();
  (mockBrowser['storage'] as any) = {
    local: {
      get: fakeStorage.get.bind(fakeStorage),
      set: fakeStorage.set.bind(fakeStorage),
      remove: fakeStorage.get.bind(fakeStorage),
      clear: fakeStorage.clear.bind(fakeStorage),
    },
  };
}

export function unstubGlobals(): void {
  BROWSER.set(null);
  DOCUMENT.set(null);
}

export function mockedBrowser(): typeof SinonChrome {
  return (BROWSER.get() as any) as typeof SinonChrome;
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
