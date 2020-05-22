/**
 * Tab types and logic.
 */

import { erase, load, save, fieldKeeper, loadBatch } from '../lib/utils';
import { BrowserTab } from '../lib/types';

export type GrayTab = Pick<BrowserTab, 'url' | 'title'> & { key: number };

export type GrayTabGroup = {
  tabs: GrayTab[];
  date: number;
};

export const INDEX_V1_KEY = 'tabGroups';
export const INDEX_V2_KEY = 'g';

/**
 * Deletes the first matching element from <arr>
 * @param arr An array
 * @param func A criterion for deletion.
 * @returns <arr>
 */
function snip<T>(arr: T[], func: (arg: T) => boolean): T[] {
  const idx = arr.findIndex(func);
  arr.splice(idx, 1);
  return arr;
}

export function keyFromDate(date: number): string {
  return `${INDEX_V2_KEY}${date}`;
}

export function dateFromKey(key: string): number {
  key = key.substr(INDEX_V2_KEY.length);
  return Number(key);
}

export function keyFromGroup(group: GrayTabGroup): string {
  return keyFromDate(group.date);
}

function reindexTabGroup(group: GrayTabGroup): void {
  let counter = 0;
  for (const tab of group.tabs) tab.key = counter++;
}

/**
 * Switch V1 to V2 schema. Clears V1_KEY after populating per the V2 schema.
 * @param v1value The value stored in V1_KEY.
 */
async function migrateV1(v1value: string): Promise<GrayTabGroup[]> {
  let groups: GrayTabGroup[] = JSON.parse(v1value);
  const promises: Promise<void>[] = [];
  const keys: string[] = [];
  await save(INDEX_V2_KEY, []); // init index
  groups = groups.map(g => fieldKeeper(g, 'date', 'tabs'));
  for (const group of groups) {
    group.date *= 1000;
    reindexTabGroup(group);
    const key = keyFromGroup(group);
    group.tabs = group.tabs.map(t => fieldKeeper(t, 'key', 'title', 'url'));
    promises.push(save(key, group));
    keys.push(key);
  }
  promises.push(erase(INDEX_V1_KEY));
  promises.push(save(INDEX_V2_KEY, keys));
  await Promise.all(promises);
  return groups;
}

export async function loadAllTabGroups(): Promise<GrayTabGroup[]> {
  const legacy = await load(INDEX_V1_KEY);
  if (legacy) return migrateV1(legacy);

  let result = await load(INDEX_V2_KEY);
  if (!result) {
    result = [];
    await save(INDEX_V2_KEY, result);
  }
  const groupIds: string[] = result;
  return loadBatch(groupIds);
}

export async function saveTabGroup(group: GrayTabGroup): Promise<void> {
  group.tabs = group.tabs.map(t => fieldKeeper(t, 'key', 'title', 'url'));
  const index: string[] = (await load(INDEX_V2_KEY)) || [];
  const key: string = keyFromGroup(group);
  if (index.indexOf(key) == -1) {
    index.unshift(key);
  }
  await Promise.all([save(key, group), save(INDEX_V2_KEY, index)]);
}

export async function eraseTabGroup(date: number): Promise<void> {
  const key: string = keyFromDate(date);
  const index: string[] = await load(INDEX_V2_KEY);
  snip(index, i => i == key);
  await Promise.all([erase(key), save(INDEX_V2_KEY, index)]);
}
