import { GrayTabGroup } from '../../@types/graytabby';
import { erase, load, save, snip, fieldKeeper } from '../utils';

const V1_INDEX_KEY = 'tabGroups';
const V2_INDEX_KEY = 'g';

function keyFromDate(date: number): string {
  return `${V2_INDEX_KEY}${date}`;
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
  const groups: GrayTabGroup[] = JSON.parse(v1value);
  const promises: Promise<void>[] = [];
  const keys: string[] = [];
  await save(V2_INDEX_KEY, []); // init index
  for (let group of groups) {
    group = fieldKeeper(group, 'date', 'tabs');
    group.date *= 1000;
    reindexTabGroup(group);
    const key = keyFromGroup(group);
    group.tabs = group.tabs.map(t => fieldKeeper(t, 'key', 'title', 'url'));
    promises.push(save(key, group));
    keys.push(key);
  }
  promises.push(erase(V1_INDEX_KEY));
  promises.push(save(V2_INDEX_KEY, keys));
  await Promise.all(promises);
  return groups;
}

export async function loadAllTabGroups(): Promise<GrayTabGroup[]> {
  const legacy = await load(V1_INDEX_KEY);
  if (legacy) return migrateV1(legacy);

  let result = await load(V2_INDEX_KEY);
  if (!result) {
    result = [];
    await save(V2_INDEX_KEY, result);
  }
  const groupIds: string[] = result;
  const promises: Promise<GrayTabGroup>[] = [];
  for (const id of groupIds) {
    promises.push(load(id));
  }
  return Promise.all(promises);
}

export async function saveTabGroup(group: GrayTabGroup): Promise<void> {
  group.tabs = group.tabs.map(t => fieldKeeper(t, 'key', 'title', 'url'));
  const index: string[] = (await load(V2_INDEX_KEY)) || [];
  const key: string = keyFromGroup(group);
  if (index.indexOf(key) == -1) {
    index.unshift(key);
  }
  await Promise.all([save(key, group), save(V2_INDEX_KEY, index)]);
}

export async function eraseTabGroup(date: number): Promise<void> {
  const key: string = keyFromDate(date);
  const index: string[] = await load(V2_INDEX_KEY);
  snip(index, i => i == key);
  Promise.all([erase(key), save(V2_INDEX_KEY, index)]);
}
