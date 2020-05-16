import * as assert from 'assert';
import { JSDOM } from 'jsdom';
import * as mockBrowser from 'sinon-chrome';
import { grayTabby } from '../src/ui';
import { OPTIONS_KEY } from '../src/options';
import { INDEX_V1_KEY, INDEX_V2_KEY, dateFromKey } from '../src/tabs';
import { BROWSER, DOCUMENT, ARCHIVAL } from '../src/globals';
import { BrowserTab } from '../@types/graytabby';
import { Broker, BrokerConsumer } from '../src/brokers';

function testTab(args: Partial<BrowserTab>): BrowserTab {
  return {
    index: 1,
    incognito: false,
    highlighted: false,
    active: false,
    pinned: false,
    ...args,
  };
}

// function wait(ms: number) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

describe('graytabby', function() {
  this.beforeEach(async function() {
    BROWSER.set(<any>mockBrowser);
    const jsdom = await JSDOM.fromFile('src/app.html');
    DOCUMENT.set(jsdom.window.document);
    mockBrowser.tabs.query.returns([]);
    mockBrowser.storage.local.get.withArgs(INDEX_V1_KEY).returns('[]');
    mockBrowser.storage.local.get.withArgs(OPTIONS_KEY).returns([]);
    mockBrowser.storage.local.get.withArgs(INDEX_V2_KEY).returns([]);
  });

  async function getGrayTabby(): Promise<void> {
    try {
      return await grayTabby();
    } catch (err) {
      assert.fail('Uncaught error: ' + err);
    }
  }

  it('should attach to dom without throwing', async () => {
    await getGrayTabby();
  });

  it('should suppport basic archival', async () => {
    const archival = new Broker<BrowserTab[]>('moreTabs');
    // Capture callback for tab archival so we can inject tabs in test.
    let consumer: BrokerConsumer<BrowserTab[]>;
    archival.sub = func => {
      consumer = func;
    };
    ARCHIVAL.set(archival);
    await getGrayTabby();

    let group: HTMLDivElement = DOCUMENT.get().querySelector('#groups > div');
    assert.equal(group, null);

    consumer([testTab({ url: 'http://example.com' })], {}, () => null);
    group = DOCUMENT.get().querySelector('#groups > div');
    assert.notEqual(group, null);

    mockBrowser.storage.local.get
      .withArgs(INDEX_V2_KEY)
      .returns(new Promise(() => [dateFromKey(group.id)]));
    const a: HTMLAnchorElement = group.querySelector('a');
    a.click();
  });
});
