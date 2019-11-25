import { fail } from 'assert';
import { JSDOM } from 'jsdom';
import { instance, mock } from 'ts-mockito';
import { GrayTab } from '../@types/graytabby';
import { Broker } from '../src/brokers';
import { grayTabby } from '../src/dom';
import { setBrowser, setDocument } from '../src/globals';
import { MockBrowserContainer } from './mockBrowserContainer';

describe('graytabby app', function() {
  let mockBrowserContainer: MockBrowserContainer;

  this.beforeEach(function() {
    mockBrowserContainer = new MockBrowserContainer();
    setBrowser(instance(mockBrowserContainer.browser));

    const jsdom = new JSDOM(`
    <html>
    <body>
      <input id="optionsLimit"></input>
      <input id="optionsDupes"></input>
      <div id="app">
        <p id="info"></p>
        <div id="groups"></div>
      </div>
    </body>
    </html>`);
    setDocument(jsdom.window.document);
  });

  it('should attach to dom without throwing', async () => {
    const mockArchival = mock<Broker<GrayTab[]>>();
    try {
      await grayTabby(instance(mockArchival));
    } catch (err) {
      fail('Uncaught error: ' + err);
    }
  });
});
