import * as mockBrowser from 'sinon-chrome';
import { getOptions, Options, OPTIONS_KEY } from '../src/options';
import { expect } from 'chai';

describe('options', function() {
  it('should load old string format', async function() {
    const oldOptions: Options = {
      tabLimit: 10000,
      archiveDupes: false,
      homeGroup: [],
    };
    mockBrowser.storage.local.get.withArgs(OPTIONS_KEY).returns(JSON.stringify(oldOptions));
    const options = await getOptions();
    expect(oldOptions).to.deep.equal(options);
  });
});
