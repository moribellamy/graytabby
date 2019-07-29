/**
 * A simple pub/sub message passing scheme.
 */

import { TabSummary } from '../@types/graytabby';
import { browser } from 'webextension-polyfill-ts';

interface Payload<T> {
  type: string
  message: T
}

class Broker<MessageT> {
  protected key: string;

  constructor(key: string) {
    this.key = key
  }

  public async pub(message: MessageT): Promise<void> {
    const payload: Payload<MessageT> = {
      type: this.key,
      message: message
    };
    await browser.runtime.sendMessage(payload);
  }

  public sub(func: (msg: MessageT, sender: any) => void): void {
    const handler = (payload: Payload<MessageT>, sender: any) => {
      if (payload.type === this.key) {
        func(payload.message, sender);
      }
    };
    browser.runtime.onMessage.addListener(handler);
  }
}

export const moreTabs = new Broker<TabSummary[]>('moreTabs');
export const pageLoad = new Broker<void>('pageLoad');
