import { h } from 'tsx-dom';
import { ARCHIVAL } from '../lib/globals';
import { getOptions } from '../lib/options';
import { GrayTabGroup, loadAllTabGroups, saveTabGroup } from '../lib/tabs_store';
import { BrowserTab } from '../lib/types';
import { clamp, getOnlyChild, setOnlyChild } from '../lib/utils';
import { GroupComponent } from './group';
import { OptionsComponent, setVisible } from './options';
import { PaginatorComponent } from './paginator';

async function ingestTabs(
  tabSummaries: BrowserTab[],
  now = () => new Date().getTime(),
): Promise<void> {
  if (tabSummaries.length == 0) return;
  let counter = 0;
  const group: GrayTabGroup = {
    tabs: tabSummaries.map(ts => {
      return { ...ts, key: counter++ };
    }),
    date: now(),
  };
  await saveTabGroup(group);
}

export interface AppElement extends HTMLDivElement {
  _signalWatcher: () => void;
  initialRender: Promise<void>;
}

export function watchRender(app: AppElement): Promise<void> {
  return new Promise(resolve => {
    app._signalWatcher = resolve;
  });
}

export function App(): AppElement {
  const optionsWrapper = <div />; // Contains one modal.
  const paginatorWrapper = <div />; // Contains one paginator.
  const groupsWrapper = (<div id="groups" />) as HTMLDivElement; // Contains N GroupComponents.

  const self = (
    <div id="app">
      {optionsWrapper}
      <div>
        <h1>Welcome to GrayTabby!</h1>
        {paginatorWrapper}
        <p id="info"></p>
        {groupsWrapper}
        <img
          src="assets/img/blobbycat/logo.png"
          id="logo"
          onClick={() => setVisible(getOnlyChild(optionsWrapper) as HTMLDivElement, true)}
        />
      </div>
    </div>
  ) as AppElement;

  let lastRenderPage = 0;
  async function render(pageNum?: number /* 0 indexed */): Promise<void> {
    if (pageNum == null) pageNum = lastRenderPage;
    const options = await getOptions();
    setOnlyChild(optionsWrapper, <OptionsComponent options={options} closeCallback={render} />);
    groupsWrapper.innerHTML = '';

    const loaded = await loadAllTabGroups();

    const totalPages = Math.max(1, Math.ceil(loaded.length / options.groupsPerPage));
    pageNum = clamp(pageNum, 0, totalPages - 1);
    const firstIdx = pageNum * options.groupsPerPage;
    const lastIdx = firstIdx + options.groupsPerPage;

    setOnlyChild(
      paginatorWrapper,
      totalPages > 1 ? (
        <PaginatorComponent
          pages={totalPages}
          currentPage={pageNum}
          selectCallback={clicked => render(clicked)}
        />
      ) : (
        <div />
      ),
    );
    for (const group of loaded.slice(firstIdx, lastIdx)) {
      groupsWrapper.appendChild(<GroupComponent group={group} removeCallback={render} />);
    }
    lastRenderPage = pageNum;
    if (self._signalWatcher != null) {
      self._signalWatcher();
      self._signalWatcher = null;
    }
  }

  self.initialRender = render(0);

  ARCHIVAL.get().sub(async summaries => {
    await ingestTabs(summaries);
    await render(0);
  });

  return self;
}
