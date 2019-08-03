import { Options, TabGroup } from '../@types/graytabby';
import { browser } from 'webextension-polyfill-ts';

export class Store<PayloadT> {
  protected key: string;
  protected init: Promise<void>;

  constructor(key: string, def: PayloadT) {
    this.key = key;
    this.init = this.initialize(def);
  }

  private async initialize(def: PayloadT): Promise<void> {
    const existing = await this.get();
    if (existing == null) {
      await this.put(def);
    }
  }

  public async put(value: PayloadT): Promise<void> {
    await this.init;
    let strVal = JSON.stringify(value);
    let record: { [key: string]: string } = {};
    record[this.key] = strVal;
    return browser.storage.local.set(record);
  }

  public async get(): Promise<PayloadT | null> {
    await this.init;
    let itemStr = (await browser.storage.local.get([this.key]))[this.key];
    return JSON.parse(itemStr || 'null');
  }

  public async clear(): Promise<void> {
    await this.init;
    await browser.storage.local.remove(this.key);
  }
}

export const optionsStore = new Store<Options>('options', {
  tabLimit: 10000,
  toggles: []
});
export const tabsStore = new Store<TabGroup[]>('tabGroups', []);
