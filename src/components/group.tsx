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

function groupFromDiv(target: HTMLDivElement): GrayTabGroup {
  const date = dateFromKey(target.id);
  const group: GrayTabGroup = {
    date: date,
    tabs: [],
  };
  if (target == null) return group;
  const lis = target.querySelectorAll('li');
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

async function syncGroupFromDOM(target: HTMLDivElement): Promise<GrayTabGroup> {
  const group = groupFromDiv(target);
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
  const self = target.parentElement as HTMLDivElement;
  const group = await syncGroupFromDOM(self);
  if (group.tabs.length == 0) {
    self.dispatchEvent(new Event('remove'));
    self.remove();
  }
}

export function GroupComponent({ group, removeCallback }: GroupProps): HTMLDivElement {
  const rows = <ul class="tabGroup" />;
  const groupDiv = (
    <div id={keyFromGroup(group)}>
      <span>{new Date(group.date).toLocaleString()}</span>
      {rows}
    </div>
  ) as HTMLDivElement;

  for (const tab of group.tabs) {
    rows.appendChild(<GroupRowComponent tab={tab} clickCallback={childClickCallback} />);
  }

  groupDiv.addEventListener('remove', () => {
    removeCallback();
  });

  return groupDiv;
}
