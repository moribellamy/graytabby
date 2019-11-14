/**
 * Importing this module (in an HTML page or otherwise) will initialize GrayTabby
 * data structures and will attach the GrayTabby app to DOM elements.
 */

import 'bootstrap'; // JS side of bootstrap.
import './scss/app.scss'; // Webpack uses MiniCssExtractPlugin when it sees this.
import { grayTabby } from './dom';
import { pageLoad, archival } from './brokers';
import { setBrowser, setDocument } from './globals';
import { browser } from 'webextension-polyfill-ts';

setBrowser(browser);
setDocument(document);

grayTabby(archival).then(() => {
  pageLoad.pub(null);
  console.log('loaded graytabby');
});
