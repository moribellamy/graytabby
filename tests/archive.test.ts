import { actionButtonArchivePlan } from '../src/archive';
import { expect } from 'chai';
import { BrowserTab } from '../@types/graytabby';

describe('archivePlan', () => {
  it('should be noop when no tabs are open', () => {
    const [homeTab, tabsToArchive, tabsToClose] = actionButtonArchivePlan([], '', true);
    expect(homeTab).equal(null);
    expect(tabsToArchive).deep.equal([]);
    expect(tabsToClose).deep.equal([]);
  });

  it('should archive non-home tabs and indicate oldest home tab', () => {
    const [homeTab, tabsToArchive, tabsToClose] = actionButtonArchivePlan(
      [
        <BrowserTab>{ url: 'foo', pinned: false, windowId: 1, title: '', id: 1 },
        <BrowserTab>{ url: 'home', pinned: false, windowId: 1, title: '', id: 2 },
        <BrowserTab>{ url: 'bar', pinned: false, windowId: 1, title: '', id: 3 },
        <BrowserTab>{ url: 'home', pinned: false, windowId: 1, title: '', id: 4 },
      ],
      'home',
      true,
    );
    expect(homeTab.id).equal(2);
    expect(tabsToArchive.map(x => x.id)).to.have.members([1, 3]);
    expect(tabsToClose.map(x => x.id)).to.have.members([4]);
  });

  it('should prefer to keep the oldest home tab', () => {
    const [homeTab, tabsToArchive, tabsToClose] = actionButtonArchivePlan(
      [
        <BrowserTab>{ url: 'home', pinned: false, windowId: 1, title: '', id: 1 },
        <BrowserTab>{ url: 'home', pinned: false, windowId: 1, title: '', id: 2 },
        <BrowserTab>{ url: 'home', pinned: false, windowId: 2, title: '', id: 1 },
        <BrowserTab>{ url: 'home', pinned: false, windowId: 2, title: '', id: 2 },
      ],
      'home',
      true,
    );
    expect(homeTab.id).equal(1);
    expect(homeTab.windowId).equal(1);
    expect(tabsToArchive.map(x => x.id)).to.be.empty;
    expect(tabsToClose.map(x => x.id)).to.have.members([1, 2, 2]);
  });

  it('should keep pinned tabs and prefer pinned home tabs', () => {
    const [homeTab, tabsToArchive, tabsToClose] = actionButtonArchivePlan(
      [
        <BrowserTab>{ url: 'home', pinned: false, windowId: 1, title: '', id: 1 },
        <BrowserTab>{ url: 'foo', pinned: false, windowId: 1, title: '', id: 2 },
        <BrowserTab>{ url: 'home', pinned: true, windowId: 2, title: '', id: 1 },
        <BrowserTab>{ url: 'bar', pinned: true, windowId: 2, title: '', id: 2 },
      ],
      'home',
      true,
    );
    expect(homeTab.id).equal(1);
    expect(homeTab.windowId).equal(2);
    expect(tabsToArchive.map(x => [x.windowId, x.id])).deep.equal([[1, 2]]);
    expect(tabsToClose.map(x => [x.windowId, x.id])).deep.equal([[1, 1]]);
  });
});
