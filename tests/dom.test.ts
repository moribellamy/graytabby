import { fail } from 'assert';
import { JSDOM } from 'jsdom';
import { instance, mock } from 'ts-mockito';
import { BrowserTab } from '../@types/graytabby';
import { Broker } from '../src/brokers';
import { grayTabby } from '../src/dom';
import { setBrowser, setDocument } from '../src/globals';
import { MockBrowserContainer } from './mockBrowserContainer';
import 'process';

describe('graytabby app', function() {
  let mockBrowserContainer: MockBrowserContainer;

  this.beforeEach(async function() {
    mockBrowserContainer = new MockBrowserContainer();
    setBrowser(instance(mockBrowserContainer.browser));

    const jsdom = await JSDOM.fromFile('src/app.html');

    setDocument(jsdom.window.document);
  });

  it('should attach to dom without throwing', async () => {
    const mockArchival = mock<Broker<BrowserTab[]>>();
    try {
      await grayTabby(instance(mockArchival));
    } catch (err) {
      fail('Uncaught error: ' + err);
    }
  });
});
