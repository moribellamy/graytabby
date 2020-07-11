/**
 * GT entry point. Not included in coverage reports, so don't put
 * non-trivial logic here.
 */

import { App } from './components/app';
import { DOCUMENT, PAGE_LOAD } from './lib/globals';
import './style/app.scss';

/**
 * The main entry point for GrayTabby.
 */
export async function graytabby(): Promise<void> {
  const app = DOCUMENT.get().body.appendChild(App());
  await app.initialRender;
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
