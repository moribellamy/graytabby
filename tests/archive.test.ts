import { expect } from 'chai';
import { App, watchRender } from '../src/components/app';
import { archivePlan } from '../src/lib/archive';
import { Broker, BrokerConsumer } from '../src/lib/brokers';
import { ARCHIVAL, DOCUMENT } from '../src/lib/globals';
import { BrowserTab } from '../src/lib/types';
import { assertElement, stubGlobalsForTesting, testTab, unstubGlobals } from './utils';

describe('archive operation', function() {
  beforeEach(async function() {
    await stubGlobalsForTesting();
  });

  afterEach(function() {
    unstubGlobals();
  });

  // TODO more granular tests.
  it('should work', async function() {
    const archival = new Broker<BrowserTab[]>('moreTabs');
    // Capture callback for tab archival so we can inject tabs in test.
    let consumer: BrokerConsumer<BrowserTab[]>;
    archival.sub = func => {
      consumer = func;
    };
    ARCHIVAL.set(archival);

    const app = DOCUMENT.get().body.appendChild(App());
    await app.initialRender;

    assertElement('#groups > div', DOCUMENT.get(), 0);

    let render = watchRender(app);
    consumer([testTab({ url: 'http://example.com' })], {}, () => null);
    await render;

    const group = assertElement('#groups > div', DOCUMENT.get());
    const a = assertElement('a', group) as HTMLAnchorElement;

    render = watchRender(app);
    a.click();
    await render;

    assertElement('a', group, 0);
    assertElement('#groups > div', DOCUMENT.get(), 0);
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
