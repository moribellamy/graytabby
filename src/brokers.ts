/**
 * A simple pub/sub message passing scheme.
 */

import { GrayTab } from '../@types/graytabby';
import { browser } from 'webextension-polyfill-ts';

interface Payload<T> {
  type: string;
  message: T;
}

class Broker<MessageT> {
  protected key: string;

  constructor(key: string) {
    this.key = key;
  }

  public async pub(message: MessageT): Promise<void> {
    const payload: Payload<MessageT> = {
      type: this.key,
      message: message,
    };
    await browser.runtime.sendMessage(payload);
  }

  public sub(func: (msg: MessageT, sender: void) => void): void {
    // eslint-disable-next-line
    const handler = (payload: Payload<MessageT>, sender: any) => {
      if (payload.type === this.key) {
        func(payload.message, sender);
      }
    };
    browser.runtime.onMessage.addListener(handler);
  }
}

// BG thread sends tabs to FG.
export const archival = new Broker<GrayTab[]>('moreTabs');

// The home page signals the backend that it's fully loaded.
export const pageLoad = new Broker<void>('pageLoad');
