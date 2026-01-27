import styles from './case.card.component.module.css';
import { reelx, type RlxDerivedState, setAttribute, setStyleAttributes } from '@reely/dommy';
import { scopedLogger } from '@reely/logger';
import { flow, getPropertyDescriptor, hasProperty, isString, PrimitiveValue } from '@reely/utils';

export function CounterReelxHandmade() {
  const lightness = reelx(255);
  const lightnessColor = reelx(() => `rgb(${lightness()}, ${lightness()}, ${lightness()})`);
  const counter = reelx(200);

  // if `naive`:
  // const subscribe = (element: HTMLElement) => {
  //   subscribeFor(element, 'prop1', fn1);
  //   ...
  //   subscribeFor(element, 'propN', fn2);
  // };
  //
  // or with a flow + carried subscribe version
  // `flow(subscribeFor('prop1', counter), subscribeFor({ styleName: 'background-color' }, lightnessColor), ... , subscribeFor('propN', counter))`
  //
  const subscribe = flow(
    subscribeFor('textContent', counter),
    subscribeFor({ styleName: 'background-color' }, lightnessColor)
  );

  return (
    <div className={styles.caseContent}>
      <div id='counter3'>
        <div elementRef={subscribe} styles={{ height: '100%', padding: '8px' }} />
      </div>
      <button onclick={flow(() => counter(counter() + 1), scopedLogger().logWith('info', 'Incremented:'))}>👍</button>
      <button onclick={flow(() => counter(counter() - 1), scopedLogger().logWith('info', 'Decremented:'))}>👎</button>
      <button onclick={() => lightness(Math.max(lightness() - 10, 0))}>Get Darker</button>
      <button onclick={() => (lightness(255), counter(200))}>Reset</button>
    </div>
  );
}

function subscribeFor(property: string | { styleName: string }, fn: RlxDerivedState<PrimitiveValue>) {
  return <E extends HTMLElement>(element: E): E => {
    reelx(fn).subscribe((newVal) => {
      if (isString(property)) {
        const propSetter = getPropertyDescriptor(property, Object.getPrototypeOf(element))?.set ?? 0;
        if (propSetter) {
          scopedLogger().info(`[rlx] set property el.${property} = ${newVal}`);
          propSetter.call(element, newVal);
        } else {
          scopedLogger().info(`[rlx] setAttribute("${property}", ${newVal})`);
          setAttribute(element, property, newVal.toString());
        }
        return;
      }

      if (hasProperty('styleName', property)) {
        scopedLogger().info(`[rlx] set style ${property.styleName}: ${newVal};`);
        setStyleAttributes(element, { [property.styleName]: newVal.toString() });
        return;
      }
    });
    return element;
  };
}
