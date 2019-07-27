/**
 * Thin wrappers around browser functionality, adapting to the apparent environment.
 *
 * Right now it's just for FireFox / Chrome.
 */
import {TabSummary} from "../@types/graytabby";
import {castTab} from "./utils";
import {pageLoad} from "./brokers";

/**
 * Return true iff we appear to be running on firefox.
 */
export function isFireFox(): boolean {
  // @ts-ignore
  return typeof InstallTrigger !== 'undefined';
}

/**
 * Register a handler to fire when the user clicks on this extension's
 * "action" button.
 *
 * @param func The callback to fire.
 */
export function actionClickHandler(func: (...args: any[]) => any): void {
  if (isFireFox()) return browser.browserAction.onClicked.addListener(func);
  return chrome.browserAction.onClicked.addListener(func);
}

/**
 * Get the full URL to an asset belonging to this extension.
 *
 * e.g. moz-extension://780d1bd5-ae22-ba49-9e38-f9b544d288c3/app.html
 * e.g. chrome-extension://iidiphhaelgakfockabcekejagapmmcd/app.html
 *
 * @param path the path to the asset, e.g. 'app.html'
 */
export function getURL(path: string): string {
  if (isFireFox()) return browser.extension.getURL(path);
  return chrome.extension.getURL(path);
}

export async function getAllTabs(): Promise<TabSummary[]> {
  let nativeTabs: (browser.tabs.Tab | chrome.tabs.Tab)[] = [];
  if (isFireFox()) {
    nativeTabs = await browser.tabs.query({});
  } else {
    nativeTabs = await new Promise<chrome.tabs.Tab[]>(resolve => {
      chrome.tabs.query({}, tabs => resolve(tabs));
    });
  }

  return nativeTabs.reduce<TabSummary[]>((acc, cur) => {
    let cast = castTab(cur);
    if (cast) return acc.concat([cast]);
    return acc;
  }, []);
}

export function closeTabs(tabIds: number[]): Promise<void> {
  if (isFireFox()) {
    return browser.tabs.remove(tabIds)
  }
  return new Promise<void>(resolve => chrome.tabs.remove(tabIds, resolve));
}

/**
 * Create a tab.
 *
 * @param createProperties passed to underlying implementation. Because of duck typing, the chrome type
 * works for typescript even passed to the firefox impl.
 * @param waitForLoadSignal if true, the returned promise for the created tab to fire a message
 * to the `pageLoad` broker.
 */
export async function createTab(
  createProperties: chrome.tabs.CreateProperties,
  waitForLoadSignal: boolean): Promise<TabSummary> {
  let failMsg = "Couldn't create tab.";
  let summary: TabSummary;

  if (isFireFox()) {
    const nativeTab = await browser.tabs.create(createProperties);
    if (!nativeTab) throw failMsg;
    const tab = castTab(nativeTab);
    if (!tab) throw failMsg;
    summary = tab;
  } else {
    summary = await new Promise<TabSummary>((resolve, reject) =>
      chrome.tabs.create(createProperties, nativeTab => {
        const tab = castTab(nativeTab);
        if (tab) resolve(tab);
        else reject(failMsg);
      }));
  }

  if (waitForLoadSignal) return new Promise<TabSummary>((resolve) => {
    pageLoad.sub((msg, sender) => {
      if (sender.tab && sender.tab.id === summary.id) {
        resolve(summary);
      }
    });
  });

  return Promise.resolve(summary);
}

export async function updateTab(tabId: number, updateProperties: chrome.tabs.UpdateProperties): Promise<void> {
  if (isFireFox()) await browser.tabs.update(tabId, updateProperties);
  else chrome.tabs.update(tabId, updateProperties);
}
