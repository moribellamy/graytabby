/**
 * GT entry point. Not included in coverage reports, so don't put
 * non-trivial logic here.
 */

// Webpack uses MiniCssExtractPlugin when it sees this.
import './style/app.scss';
import { DOCUMENT } from './lib/globals';
import { App } from './components/app';
import { PAGE_LOAD } from './lib/globals';
import { loadAllTabGroups } from './lib/tabs_store';

export class Debugger {
  async double(): Promise<void> {
    const groups = await loadAllTabGroups();
    let earliest = Math.min(...groups.map(g => g.date));
    const groupDiv: HTMLDivElement = DOCUMENT.get().querySelector('#groups');
    const promises: Promise<void>[] = [];
    for (const group of groups) {
      earliest -= 1000;
      // TODO
      // await ingestTabs(group.tabs, groupDiv, () => earliest);
    }
    await Promise.all(promises);
  }
}

declare global {
  interface Window {
    gt: Debugger;
  }
}

/**
 * The main entry point for GrayTabby.
 */
export async function graytabby(): Promise<void> {
  DOCUMENT.get().title = 'GrayTabbyzee';
  DOCUMENT.get().body.appendChild(App());
  DOCUMENT.get().defaultView.gt = new Debugger();
}

graytabby().then(
  () => {
    PAGE_LOAD.get()
      .pub()
      .catch(() => {
        console.log('no listeners for page load');
      })
      .finally(() => {
        console.log('loaded graytabby frontend');
      });
  },
  err => {
    console.error(err);
  },
);
