import { BrowserTab } from '../@types/graytabby';

export function testTab(args: Partial<BrowserTab>): BrowserTab {
  return {
    index: 1,
    highlighted: true,
    active: true,
    pinned: true,
    incognito: false,
    ...args,
  };
}
