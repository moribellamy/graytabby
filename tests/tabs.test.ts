import { expect } from 'chai';
import { GrayTabGroup, INDEX_V1_KEY, loadAllTabGroups } from '../src/lib/tabs_store';
import { dictOf, save } from '../src/lib/utils';
import { mockedBrowser, stubGlobalsForTesting, unstubGlobals } from './utils';

describe('tabs', function() {
  beforeEach(async function() {
    await stubGlobalsForTesting();
  });

  afterEach(function() {
    unstubGlobals();
  });

  it('should load old string format', async function() {
    const oldGroups: GrayTabGroup[] = [
      {
        tabs: [
          {
            url: '1',
            title: 'one',
            key: 0,
          },
          {
            url: '2',
            title: 'two',
            key: 1,
          },
        ],
        date: 1589760256, // May 17 2020 in Linux Timestamp.
      },
      {
        tabs: [
          {
            url: '3',
            title: 'three',
            key: 0,
          },
        ],
        date: 1589760257,
      },
    ];
    save(INDEX_V1_KEY, JSON.stringify(oldGroups));
    const groups = await loadAllTabGroups();
    for (const oldGroup of oldGroups) {
      oldGroup.date *= 1000; // Seconds to millis conversion.
    }
    expect(groups).to.deep.equal(oldGroups);
  });
});
