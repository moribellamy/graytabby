import { GrayTab } from '../@types/graytabby';
import { getBrowser } from './globals';

// Cribbed from https://stackoverflow.com/questions/44203045/remove-fields-from-typescript-interface-object
export function fieldKeeper<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  const copy = <Pick<T, K>>{};
  keys.forEach(key => (copy[key] = obj[key]));
  return copy;
}

export function forceGrayTab(nativeTab: GrayTab): GrayTab {
  return fieldKeeper(nativeTab, 'title', 'pinned', 'windowId', 'url', 'title', 'id');
}

/**
 * @returns where the user should browse to for the main GrayTabby page.
 */
export function appURL(): string {
  return getBrowser().extension.getURL('app.html');
}

export function getDomain(url: string): string {
  return new URL(url).hostname;
}

export function faviconLocation(url: string): string {
  const domain = getDomain(url);
  if (domain) return `https://www.google.com/s2/favicons?domain=${domain}`;
  return '';
}

export function makeElement(
  type: string,
  attrs: { [key: string]: string } = {},
  children?: string | Element[],
): Element {
  const elem = document.createElement(type);
  for (const key in attrs) {
    elem.setAttribute(key, attrs[key]);
  }

  if (children === undefined) return elem;

  if (typeof children === 'string') {
    elem.innerText = children;
  } else {
    children.map(c => elem.appendChild(c));
  }
  return elem;
}

/**
 * Deletes the first matching element from <arr>
 * @param arr An array
 * @param func A criterion for deletion.
 * @returns <arr>
 */
export function snip<T>(arr: T[], func: (arg: T) => boolean): T[] {
  const idx = arr.findIndex(func);
  arr.splice(idx, 1);
  return arr;
}

export async function save(key: string, value: any): Promise<void> {
  const record: any = {};
  record[key] = value;
  await getBrowser().storage.local.set(record);
}

export async function load(key: string): Promise<any> {
  const results = await getBrowser().storage.local.get(key);
  return results[key];
}

export async function erase(key: string): Promise<void> {
  return getBrowser().storage.local.remove(key);
}

export async function mutate<T>(key: string, func: (arg0: T) => T): Promise<T> {
  const value: T = await load(key);
  const next: T = func(value);
  await save(key, next);
  return next;
}

// export async function delete(key: string): Promise<void> {
//   // const x = getBrowser().storage.local.remove(key);
// }
