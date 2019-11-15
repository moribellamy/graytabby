import { BrowserTab, GrayTab } from '../@types/graytabby';
import { expect } from 'chai';

describe('castTab', () => {
  function testTab(args: Partial<BrowserTab>): BrowserTab {
    return {
      index: 1,
      highlighted: true,
      active: true,
      pinned: true,
      incognito: false,
      ...args,
    };
  }

  it('should carry over converted fields', () => {
    const t = testTab({
      windowId: 2,
      id: 3,
      url: 'foo',
      title: 'bar',
    });
    const ct = <GrayTab>t;
    expect(ct.windowId).equal(2);
    expect(ct.id).equal(3);
    expect(ct.url).equal('foo');
    expect(ct.title).equal('bar');
  });
});
