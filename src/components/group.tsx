import { BaseProps, h } from 'tsx-dom';
import {
  dateFromKey,
  eraseTabGroup,
  GrayTab,
  GrayTabGroup,
  keyFromGroup,
  saveTabGroup,
} from '../lib/tabs_store';
import { GroupRowComponent } from './group_row';

interface GroupProps extends BaseProps {
  group: GrayTabGroup;
  removeCallback: () => void;
}

function groupFromDiv(self: GroupElement): GrayTabGroup {
  const date = dateFromKey(self.id);
  const group: GrayTabGroup = {
    date: date,
    tabs: [],
  };
  const lis = self.querySelectorAll('li');
  lis.forEach(li => {
    const a: HTMLAnchorElement = li.querySelector('a');
    const tab: GrayTab = {
      key: Number(a.attributes.getNamedItem('data-key').value),
      url: a.href,
      title: a.innerText,
    };
    group.tabs.push(tab);
  });
  return group;
}

async function syncGroupFromDOM(self: GroupElement): Promise<GrayTabGroup> {
  const group = groupFromDiv(self);
  if (group.tabs.length == 0) {
    await eraseTabGroup(group.date);
  } else {
    await saveTabGroup(group);
  }
  return group;
}

async function childClickCallback(event: MouseEvent): Promise<void> {
  let target = event.target as HTMLElement;
  let tail: HTMLElement = null;
  while (!target.classList.contains('tabGroup')) {
    tail = target;
    target = target.parentElement;
  }
  // now target is a <ul> and tail is an <li>
  target.removeChild(tail);
  const self = target.parentElement as GroupElement;
  const group = await syncGroupFromDOM(self);
  if (group.tabs.length == 0) {
    self.remove();
    self.removeCallback();
  }
}

interface GroupElement extends HTMLDivElement {
  removeCallback: () => void;
}

export function GroupComponent({ group, removeCallback }: GroupProps): GroupElement {
  const rows = <ul class="tabGroup" />;
  const self = (
    <div id={keyFromGroup(group)}>
      <span>{new Date(group.date).toLocaleString()}</span>
      {rows}
    </div>
  ) as GroupElement;

  self.removeCallback = removeCallback;

  for (const tab of group.tabs) {
    rows.appendChild(<GroupRowComponent tab={tab} clickCallback={childClickCallback} />);
  }

  return self;
}
