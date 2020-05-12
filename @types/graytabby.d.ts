import { Tabs as WebextTabs } from 'webextension-polyfill-ts/dist/generated/tabs';
import { Menus } from 'webextension-polyfill-ts/dist/generated/menus';
import { Options } from '../src/options';

export type BrowserTab = WebextTabs.Tab;
export type OnClickData = Menus.OnClickData;

// export type GrayTab = Pick<BrowserTab, 'pinned' | 'windowId' | 'id' | 'url' | 'title'>;
export type GrayTab = Pick<BrowserTab, 'url' | 'title'> & { key: number };

export type GrayTabGroup = {
  tabs: GrayTab[];
  date: number;
};

declare global {
  interface Window {
    getOptions: () => Promise<Options>;
  }
}
