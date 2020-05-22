import { DOCUMENT } from '../lib/globals';

let totalTabs = 0;

export function updateInfo(delta: number): void {
  const infoNode = <HTMLParagraphElement>DOCUMENT.get().querySelector('#info');
  totalTabs += delta;
  infoNode.innerText = 'Total tabs: ' + totalTabs.toString();
}

export function getTotalTabs(): number {
  return totalTabs;
}
