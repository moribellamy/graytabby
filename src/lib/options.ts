import { BROWSER } from './globals';
import { fieldKeeper } from './utils';

export type SavedPage = {
  url: string;
  pinned: boolean;
};

export type Options = {
  tabLimit: number;
  groupsPerPage: number;
  archiveDupes: boolean;
  homeGroup: SavedPage[];
};

export const OPTIONS_DEFAULT: Options = {
  tabLimit: 10000,
  groupsPerPage: 10,
  archiveDupes: false,
  homeGroup: [],
};

export const OPTIONS_KEY = 'options';

export async function getOptions(): Promise<Options> {
  const results = await BROWSER.get().storage.local.get(OPTIONS_KEY);
  let options = results[OPTIONS_KEY];
  if (typeof options == 'string') {
    // Legacy
    options = JSON.parse(options);
  }
  return options || { ...OPTIONS_DEFAULT };
}

export async function setOptions(value: Partial<Options>): Promise<void> {
  const previous = await getOptions();
  const record: { [key: string]: Options } = {};
  const next = fieldKeeper(
    { ...previous, ...value },
    'archiveDupes',
    'homeGroup',
    'tabLimit',
    'groupsPerPage',
  );
  record[OPTIONS_KEY] = next;
  return BROWSER.get().storage.local.set(record);
}

export async function restoreFavorites(): Promise<void> {
  const homeGroup = (await getOptions()).homeGroup;
  if (homeGroup.length === 0) return;

  const createdPromises = Promise.all(
    homeGroup.map(saved => BROWSER.get().tabs.create({ pinned: saved.pinned, url: saved.url })),
  );
  const newTabs = new Set((await createdPromises).map(t => t.id));

  const tabs = await BROWSER.get().tabs.query({});
  const toRemove = tabs.filter(t => !newTabs.has(t.id)).map(t => t.id);
  await BROWSER.get().tabs.remove(toRemove);
}

export async function saveAsFavorites(): Promise<void> {
  const tabs = await BROWSER.get().tabs.query({});
  const saved: SavedPage[] = [];
  for (const tab of tabs) {
    saved.push({
      pinned: tab.pinned,
      url: tab.url,
    });
  }
  await setOptions({
    homeGroup: saved,
  });
}
