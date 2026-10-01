import { ConsoleEcho } from './console.echo';
import { BrandButton } from './demos/brand.button';
import brandButtonSource from './demos/brand.button.tsx?highlight';
import { CartStore } from './demos/cart.store';
import cartStoreSource from './demos/cart.store.tsx?highlight';
import { CheckoutLog } from './demos/checkout.log';
import checkoutLogSource from './demos/checkout.log.tsx?highlight';
import { FuelStrategy } from './demos/fuel.strategy';
import fuelStrategySource from './demos/fuel.strategy.tsx?highlight';
import { PitCrews } from './demos/pit.crews';
import pitCrewsSource from './demos/pit.crews.tsx?highlight';
import { PitWall } from './demos/pit.wall';
import pitWallSource from './demos/pit.wall.tsx?highlight';
import { PostSlugs } from './demos/post.slugs';
import postSlugsSource from './demos/post.slugs.tsx?highlight';
import { RaceControl } from './demos/race.control';
import raceControlSource from './demos/race.control.tsx?highlight';
import { RatesRetry } from './demos/rates.retry';
import ratesRetrySource from './demos/rates.retry.tsx?highlight';
import { ReaderSettings } from './demos/reader.settings';
import readerSettingsSource from './demos/reader.settings.tsx?highlight';
import { StartLights } from './demos/start.lights';
import startLightsSource from './demos/start.lights.tsx?highlight';

import type { SourceLines } from '../../highlight/source.types';
import type { PagedPackage } from '../../site/site.packages';

/** The live example on a package's page: the module that renders it, and its source. */
export interface PackageExample {
  /** The module's file, as the source caption names it. */
  file: string;
  Demo: () => Node;
  source: SourceLines;
}

export const packageExamples: Readonly<Record<PagedPackage, PackageExample>> = {
  basics: { file: 'pit.wall.tsx', Demo: PitWall, source: pitWallSource },
  signals: { file: 'fuel.strategy.tsx', Demo: FuelStrategy, source: fuelStrategySource },
  'dommy-kit': { file: 'reader.settings.tsx', Demo: ReaderSettings, source: readerSettingsSource },
  emitter: { file: 'race.control.tsx', Demo: RaceControl, source: raceControlSource },
  queue: { file: 'pit.crews.tsx', Demo: PitCrews, source: pitCrewsSource },
  'state-machine': { file: 'start.lights.tsx', Demo: StartLights, source: startLightsSource },
  'simple-store': { file: 'cart.store.tsx', Demo: CartStore, source: cartStoreSource },
  logger: {
    file: 'checkout.log.tsx',
    Demo: () => (
      <ConsoleEcho>
        <CheckoutLog />
      </ConsoleEcho>
    ),
    source: checkoutLogSource,
  },
  async: { file: 'rates.retry.tsx', Demo: RatesRetry, source: ratesRetrySource },
  colors: { file: 'brand.button.tsx', Demo: BrandButton, source: brandButtonSource },
  strings: { file: 'post.slugs.tsx', Demo: PostSlugs, source: postSlugsSource },
};
