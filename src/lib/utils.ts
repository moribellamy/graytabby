import { BROWSER } from './globals';

export function clamp(num: number, min: number, max: number): number {
  return num <= min ? min : num >= max ? max : num;
}

export function setOnlyChild(elem: HTMLElement, child: HTMLElement): void {
  elem.innerHTML = '';
  elem.appendChild(child);
}

export function getOnlyChild(elem: HTMLElement): Element {
  return elem.children.item(0);
}

// Cribbed from https://stackoverflow.com/questions/44203045/remove-fields-from-typescript-interface-object
export function fieldKeeper<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  const copy = {} as Pick<T, K>;
  keys.forEach(key => (copy[key] = obj[key]));
  return copy;
}

export function dictOf(...args: any[]): { [key: string]: any } {
  const ret: { [key: string]: any } = {};
  for (let i = 0; i < args.length; i += 2) {
    ret[args[i] as string] = args[i + 1];
  }
  return ret;
}

export async function save(key: string, value: any): Promise<void> {
  const record: any = {};
  record[key] = value;
  await BROWSER.get().storage.local.set(record);
}

export async function load(key: string): Promise<any> {
  const results = await BROWSER.get().storage.local.get(key);
  return results[key];
}

export async function loadBatch(keys: string[]): Promise<any[]> {
  const retval = [];
  const results = await BROWSER.get().storage.local.get(keys);
  for (const key in results) {
    retval.push(results[key]);
  }
  return retval;
}

export async function erase(key: string): Promise<void> {
  return BROWSER.get().storage.local.remove(key);
}
