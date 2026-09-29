// Runs dommy's signal specs against this core: its modules stand in for dommy's own.
vi.mock(
  '../../packages/dommy/src/lib/reactive/preact-like/preact-like.signal',
  () => import('./act/preact-like/preact-like.signal')
);
vi.mock('../../packages/dommy/src/lib/reactive/reelx/reelx.core', () => import('./act/reelx/reelx.core'));

import '../../packages/dommy/src/lib/reactive/preact-like/preact-like.signal.spec';
import '../../packages/dommy/src/lib/reactive/preact-like/preact-like.signal.reely.spec';
import '../../packages/dommy/src/lib/reactive/reelx/reelx.core.spec';

import * as core from '../../packages/dommy/src/lib/reactive/reelx/reelx.core';

it('runs the specs against this core, not the one dommy ships', () => {
  expect(core).toHaveProperty('reelx');
});
