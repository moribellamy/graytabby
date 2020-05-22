import { getOptions, setOptions } from '../lib/options';
import { DOCUMENT } from '../lib/globals';

export async function bindOptions(): Promise<void> {
  const document = DOCUMENT.get();
  const modal = <HTMLDivElement>document.querySelector('#optionsModal');
  const logo = <HTMLImageElement>document.querySelector('#logo');
  const content = <HTMLDivElement>document.querySelector('#optionsModal .content');
  logo.onclick = () => (modal.style.display = 'block');
  modal.onclick = event => {
    if (!content.contains(<HTMLElement>event.target)) modal.style.display = 'none';
  };

  const checkboxes: HTMLInputElement[] = Array.from(
    content.querySelectorAll('label input[type="checkbox"]'),
  );
  for (const checkbox of checkboxes) {
    const label = <HTMLLabelElement>checkbox.parentElement;
    const span = <HTMLSpanElement>label.querySelector('span');
    span.onclick = () => (checkbox.checked = !checkbox.checked);
  }

  const optionsLimitNode = <HTMLInputElement>document.querySelector('#optionsLimit');
  const optionsDupesNode = <HTMLInputElement>document.querySelector('#optionsDupes');
  const optionsAtLoad = await getOptions();

  optionsLimitNode.value = optionsAtLoad.tabLimit.toString();
  optionsDupesNode.checked = optionsAtLoad.archiveDupes;

  optionsDupesNode.onchange = async () => {
    await setOptions({
      archiveDupes: optionsDupesNode.checked,
    });
  };

  // From https://stackoverflow.com/questions/469357/html-text-input-allow-only-numeric-input
  // HTML5 validators have poor support at the moment.
  optionsLimitNode.onkeydown = (e): boolean => {
    return (
      e.ctrlKey ||
      e.altKey ||
      (47 < e.keyCode && e.keyCode < 58 && e.shiftKey == false) ||
      (95 < e.keyCode && e.keyCode < 106) ||
      e.keyCode == 8 ||
      e.keyCode == 9 ||
      (e.keyCode > 34 && e.keyCode < 40) ||
      e.keyCode == 46
    );
  };

  optionsLimitNode.onkeyup = async () => {
    const newLimit = Number(optionsLimitNode.value);
    if (newLimit != NaN) {
      await setOptions({
        tabLimit: newLimit,
      });
    }
  };
}
