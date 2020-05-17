import { BROWSER } from './globals';

// Cribbed from https://stackoverflow.com/questions/44203045/remove-fields-from-typescript-interface-object
export function fieldKeeper<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  const copy = <Pick<T, K>>{};
  keys.forEach(key => (copy[key] = obj[key]));
  return copy;
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
