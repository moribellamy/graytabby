import { Options, GrayTabGroup } from '../@types/graytabby';
import { browser } from 'webextension-polyfill-ts';

export class Store<PayloadT> {
  protected key: string;
  protected def: PayloadT;

  constructor(key: string, def: PayloadT) {
    this.key = key;
    this.def = def;
  }

  public async put(value: PayloadT): Promise<void> {
    const strVal = JSON.stringify(value);
    const record: { [key: string]: string } = {};
    record[this.key] = strVal;
    return browser.storage.local.set(record);
  }

  public async get(): Promise<PayloadT> {
    const itemStr = (await browser.storage.local.get([this.key]))[this.key];
    if (itemStr) return JSON.parse(itemStr);
    return this.def;
  }

  public async clear(): Promise<void> {
    return browser.storage.local.remove(this.key);
  }
}

export const optionsStore = new Store<Options>('options', {
  tabLimit: 10000,
  archiveDupes: false,
  homeGroup: [],
});
export const tabsStore = new Store<GrayTabGroup[]>('tabGroups', []);
