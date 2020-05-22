import { stubGlobals, unstubGlobals } from './utils';
import { bindArchivalHandlers } from '../src/bg/archive';
import { graytabby } from '../src/app/graytabby';

describe('graytabby', function() {
  beforeEach(async function() {
    await stubGlobals();
  });

  afterEach(function() {
    unstubGlobals();
  });

  it('frontend should attach to dom without throwing', async () => {
    await graytabby();
  });

  it('backend should register handlers without throwing', async () => {
    await bindArchivalHandlers();
  });
});
