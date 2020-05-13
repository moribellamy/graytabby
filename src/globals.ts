import { browser } from 'webextension-polyfill-ts';
import { BrowserTab } from '../@types/graytabby';
import { Broker } from './brokers';

class Wrapper<T> {
  wrapped: T;

  constructor(init: () => T) {
    try {
      this.set(init());
    } catch (err) {
      // Reference error will happen in tests, e.g. `document` and `window`.
    }
  }

  get(): T {
    return this.wrapped;
  }

  set(t: T): void {
    this.wrapped = t;
  }
}

export const DOCUMENT = new Wrapper(() => document);
export const BROWSER = new Wrapper(() => browser);
export const ARCHIVAL = new Wrapper(() => new Broker<BrowserTab[]>('moreTabs'));
export const PAGE_LOAD = new Wrapper(() => new Broker<void>('pageLoad'));
