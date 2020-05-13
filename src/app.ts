/**
 * Importing this module will initialize GrayTabby data structures and will
 * attach the GrayTabby app to DOM elements.
 *
 * Not included in coverage reports, so don't put non-trivial logic here.
 */

import { grayTabby } from './dom';
import { getPageLoad } from './globals';
import './scss/app.scss'; // Webpack uses MiniCssExtractPlugin when it sees this.
import './scss/pure.css';
import './scss/montserrat.css';

grayTabby().then(() => {
  getPageLoad()
    .pub()
    .catch(() => {
      console.log('no listeners for page load');
    })
    .finally(() => {
      console.log('loaded graytabby');
    });
});
