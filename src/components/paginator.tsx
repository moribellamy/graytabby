import { h } from 'tsx-dom';

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
  const container = (<div class="pagination" />) as HTMLDivElement;
  container.appendChild(<a href="#">&laquo;</a>);
  for (let i = 0; i < pages; i++) {
    // container.appendChild(<a href="#">{i + 1}</a>);
    container.appendChild(
      <PaginatorButtonComponent
        clickCallback={() => selectCallback(i)}
        active={i == currentPage}
        innerText={Number(i + 1).toString()}
      />,
    );
  }
  container.appendChild(<a href="#">&raquo;</a>);
  return container;
}
