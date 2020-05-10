import { getBrowser } from '../globals';
import { fieldKeeper } from '../utils';

export type SavedPage = {
  url: string;
  pinned: boolean;
};

export type Options = {
  tabLimit: number;
  archiveDupes: boolean;
  homeGroup: SavedPage[];
};

const OPTIONS_DEFAULT: Options = {
  tabLimit: 10000,
  archiveDupes: false,
  homeGroup: [],
};

export class OptionsStore {
  key: string;

  constructor() {
    this.key = 'options';
  }

  async get(): Promise<Options> {
    const results = await getBrowser().storage.local.get(this.key);
    let options = results[this.key];
    if (typeof options == 'string') {
      // Legacy
      options = JSON.parse(options);
    }
    return options || { ...OPTIONS_DEFAULT };
  }

  async set(value: Partial<Options>): Promise<void> {
    const previous = await this.get();
    const record: { [key: string]: Options } = {};
    const next = fieldKeeper({ ...previous, ...value }, 'archiveDupes', 'homeGroup', 'tabLimit');
    record[this.key] = next;
    return getBrowser().storage.local.set(record);
  }
}

export const optionsStore = new OptionsStore();
