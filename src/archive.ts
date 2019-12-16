import { BrowserTab, GrayTab } from '../@types/graytabby';
import { castTab } from './utils';

function shouldJustClose(url: string): boolean {
  const neverEqualList = ['chrome://newtab/', ''];
  const neverStartWithList = ['about:', 'data:'];
  for (const datum of neverEqualList) {
    if (datum === url) return true;
  }
  for (const datum of neverStartWithList) {
    if (url.startsWith(datum)) return true;
  }
  return false;
}

/**
 * Figures out which tabs get archived and which get closed.
 *
 * @param browserTabs All tabs which are candidates for archival.
 * @param homeURL The URL that indicates a tab is a GrayTabby home tab
 * @param archiveDupes If false, multiple instances of the same page are collapsed in
 * to one entry during the archive operation.
 * @returns a tuple. The first element is a list of tabs that need to be
 * archived. Second element is tabs that will just be closed and not archived.
 * None of the GrayTabby tabs are counted in either member.
 */
export function archivePlan(
  browserTabs: BrowserTab[],
  homeURL: string,
  archiveDupes: boolean,
): [GrayTab[], GrayTab[]] {
  const tabs = browserTabs.map(t => castTab(t));

  const tabsToArchive: GrayTab[] = [];
  const tabsToClose: GrayTab[] = [];
  const seen: Set<string> = new Set();

  for (const tab of tabs) {
    if (tab.url === homeURL || tab.pinned) continue;
    else if (seen.has(tab.url) && !archiveDupes) tabsToClose.push(tab);
    else if (shouldJustClose(tab.url)) tabsToClose.push(tab);
    else {
      tabsToArchive.push(tab);
      seen.add(tab.url);
    }
  }

  return [tabsToArchive, tabsToClose];
}
