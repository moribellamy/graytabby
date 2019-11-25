import { instance } from 'ts-mockito';
import * as clickHandlers from '../src/clickHandlers';
import { setBrowser } from '../src/globals';
import { appURL } from '../src/utils';
import { MockBrowserContainer } from './mockBrowserContainer';
import { testTab } from './testUtils';

describe('archive handlers', function() {
  let mockBrowserContainer: MockBrowserContainer;

  this.beforeEach(function() {
    mockBrowserContainer = new MockBrowserContainer();
    setBrowser(instance(mockBrowserContainer.browser));
  });

  it('does main archival', async function() {
    mockBrowserContainer.setTabs([testTab({ url: appURL() })]);
    await clickHandlers.archiveHandler();
  });
});
