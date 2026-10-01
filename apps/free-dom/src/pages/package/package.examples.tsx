import { ConsoleEcho } from './console.echo';
import { AnalyticsTrackers } from './demos/analytics.trackers';
import analyticsTrackersSource from './demos/analytics.trackers.tsx?highlight';
import { AppNotices } from './demos/app.notices';
import appNoticesSource from './demos/app.notices.tsx?highlight';
import { BrandButton } from './demos/brand.button';
import brandButtonSource from './demos/brand.button.tsx?highlight';
import { CartStore } from './demos/cart.store';
import cartStoreSource from './demos/cart.store.tsx?highlight';
import { CheckoutLog } from './demos/checkout.log';
import checkoutLogSource from './demos/checkout.log.tsx?highlight';
import { OrderTotal } from './demos/order.total';
import orderTotalSource from './demos/order.total.tsx?highlight';
import { PitCrews } from './demos/pit.crews';
import pitCrewsSource from './demos/pit.crews.tsx?highlight';
import { PostSlugs } from './demos/post.slugs';
import postSlugsSource from './demos/post.slugs.tsx?highlight';
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
  basics: { file: 'analytics.trackers.tsx', Demo: AnalyticsTrackers, source: analyticsTrackersSource },
  signals: { file: 'order.total.tsx', Demo: OrderTotal, source: orderTotalSource },
  'dommy-kit': { file: 'reader.settings.tsx', Demo: ReaderSettings, source: readerSettingsSource },
  emitter: { file: 'app.notices.tsx', Demo: AppNotices, source: appNoticesSource },
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
