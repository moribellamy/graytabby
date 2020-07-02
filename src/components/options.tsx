import { h } from 'tsx-dom';
import { Options, setOptions } from '../lib/options';

export function setVisible(self: HTMLDivElement, visible: boolean): void {
  self.style.display = visible ? 'block' : 'none';
}

interface OptionsProps {
  options: Options;
  closeCallback: () => void;
}

export function OptionsComponent({ options, closeCallback }: OptionsProps): HTMLDivElement {
  const optionsDupesCheckbox = (
    <input type="checkbox" id="optionsDupes" checked={options.archiveDupes} />
  ) as HTMLInputElement;
  optionsDupesCheckbox.onchange = async () => {
    await setOptions({
      archiveDupes: optionsDupesCheckbox.checked,
    });
  };

  const optionsLimitTextbox = (
    <input type="text" id="optionsLimit" value={options.tabLimit} />
  ) as HTMLInputElement;
  optionsLimitTextbox.onkeydown = (e): boolean => {
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
  optionsLimitTextbox.onkeyup = async () => {
    const newLimit = Number(optionsLimitTextbox.value);
    if (newLimit != NaN) {
      await setOptions({
        tabLimit: newLimit,
      });
    }
  };

  // HACK
  const groupsPerPageTextbox = (
    <input type="text" id="optionsGroupsPerPage" value={options.groupsPerPage} />
  ) as HTMLInputElement;
  groupsPerPageTextbox.onkeydown = (e): boolean => {
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
  groupsPerPageTextbox.onkeyup = async () => {
    const newLimit = Number(groupsPerPageTextbox.value);
    if (newLimit != NaN) {
      await setOptions({
        groupsPerPage: newLimit,
      });
    }
  };

  const content = (
    <div class="content">
      <form class="pure-form pure-form-stacked">
        <fieldset>
          <legend>Options</legend>
          <label for="optionsLimit">Tabs Limit</label>
          {optionsLimitTextbox}
          <span class="pure-form-message">
            How many tabs to keep. Older tab groups are removed to keep you under this limit.
          </span>
          <label for="optionsGroupsPerPage">Groups Per Page</label>
          {groupsPerPageTextbox}
          <span class="pure-form-message">How many tab groups to load per page.</span>

          <label for="stacked-remember" class="pure-checkbox">
            {optionsDupesCheckbox}
            <span onClick={() => (optionsDupesCheckbox.checked = !optionsDupesCheckbox.checked)}>
              Keep duplicates.
            </span>
          </label>
          <span class="pure-form-message">
            If checked, identical tabs will not de-duplicate on archival.
          </span>
        </fieldset>
        <legend>Info</legend>
        <a href="https://github.com/moribellamy/graytabby" target="_new">
          Source Code (on GitHub)
        </a>
      </form>
    </div>
  ) as HTMLDivElement;

  const modal = (
    <div id="optionsModal" class="modal">
      {content}
    </div>
  ) as HTMLDivElement;

  modal.onclick = (event: MouseEvent) => {
    if (!content.contains(event.target as HTMLElement)) {
      setVisible(modal, false);
      closeCallback();
    }
  };
  return modal;
}
