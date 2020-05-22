/**
 * User interface code for graytabby.
 *
 * Anything responsible for responding to user input or for displaying data to the user.
 */

import { DOCUMENT } from '../lib/globals';
import { Debugger } from './debugger';
import { bindOptions } from './options_ui';
import { bindTabs } from './tabs_ui';

/**
 * The main entry point for GrayTabby.
 */
export async function graytabby(): Promise<void> {
  DOCUMENT.get().title = 'GrayTabby';
  await bindOptions();
  await bindTabs();
  DOCUMENT.get().defaultView.gt = new Debugger();
}
