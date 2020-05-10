/**
 * A simple pub/sub message passing scheme.
 */

import { GrayTab } from '../@types/graytabby';
import { getBrowser } from './globals';

interface Payload<T> {
  type: string;
  message: T;
}

type BrokerConsumer<MessageT> = (msg: MessageT, sender: any, unsubFunc: () => void) => void;

/**
 * Message passing between extension pages and background page.
 */
export class Broker<MessageT> {
  protected key: string;

  constructor(key: string) {
    this.key = key;
  }

  /**
   * Publish to all subscribers of this broker
   */
  public async pub(message: MessageT): Promise<void> {
    const payload: Payload<MessageT> = {
      type: this.key,
      message: message,
    };
    await getBrowser().runtime.sendMessage(payload);
  }

  /**
   * Register for consumption of messages
   */
  public sub(func: BrokerConsumer<MessageT>): void {
    const handler = (payload: Payload<MessageT>, sender: any): void => {
      if (payload.type === this.key) {
        func(payload.message, sender, () => getBrowser().runtime.onMessage.removeListener(handler));
      }
    };
    getBrowser().runtime.onMessage.addListener(handler);
  }
}

// Background script sends tabs to app.html. If no GT windows are open, this message goes nowhere.
export const archival = new Broker<GrayTab[]>('moreTabs');

// app.html signals to the backend that it is loaded
export const pageLoad = new Broker<void>('pageLoad');
