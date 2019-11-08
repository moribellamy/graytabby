import { GrayTab } from '../@types/graytabby';

function numberCmp(a: number | undefined, b: number | undefined): number {
  if (a == b && b == undefined) return 0; // ...or one is truthy
  if (a == undefined) return 1;
  if (b == undefined) return -1;
  return a - b;
}

function tabCmp(a: GrayTab, b: GrayTab): number {
  if (a.pinned != b.pinned) return a.pinned ? -1 : 1;
  const winCmp = numberCmp(a.windowId, b.windowId);
  if (winCmp != 0) return winCmp;
  return numberCmp(a.id, b.id);
}

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
 * Figures out which tabs get archived in to which home tab.
 *
 * @param tabs All tabs which are candidates for archival.
 * @param homeURL The URL that indicates a tab is a GrayTabby home tab
 * @param keepDupes If false, multiple instances of the same page are collapsed in
 * to one entry during the archive operation.
 * @returns a tuple. First element is a TabSummary representing the home tab
 * that results should get merged in to, or null if no such tab exists. The
 * second element is a list of tabs that need to be archived. Third element is
 * tabs that will just be closed and not archived.
 */
export function archivePlan(
  tabs: GrayTab[],
  homeURL: string,
  keepDupes: boolean,
): [GrayTab | null, GrayTab[], GrayTab[]] {
  tabs.sort(tabCmp);

  const tabsToArchive: GrayTab[] = [];
  const tabsToClose: GrayTab[] = [];
  const seen: Set<string> = new Set();
  let homeTab: GrayTab | null = null;

  for (const tab of tabs) {
    if (tab.url === homeURL) {
      if (!homeTab) homeTab = tab;
      // Use existing hometab if possible.
      else tabsToClose.push(tab);
    } else {
      if (tab.pinned) continue;
      else if (seen.has(tab.url) && !keepDupes) tabsToClose.push(tab);
      else if (shouldJustClose(tab.url)) tabsToClose.push(tab);
      else {
        tabsToArchive.push(tab);
        seen.add(tab.url);
      }
    }
  }

  return [homeTab, tabsToArchive, tabsToClose];
}
