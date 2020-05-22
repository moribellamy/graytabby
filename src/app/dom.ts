import { DOCUMENT } from '../lib/globals';

export function makeElement(
  type: string,
  attrs: { [key: string]: string } = {},
  children?: string | Element[],
): Element {
  const elem = DOCUMENT.get().createElement(type);
  for (const key in attrs) {
    elem.setAttribute(key, attrs[key]);
  }

  if (children === undefined) return elem;

  if (typeof children === 'string') {
    elem.innerText = children;
  } else {
    children.map(c => elem.appendChild(c));
  }
  return elem;
}
