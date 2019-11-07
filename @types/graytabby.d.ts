import { Tabs as WebextTabs } from 'webextension-polyfill-ts/dist/generated/tabs';

export type BrowserTab = WebextTabs.Tab;

export type GrayTab = Pick<BrowserTab, 'pinned' | 'windowId' | 'id' | 'url' | 'title'>;

export interface KeyedGrayTab extends GrayTab {
    key: string;
}

export interface GrayTabGroup {
    tabs: KeyedGrayTab[];
    date: number;
    key: string;
}

export interface SavedPage {
    url: string;
    pinned: boolean;
}

export interface Options {
    tabLimit: number;
    archiveDupes: boolean;
    homeGroup: SavedPage[];
}
