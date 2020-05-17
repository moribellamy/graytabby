/**
 * A simple pub/sub message passing scheme.
 */

import { BROWSER } from './globals';

interface Payload<T> {
  type: string;
  message: T;
}

export type BrokerConsumer<MessageT> = (msg: MessageT, sender: any, unsubFunc: () => void) => void;
type MessageHandler<MessageT> = (payload: Payload<MessageT>, sender: any) => void;

/**
 * Message passing between extension pages and background page.
 */
export class Broker<MessageT> {
  protected key: string;
  protected done: boolean;

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
    return BROWSER.get().runtime.sendMessage(payload);
  }

  /**
   * Register for consumption of messages
   */
  public sub(func: BrokerConsumer<MessageT>): void {
    const handler: MessageHandler<MessageT> = (payload, sender) => {
      if (payload.type === this.key) {
        func(payload.message, sender, () => this.unsub(handler));
      }
    };
    BROWSER.get().runtime.onMessage.addListener(handler);
  }

  unsub(handler: MessageHandler<MessageT>): void {
    BROWSER.get().runtime.onMessage.removeListener(handler);
  }
}
