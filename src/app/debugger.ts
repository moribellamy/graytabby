import { DOCUMENT } from '../lib/globals';
import { loadAllTabGroups } from './tabs_store';
import { ingestTabs } from './tabs_ui';

export class Debugger {
  async double(): Promise<void> {
    const groups = await loadAllTabGroups();
    let earliest = Math.min(...groups.map(g => g.date));
    const groupDiv: HTMLDivElement = DOCUMENT.get().querySelector('#groups');
    const promises: Promise<void>[] = [];
    for (const group of groups) {
      earliest -= 1000;
      await ingestTabs(<any>group.tabs, groupDiv, () => earliest);
    }
    await Promise.all(promises);
  }
}

declare global {
  interface Window {
    gt: Debugger;
  }
}
