import { Tabs as WebextTabs } from 'webextension-polyfill-ts/dist/generated/tabs';
import { Menus } from 'webextension-polyfill-ts/dist/generated/menus';

export type BrowserTab = WebextTabs.Tab;
export type OnClickData = Menus.OnClickData;

export type GrayTab = Pick<BrowserTab, 'pinned' | 'windowId' | 'id' | 'url' | 'title'>;
export type ProcessedGrayTab = Pick<BrowserTab, 'url' | 'title'> & { key: string };

export type ProcessedGrayTabGroup = {
  tabs: ProcessedGrayTab[];
  date: number;
  key: string;
};

// declare global {
//   interface Window {
//     options: OptionsStore;
//   }
// }
