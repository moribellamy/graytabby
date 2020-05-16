/**
 * GT entry point. Not included in coverage reports, so don't put
 * non-trivial logic here.
 */

// Webpack uses MiniCssExtractPlugin when it sees this.
import './scss/app.scss';

import { grayTabby } from './ui';
import { PAGE_LOAD } from './globals';

grayTabby().then(
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
