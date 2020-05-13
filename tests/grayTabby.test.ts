import * as assert from 'assert';
import { JSDOM } from 'jsdom';
import * as mockBrowser from 'sinon-chrome';
import { grayTabby } from '../src/ui';
import { OPTIONS_KEY } from '../src/options';
import { INDEX_V1_KEY, INDEX_V2_KEY } from '../src/tabs';
import { BROWSER, DOCUMENT } from '../src/globals';

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
});
