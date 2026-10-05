import { describe, expectTypeOf, it } from 'vitest';

import type { Routes as RouterRoutes } from '@reely/router';

import type { Page, Routes } from './router.types';

describe('Routes', () => {
  it('is the router package `Routes`, of dommy pages unless another page type is named', () => {
    expectTypeOf<Routes>().toEqualTypeOf<RouterRoutes<Page>>();
    expectTypeOf<Routes<() => string>>().toEqualTypeOf<RouterRoutes<() => string>>();
  });
});
