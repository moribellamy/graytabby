import { GrayTab, BrowserTab } from '../@types/graytabby';
import { browser } from 'webextension-polyfill-ts';

/**
 * @param nativeTab a browser webext tab
 * @returns a GrayTabby tab
 */
export function castTab(nativeTab: BrowserTab): GrayTab {
  return {
    pinned: nativeTab.pinned,
    id: nativeTab.id,
    windowId: nativeTab.windowId,
    url: nativeTab.url,
    title: nativeTab.title
  }
}

/**
 * @returns where the user should browse to for the main GrayTabby page.
 */
export function appURL(): string {
  return browser.extension.getURL('app.html');
}

export function getDomain(url: string): string {
  return new URL(url).hostname
}

export function faviconLocation(url: string): string {
  let domain = getDomain(url);
  if (domain) return `https://www.google.com/s2/favicons?domain=${domain}`;
  return '';
}

export function makeElement(
  type: string,
  attrs: { [key: string]: string } = {},
  children?: string | Element[]): Element {

  let elem = document.createElement(type);
  for (let key in attrs) {
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
  let idx = arr.findIndex(func);
  arr.splice(idx, 1);
  return arr;
}
