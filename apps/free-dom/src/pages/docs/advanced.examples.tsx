import { AddressView } from './demos/advanced/address.view';
import addressViewSource from './demos/advanced/address.view.tsx?highlight';
import { CouponHint } from './demos/advanced/coupon.hint';
import couponHintSource from './demos/advanced/coupon.hint.tsx?highlight';
import { Flavours } from './demos/advanced/flavours';
import flavoursSource from './demos/advanced/flavours.tsx?highlight';
import { PlayCounter } from './demos/advanced/play.counter';
import playCounterSource from './demos/advanced/play.counter.tsx?highlight';
import { SalePrice } from './demos/advanced/sale.price';
import salePriceSource from './demos/advanced/sale.price.tsx?highlight';
import { SlideCaption } from './demos/advanced/slide.caption';
import slideCaptionSource from './demos/advanced/slide.caption.tsx?highlight';
import { Live } from './docs.live';

/** The live demos the advanced topic places between its paragraphs. */
export interface AdvancedExamples {
  flavours: Node;
  salePrice: Node;
  couponHint: Node;
  playCounter: Node;
  addressView: Node;
  slideCaption: Node;
}

export const advancedExamples = (): AdvancedExamples => ({
  flavours: <Live Demo={Flavours} caption='flavours.tsx' source={flavoursSource} />,
  salePrice: <Live Demo={SalePrice} caption='sale.price.tsx' source={salePriceSource} />,
  couponHint: <Live Demo={CouponHint} caption='coupon.hint.tsx' source={couponHintSource} />,
  playCounter: <Live Demo={PlayCounter} caption='play.counter.tsx' source={playCounterSource} />,
  addressView: <Live Demo={AddressView} caption='address.view.tsx' source={addressViewSource} />,
  slideCaption: <Live Demo={SlideCaption} caption='slide.caption.tsx' source={slideCaptionSource} />,
});
