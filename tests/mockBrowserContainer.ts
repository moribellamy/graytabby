import { anything, instance, mock, when } from 'ts-mockito';
import { Browser, Events, Extension, Runtime, Storage, Tabs } from 'webextension-polyfill-ts';
import { BrowserTab, Options, GrayTabGroup } from '../@types/graytabby';
import { snip } from '../src/utils';

export class MockBrowserContainer {
  browser: Browser;
  extension: Extension.Static;
  tabs: Tabs.Static;
  storage: Storage.Static;
  localStorage: Storage.LocalStorageArea;
  runtime: Runtime.Static;
  onMessage: Events.Event<(message: any | undefined, sender: Runtime.MessageSender) => Promise<any> | void>;

  listeners: Function[];

  constructor() {
    this.browser = mock();

    this.extension = mock();
    when(this.browser.extension).thenReturn(instance(this.extension));
    when(this.extension.getURL).thenReturn(s => s);

    this.tabs = mock();
    when(this.browser.tabs).thenReturn(instance(this.tabs));

    this.storage = mock();
    when(this.browser.storage).thenReturn(instance(this.storage));

    this.localStorage = mock();
    when(this.storage.local).thenReturn(instance(this.localStorage));

    this.runtime = mock();
    when(this.browser.runtime).thenReturn(instance(this.runtime));

    this.onMessage = mock();
    this.listeners = [];
    when(this.runtime.onMessage).thenReturn(instance(this.onMessage));
    when(this.onMessage.addListener).thenReturn(toAdd => this.listeners.push(toAdd));
    when(this.onMessage.removeListener).thenReturn(toRemove => snip(this.listeners, l => l == toRemove));
    when(this.runtime.sendMessage).thenReturn((message: any) => {
      this.listeners.map(l => l(message));
      return Promise.resolve();
    });

    this.setTabs([]);
    this.setTabGroups([]);
    this.setOptions({ tabLimit: 100, archiveDupes: false, homeGroup: [] });
  }

  public setTabs(tabs: BrowserTab[]): void {
    when(this.tabs.query(anything())).thenResolve(tabs);
  }

  public setOptions(options: Options): void {
    when(this.localStorage.get('options')).thenResolve({ options: JSON.stringify(options) });
  }

  public setTabGroups(groups: GrayTabGroup[]): void {
    when(this.localStorage.get('tabGroups')).thenResolve({ tabGroups: JSON.stringify(groups) });
  }
}
