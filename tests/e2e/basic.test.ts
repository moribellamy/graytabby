import { resolve } from 'path';
import { Builder, By, WebElement, WebDriver, until } from 'selenium-webdriver';
import { Options as chromeOptions, Driver } from 'selenium-webdriver/chrome';
import { expect } from 'chai';

async function shadowRootFor(driver: WebDriver, parent: WebElement, by: By): Promise<WebElement> {
  let found = await parent.findElement(by);
  return driver.executeScript('return arguments[0].shadowRoot', found);
}

async function webElementInnerTexts(elems: WebElement[]): Promise<string[]> {
  let retval = [];
  for (let elem of elems) retval.push(await elem.getText());
  return retval;
}

async function newTab(driver: WebDriver, url: string) {
  await driver.executeScript(`window.open("${url}")`);
  let handles = await driver.getAllWindowHandles();
  let handle = handles[handles.length - 1];
  await driver.switchTo().window(handle);
  let title = url.split('=').pop();  // Expecting to end in "test=foo"
  await driver.wait(until.titleIs(title));
  await driver.wait(until.urlContains(url));
}

function doArchive(driver: WebDriver) {
  return driver.executeAsyncScript('doArchive(arguments[0])');
}

function waitForTabs(driver: WebDriver, titles: string[]) {
  return driver.executeAsyncScript('waitForTabs(arguments[0], arguments[1])', titles);
}

async function getDriverAtGrayTabby(): Promise<WebDriver> {
  let extPath = resolve(__dirname, '../../dist/')
  let options = new chromeOptions();
  options.addArguments(
    `--load-extension=${extPath}`
  );
  let driver = new Builder().forBrowser('chrome').setChromeOptions(options).build();

  await driver.get('chrome://extensions');
  let body = await driver.findElement(By.tagName('body'));
  let extensionsManager = await shadowRootFor(driver, body, By.tagName('extensions-manager'));
  let extensionsItemList = await shadowRootFor(driver, extensionsManager, By.tagName('extensions-item-list'));
  let itemsContainer = await extensionsItemList.findElement(By.className('items-container'));
  let items = await itemsContainer.findElements(By.tagName('extensions-item'));
  let grayTabby = items[items.length - 1];
  await driver.get(`chrome-extension://${await grayTabby.getAttribute('id')}/app.html`);

  return driver;
}

describe('GrayTabby', () => {
  it('should complete the basic e2e flow', async function () {
    this.timeout(6000);
    let driver = await getDriverAtGrayTabby();
    expect(await driver.findElements(By.css('.se-group'))).to.have.lengthOf(0);

    let mainHandle = await driver.getWindowHandle();
    await newTab(driver, 'app.html?test=one');
    await newTab(driver, 'app.html?test=two');
    await newTab(driver, 'app.html?test=three');

    driver.switchTo().window(mainHandle);
    await doArchive(driver);
    await driver.wait(until.elementLocated(By.css('.se-group')), 1000);
    expect(await driver.findElements(By.css('.se-group'))).to.have.lengthOf(1);
    let links = await driver.findElements(By.css('.se-group li a'))
    expect(await webElementInnerTexts(links)).to.deep.equal(['one', 'two', 'three']);

    let one = driver.findElement(By.partialLinkText('one'));
    await one.click();
    let three = driver.findElement(By.partialLinkText('three'));
    await three.click();
    await waitForTabs(driver, ['one', 'three']);
    await doArchive(driver);
    await driver.wait(until.elementLocated(By.css('.se-group:nth-child(2)')), 1000);
    expect(await driver.findElements(By.css('.se-group'))).to.have.lengthOf(2);
    links = await driver.findElements(By.css('.se-group:nth-child(1) li a'));
    expect(await webElementInnerTexts(links)).to.deep.equal(['one', 'three']);
    links = await driver.findElements(By.css('.se-group:nth-child(2) li a'));
    expect(await webElementInnerTexts(links)).to.deep.equal(['two']);
  });
});
