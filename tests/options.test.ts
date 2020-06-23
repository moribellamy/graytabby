import { getOptions, Options, OPTIONS_KEY } from '../src/lib/options';
import { expect } from 'chai';
import { unstubGlobals, stubGlobalsForTesting } from './utils';
import { save } from '../src/lib/utils';

describe('options', function() {
  beforeEach(async function() {
    await stubGlobalsForTesting();
  });

  afterEach(function() {
    unstubGlobals();
  });

  it('should load old string format', async function() {
    const oldOptions: Options = {
      tabLimit: 10000,
      archiveDupes: false,
      homeGroup: [],
      groupsPerPage: 10000,
    };
    save(OPTIONS_KEY, JSON.stringify(oldOptions));
    const options = await getOptions();
    expect(oldOptions).to.deep.equal(options);
  });
});
