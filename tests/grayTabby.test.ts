import { initGrayTabby, stubGlobals, unstubGlobals } from './utils';
import { bindArchivalHandlers } from '../src/bg/archive';

describe('graytabby', function() {
  beforeEach(async function() {
    await stubGlobals();
  });

  afterEach(function() {
    unstubGlobals();
  });

  it('frontend should attach to dom without throwing', async () => {
    await initGrayTabby();
  });

  it('backend should register handlers without throwing', async () => {
    await bindArchivalHandlers();
  });
});
