import * as mockBrowser from 'sinon-chrome';
import { getOptions, Options, OPTIONS_KEY } from '../src/lib/options';
import { expect } from 'chai';
import { unstubGlobals, stubGlobals } from './utils';

describe('options', function() {
  beforeEach(async function() {
    await stubGlobals();
  });

  afterEach(function() {
    unstubGlobals();
  });

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
