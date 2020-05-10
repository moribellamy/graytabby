/**
 * Importing this module will initialize GrayTabby data structures and will
 * attach the GrayTabby app to DOM elements.
 *
 * Not included in coverage reports, so don't put non-trivial logic here.
 */

// import 'bootstrap'; // JS side of bootstrap.
import { browser } from 'webextension-polyfill-ts';
import { archival, pageLoad } from './brokers';
import { grayTabby } from './dom';
import { setBrowser, setDocument } from './globals';
import './scss/app.scss'; // Webpack uses MiniCssExtractPlugin when it sees this.

setBrowser(browser);
setDocument(document);

grayTabby(archival).then(() => {
  pageLoad.pub(null);
  console.log('loaded graytabby');
});
