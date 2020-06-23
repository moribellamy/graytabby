import { h } from 'tsx-dom';
import { ARCHIVAL, DOCUMENT } from '../lib/globals';
import { getOptions } from '../lib/options';
import { GrayTabGroup, loadAllTabGroups, saveTabGroup } from '../lib/tabs_store';
import { BrowserTab } from '../lib/types';
import { clamp, getOnlyChild, setOnlyChild } from '../lib/utils';
import { GroupComponent } from './group';
import { OptionsComponent, setVisible } from './options';
import { PaginatorComponent } from './paginator';

// function prependInsideContainer(parent: Element, child: Element): Element {
//   if (parent.firstChild == null) parent.appendChild(child);
//   else parent.insertBefore(child, parent.firstChild);
//   return child;
// }

async function ingestTabs(
  tabSummaries: BrowserTab[],
  groupsNode: HTMLDivElement,
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
  lastRender: Promise<void>;
}

export async function settleApp(): Promise<void> {
  const app: AppElement = DOCUMENT.get().querySelector('#app');
  return app.lastRender;
}

export function App(): AppElement {
  const optionsWrapper = <div />; // Contains one modal.
  const paginatorWrapper = <div />; // Contains one paginator.
  const groupsWrapper = (<div id="groups" />) as HTMLDivElement; // Contains N GroupComponents.

  const self = (
    <div id="app">
      {optionsWrapper}
      <div id="app">
        {paginatorWrapper}
        <h1>Welcome to GrayTabby!</h1>
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
  function render(pageNum?: number /* 0 indexed */): void {
    const renderFunc = async (): Promise<void> => {
      if (pageNum == null) pageNum = lastRenderPage;
      const options = await getOptions();
      setOnlyChild(optionsWrapper, <OptionsComponent options={options} />);
      groupsWrapper.innerHTML = '';

      const loaded = await loadAllTabGroups();

      const totalPages = Math.max(1, Math.ceil(loaded.length / options.groupsPerPage));
      pageNum = clamp(pageNum, 0, totalPages - 1);
      const firstIdx = pageNum * options.groupsPerPage;
      const lastIdx = firstIdx + options.groupsPerPage;

      setOnlyChild(
        paginatorWrapper,
        <PaginatorComponent
          pages={totalPages}
          currentPage={pageNum}
          selectCallback={clicked => render(clicked)}
        />,
      );
      for (const group of loaded.slice(firstIdx, lastIdx)) {
        groupsWrapper.appendChild(<GroupComponent group={group} removeCallback={render} />);
      }
      lastRenderPage = pageNum;
    };
    self.lastRender = renderFunc();
  }

  render(0); // Floating promise on self.lastRender

  ARCHIVAL.get().sub(async summaries => {
    await ingestTabs(summaries, groupsWrapper);
    render(0);
    await self.lastRender;
  });

  return self;
}
