import { h } from 'tsx-dom';
import { clamp } from '../lib/utils';

interface PaginatorButtonComponentProps {
  clickCallback: () => void;
  active: boolean;
  innerText: string;
}

function PaginatorButtonComponent({
  clickCallback,
  active,
  innerText,
}: PaginatorButtonComponentProps): HTMLAnchorElement {
  const click = (event: MouseEvent): void => {
    event.preventDefault();
    clickCallback();
  };
  return (
    <a href="#" onClick={click} class={active ? 'active' : ''}>
      {innerText}
    </a>
  ) as HTMLAnchorElement;
}

interface PaginatorProps {
  pages: number;
  currentPage: number; // 0 indexed
  selectCallback: (page: number) => void;
}

export function PaginatorComponent({
  pages,
  currentPage,
  selectCallback,
}: PaginatorProps): HTMLDivElement {
  currentPage = clamp(currentPage, 0, pages - 1);
  const container = (<div class="pagination" />) as HTMLDivElement;

  const windowSize = 7;
  let nodes: number[];
  if (pages <= windowSize) {
    nodes = [...Array(pages).keys()];
  } else {
    nodes = [currentPage];
    let onLeft = true;
    while (nodes.length < 7) {
      if (onLeft) {
        const leftVal = nodes[0];
        if (leftVal > 0) nodes = [leftVal - 1, ...nodes];
      } else {
        const rightVal = nodes[nodes.length - 1];
        if (rightVal < pages - 1) nodes = [...nodes, rightVal + 1];
      }
      onLeft = !onLeft;
    }
  }

  container.appendChild(
    <PaginatorButtonComponent
      clickCallback={() => selectCallback(0)}
      active={false}
      innerText="«"
    />,
  );
  for (const i of nodes) {
    container.appendChild(
      <PaginatorButtonComponent
        clickCallback={() => selectCallback(i)}
        active={i == currentPage}
        innerText={Number(i + 1).toString()}
      />,
    );
  }
  container.appendChild(
    <PaginatorButtonComponent
      clickCallback={() => selectCallback(pages - 1)}
      active={false}
      innerText="»"
    />,
  );

  return container;
}
