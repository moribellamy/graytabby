import { fail } from 'assert';
import { JSDOM } from 'jsdom';
import * as mockBrowser from 'sinon-chrome';
import { grayTabby } from '../src/dom';
import { setBrowser, setDocument } from '../src/globals';

describe('graytabby app', function() {
  this.beforeEach(async function() {
    setBrowser(mockBrowser);
    const jsdom = await JSDOM.fromFile('src/app.html');
    setDocument(jsdom.window.document);
    mockBrowser.tabs.query.returns([]);
    mockBrowser.storage.local.get.withArgs('options').returns({});
    mockBrowser.storage.local.get.withArgs('tabGroups').returns('[]');
    mockBrowser.storage.local.get.withArgs('g').returns([]);
    try {
      await grayTabby();
    } catch (err) {
      fail('Uncaught error: ' + err);
    }
  });

  it('should attach to dom without throwing', () => {
    // Just testing setup code.
  });
});
