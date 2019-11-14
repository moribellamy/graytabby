import { grayTabby } from '../src/dom';
import { Broker } from '../src/brokers';
import { JSDOM } from 'jsdom';
import { setDocument, setBrowser } from '../src/globals';
import { Browser, Storage } from 'webextension-polyfill-ts';
import { mock, instance, when, anything } from 'ts-mockito';
import { fail } from 'assert';
import { GrayTab } from '../@types/graytabby';

describe('graytabby app', function() {
  it('should attach to dom without throwing', async () => {
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

    const mockBrowser = mock<Browser>();
    const mockStorage = mock<Storage.Static>();
    const mockLocal = mock<Storage.LocalStorageArea>();
    when(mockBrowser.storage).thenReturn(instance(mockStorage));
    when(mockStorage.local).thenReturn(instance(mockLocal));
    when(mockLocal.get(anything())).thenResolve({});
    setDocument(jsdom.window.document);
    setBrowser(instance(mockBrowser));

    const mockArchival = mock<Broker<GrayTab[]>>();
    try {
      await grayTabby(instance(mockArchival));
    } catch (err) {
      fail('Uncaught error: ' + err);
    }
  });
});
