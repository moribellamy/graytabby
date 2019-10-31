export interface TabSummary {
  pinned: boolean,
  windowId: number,
  id: number,
  url: string,
  title: string,
}

export interface KeyedTabSummary extends TabSummary {
  key: string
}

export interface TabGroup {
  tabs: KeyedTabSummary[],
  date: number,
  key: string
}

export interface Options {
  tabLimit: number,
  archiveDupes: boolean
}
