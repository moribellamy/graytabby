/**
 * Importing this module will initialize GrayTabby data structures and will
 * attach the GrayTabby app to DOM elements.
 *
 * Not included in coverage reports, so don't put non-trivial logic here.
 */

import { browser } from 'webextension-polyfill-ts';
import { pageLoad } from './brokers';
import { grayTabby } from './dom';
import { setBrowser, setDocument } from './globals';
import './scss/app.scss'; // Webpack uses MiniCssExtractPlugin when it sees this.

setBrowser(browser);
setDocument(document);

grayTabby().then(() => {
  pageLoad
    .pub()
    .catch(() => {
      console.log('no listeners for page load');
    })
    .finally(() => {
      console.log('loaded graytabby');
    });
});
