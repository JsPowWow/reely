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
import { AccountGuard } from './demos/router/account.guard';
import accountGuardSource from './demos/router/account.guard.ts?highlight';
import { CurrencyPrices } from './demos/router/currency.prices';
import currencyPricesSource from './demos/router/currency.prices.tsx?highlight';
import { FilesBrowser } from './demos/router/files.browser';
import filesBrowserSource from './demos/router/files.browser.tsx?highlight';
import { HelpWidget } from './demos/router/help.widget';
import helpWidgetSource from './demos/router/help.widget.tsx?highlight';
import { IssuesBoard } from './demos/router/issues.board';
import issuesBoardSource from './demos/router/issues.board.tsx?highlight';
import { MailClient } from './demos/router/mail.client';
import mailClientSource from './demos/router/mail.client.ts?highlight';
import { PhotoGallery } from './demos/router/photo.gallery';
import photoGallerySource from './demos/router/photo.gallery.ts?highlight';
import { LazySettings } from './demos/router/settings.lazy';
import lazySettingsSource from './demos/router/settings.lazy.ts?highlight';
import { ShopSearch } from './demos/router/shop.search';
import shopSearchSource from './demos/router/shop.search.ts?highlight';
import { StartLights } from './demos/start.lights';
import startLightsSource from './demos/start.lights.tsx?highlight';

import type { PackageText } from './package.text';
import type { SourceLines } from '../../highlight/source.types';
import type { PagedPackage } from '../../site/site.packages';

/** A live example on a package's page: what it says, the module that renders it, and its source. */
export interface PackageExample {
  id: keyof PackageText['examples'];
  /** The module's file, as the source caption names it. */
  file: string;
  Demo: () => Node;
  source: SourceLines;
}

export const packageExamples: Readonly<Record<PagedPackage, readonly PackageExample[]>> = {
  basics: [{ id: 'basics', file: 'analytics.trackers.tsx', Demo: AnalyticsTrackers, source: analyticsTrackersSource }],
  signals: [{ id: 'signals', file: 'order.total.tsx', Demo: OrderTotal, source: orderTotalSource }],
  router: [
    { id: 'router', file: 'mail.client.ts', Demo: MailClient, source: mailClientSource },
    { id: 'routerLazy', file: 'settings.lazy.ts', Demo: LazySettings, source: lazySettingsSource },
    { id: 'routerSearch', file: 'shop.search.ts', Demo: ShopSearch, source: shopSearchSource },
    { id: 'routerGuard', file: 'account.guard.ts', Demo: AccountGuard, source: accountGuardSource },
    { id: 'routerGallery', file: 'photo.gallery.ts', Demo: PhotoGallery, source: photoGallerySource },
    { id: 'routerHelp', file: 'help.widget.tsx', Demo: HelpWidget, source: helpWidgetSource },
    { id: 'routerKeep', file: 'currency.prices.tsx', Demo: CurrencyPrices, source: currencyPricesSource },
    { id: 'routerFiles', file: 'files.browser.tsx', Demo: FilesBrowser, source: filesBrowserSource },
    { id: 'routerIssues', file: 'issues.board.tsx', Demo: IssuesBoard, source: issuesBoardSource },
  ],
  'dommy-kit': [{ id: 'dommy-kit', file: 'reader.settings.tsx', Demo: ReaderSettings, source: readerSettingsSource }],
  emitter: [{ id: 'emitter', file: 'app.notices.tsx', Demo: AppNotices, source: appNoticesSource }],
  queue: [{ id: 'queue', file: 'pit.crews.tsx', Demo: PitCrews, source: pitCrewsSource }],
  'state-machine': [{ id: 'state-machine', file: 'start.lights.tsx', Demo: StartLights, source: startLightsSource }],
  'simple-store': [{ id: 'simple-store', file: 'cart.store.tsx', Demo: CartStore, source: cartStoreSource }],
  logger: [
    {
      id: 'logger',
      file: 'checkout.log.tsx',
      Demo: () => (
        <ConsoleEcho>
          <CheckoutLog />
        </ConsoleEcho>
      ),
      source: checkoutLogSource,
    },
  ],
  async: [{ id: 'async', file: 'rates.retry.tsx', Demo: RatesRetry, source: ratesRetrySource }],
  colors: [{ id: 'colors', file: 'brand.button.tsx', Demo: BrandButton, source: brandButtonSource }],
  strings: [{ id: 'strings', file: 'post.slugs.tsx', Demo: PostSlugs, source: postSlugsSource }],
};
