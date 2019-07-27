import {actionClickHandler, closeTabs, createTab, getAllTabs, updateTab} from "./ext";
import {moreTabs} from "./brokers";
import {archivePlan} from "./archive";
import {appURL} from "./utils";
import {optionsStore} from './storage'


async function clickHandler() {
  const allTabs = await getAllTabs();
  const options = await optionsStore.get();
  const keepDupes = options ? options.toggles.indexOf('keepDupes') !== -1 : false;
  let [homeTab, toArchiveTabs, toCloseTabs] = archivePlan(allTabs, appURL(), keepDupes);
  if (!homeTab) homeTab = await createTab({active: true, url: 'app.html'}, true);
  await closeTabs(toArchiveTabs.map(t => t.id));
  await closeTabs(toCloseTabs.map(t => t.id));
  let focus = updateTab(homeTab.id, {active: true});
  if (toArchiveTabs.length > 0) {
    await moreTabs.pub(toArchiveTabs);
  }
  await focus;
}

actionClickHandler(clickHandler);
