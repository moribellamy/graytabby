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

export class Broker<MessageT> {
  protected key: string;

  constructor(key: string) {
    this.key = key;
  }

  public async pub(message: MessageT): Promise<void> {
    const payload: Payload<MessageT> = {
      type: this.key,
      message: message,
    };
    await getBrowser().runtime.sendMessage(payload);
  }

  public sub(func: BrokerConsumer<MessageT>): void {
    const handler = (payload: Payload<MessageT>, sender: any): void => {
      if (payload.type === this.key) {
        func(payload.message, sender, () => getBrowser().runtime.onMessage.removeListener(handler));
      }
    };
    getBrowser().runtime.onMessage.addListener(handler);
  }
}

// BG thread sends tabs to FG. If no GT windows are open, this message goes nowhere.
export const archival = new Broker<GrayTab[]>('moreTabs');

// The home page signals the backend that it's fully loaded.
export const pageLoad = new Broker<void>('pageLoad');
