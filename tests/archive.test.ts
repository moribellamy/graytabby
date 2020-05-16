import * as mockBrowser from 'sinon-chrome';
import { BrowserTab } from '../@types/graytabby';
import { Broker, BrokerConsumer } from '../src/brokers';
import { ARCHIVAL, DOCUMENT } from '../src/globals';
import { dateFromKey, INDEX_V2_KEY } from '../src/tabs';
import { assertElement, initGrayTabby, testTab } from './utils';

describe('archive', function() {
  it('should work', async function() {
    const archival = new Broker<BrowserTab[]>('moreTabs');
    // Capture callback for tab archival so we can inject tabs in test.
    let consumer: BrokerConsumer<BrowserTab[]>;
    archival.sub = func => {
      consumer = func;
    };
    ARCHIVAL.set(archival);
    await initGrayTabby();
    assertElement('#groups > div', DOCUMENT.get(), 0);

    consumer([testTab({ url: 'http://example.com' })], {}, () => null);
    const group = assertElement('#groups > div', DOCUMENT.get());

    mockBrowser.storage.local.get
      .withArgs(INDEX_V2_KEY)
      .returns(new Promise(() => [dateFromKey(group.id)]));
    const a = <HTMLAnchorElement>assertElement('a', group);
    a.click();
  });
});
