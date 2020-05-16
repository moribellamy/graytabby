import { initGrayTabby } from './utils';

describe('graytabby', function() {
  it('should attach to dom without throwing', async () => {
    await initGrayTabby();
  });
});
