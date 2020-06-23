import { BaseProps, h } from 'tsx-dom';
import { BROWSER } from '../lib/globals';
import { GrayTab } from '../lib/tabs_store';

interface FaviconProps {
  url: string;
}

function FaviconComponent({ url }: FaviconProps): HTMLImageElement {
  const domain = new URL(url).hostname;
  let location = '';
  if (domain) location = `https://www.google.com/s2/favicons?domain=${domain}`;
  return (<img src={location} width="16" height="16" />) as HTMLImageElement;
}

interface GroupRowProps extends BaseProps {
  tab: GrayTab;
  clickCallback: (event: MouseEvent) => Promise<void>;
}

export function GroupRowComponent({ tab, clickCallback }: GroupRowProps): HTMLLIElement {
  const removal = async (event: MouseEvent): Promise<void> => {
    event.preventDefault();
    await Promise.all([
      clickCallback(event),
      BROWSER.get().tabs.create({ url: tab.url, active: false }),
    ]);
  };

  return (
    <li>
      <div>
        <FaviconComponent url={tab.url} />
        <a href={tab.url} onClick={removal} data-key={tab.key}>
          {tab.title}
        </a>
      </div>
    </li>
  ) as HTMLLIElement;
}
