import * as assert from 'assert';
import { JSDOM } from 'jsdom';
import * as mockBrowser from 'sinon-chrome';
import { grayTabby } from '../src/dom';
import { setBrowser, setDocument } from '../src/globals';
import { OPTIONS_KEY } from '../src/options';
import { INDEX_V1_KEY, INDEX_V2_KEY } from '../src/tabs';

describe('graytabby', function() {
  this.beforeEach(async function() {
    setBrowser(mockBrowser);
    const jsdom = await JSDOM.fromFile('src/app.html');
    setDocument(jsdom.window.document);
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
