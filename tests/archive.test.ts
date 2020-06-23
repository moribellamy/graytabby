import { expect } from 'chai';
import { archivePlan } from '../src/lib/archive';
import { Broker, BrokerConsumer } from '../src/lib/brokers';
import { ARCHIVAL, DOCUMENT } from '../src/lib/globals';
import { dateFromKey, INDEX_V2_KEY } from '../src/lib/tabs_store';
import { assertElement, testTab, stubGlobalsForTesting, unstubGlobals, mockedBrowser } from './utils';
import { BrowserTab } from '../src/lib/types';
import { dictOf } from '../src/lib/utils';
import { App, settleApp, AppElement } from '../src/components/app';
import { OPTIONS_DEFAULT } from '../src/lib/options';
import { GroupComponent } from '../src/components/group';
// import { graytabby } from '../src/app';

describe('archive operation', function() {
  beforeEach(async function() {
    await stubGlobalsForTesting();
  });

  afterEach(function() {
    unstubGlobals();
  });

  it('should work', async function() {
    const archival = new Broker<BrowserTab[]>('moreTabs');
    // Capture callback for tab archival so we can inject tabs in test.
    let consumer: BrokerConsumer<BrowserTab[]>;
    archival.sub = func => {
      consumer = func;
    };
    ARCHIVAL.set(archival);

    DOCUMENT.get().body.appendChild(App());
    await settleApp();

    assertElement('#groups > div', DOCUMENT.get(), 0);

    await consumer([testTab({ url: 'http://example.com' })], {}, () => null);
    await settleApp();
    const group = assertElement('#groups > div', DOCUMENT.get());

    // mockedBrowser()
    //   .storage.local.get.withArgs(INDEX_V2_KEY)
    //   .returns(Promise.resolve(dictOf(INDEX_V2_KEY, [dateFromKey(group.id)]))); // todo mock teh effing datastore
    const a = assertElement('a', group) as HTMLAnchorElement;
    a.click();
  });
});

describe('archivePlan', () => {
  it('should be noop when no tabs are open', () => {
    const [tabsToArchive, tabsToClose] = archivePlan([], '', true);
    expect(tabsToArchive).to.be.empty;
    expect(tabsToClose).to.be.empty;
  });

  it('should archive non-home tabs and skip home tab', () => {
    const [tabsToArchive, tabsToClose] = archivePlan(
      [
        testTab({ url: 'foo', pinned: false, windowId: 1, title: '', id: 1 }),
        testTab({ url: 'home', pinned: false, windowId: 1, title: '', id: 2 }),
        testTab({ url: 'bar', pinned: false, windowId: 1, title: '', id: 3 }),
      ],
      'home',
      true,
    );
    expect(tabsToArchive.map(x => x.id)).to.have.members([1, 3]);
    expect(tabsToClose).to.be.empty;
  });

  it('should keep pinned tabs', () => {
    const [tabsToArchive, tabsToClose] = archivePlan(
      [
        testTab({ url: 'home', pinned: false, windowId: 1, title: '', id: 1 }),
        testTab({ url: 'foo', pinned: false, windowId: 1, title: '', id: 2 }),
        testTab({ url: 'bar', pinned: true, windowId: 2, title: '', id: 2 }),
      ],
      'home',
      true,
    );
    expect(tabsToArchive.map(x => [x.windowId, x.id])).deep.equal([[1, 2]]);
    expect(tabsToClose).to.be.empty;
  });
});
