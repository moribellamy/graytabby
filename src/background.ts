/**
 * Background script. See
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension
 *
 * No "long running logic" is implemented here. This is just the best place to register handlers.
 *
 * Not included in coverage reports, so don't put non-trivial logic here.
 */

import { bindArchivalHandlers } from './bg/archive';

bindArchivalHandlers().then(
  () => {
    console.log('loaded graytabby backend');
  },
  err => {
    console.error('could not load graytabby backend', err);
  },
);
