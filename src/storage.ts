import { Options, TabGroup } from "../@types/graytabby";
import { isFireFox } from "./ext";

export class Store<PayloadT> {
  protected key: string;

  constructor(key: string) {
    this.key = key;
  }

  public async put(value: PayloadT): Promise<void> {
    let strVal = JSON.stringify(value);
    let record: { [key: string]: string } = {};
    record[this.key] = strVal;
    if (isFireFox()) {
      return browser.storage.local.set(record)
    } else {
      return new Promise(resolve => chrome.storage.local.set(record, resolve));
    }
  }

  public async get(): Promise<PayloadT | null> {
    let itemStr: string;
    if (isFireFox()) {
      itemStr = (await browser.storage.local.get([this.key]))[this.key];
    } else {
      itemStr = await new Promise((resolve) =>
        chrome.storage.local.get([this.key], items =>
          resolve(items[this.key])));
    }
    return JSON.parse(itemStr || 'null');
  }

  public async clear(): Promise<void> {
    if (isFireFox()) {
      await browser.storage.local.remove(this.key);
    } else {
      await new Promise(resolve =>
        chrome.storage.local.remove(this.key, resolve))
    }
  }
}

export const optionsStore = new Store<Options>('options');
export const tabsStore = new Store<TabGroup[]>('tabGroups');
