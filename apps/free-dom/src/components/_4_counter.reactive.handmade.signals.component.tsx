import styles from './case.card.component.module.css';
import { computed, effect, type RlxSubscribe, setAttribute, setStyleAttributes, signal } from '@reely/dommy';
import { scopedLogger } from '@reely/logger';
import { flow, getPropertyDescriptor, hasProperty, isString, mapNullable, pipe, PrimitiveValue } from '@reely/utils';

interface CounterProps {
  initialValue?: number;
}

export function CounterSignalsHandmade(props: CounterProps) {
  const counter = signal(props.initialValue ?? 0);

  const lightness = signal(255);
  const color = computed(() => `rgb(${lightness.value}, ${lightness()}, ${lightness.value})`);

  effect(() => {
    scopedLogger().info(`[signal] effect - counter:${counter.value}, lightness:${lightness.value}, `);
  });

  return (
    <div className={styles.caseContent}>
      <div id='counter4'>
        <div
          elementRef={mapNullable(
            flow(subscribeFor('textContent', counter), subscribeFor({ styleName: 'backgroundColor' }, color))
          )}
          styles={{ height: '100%', padding: '8px' }}
        />
      </div>
      <button onclick={flow(() => ++counter.value, scopedLogger().logWith('info', 'Incremented:'))}>👍</button>
      <button onclick={flow(() => --counter.value, scopedLogger().logWith('info', 'Decremented:'))}>👎</button>
      <button onclick={() => pipe(Math.max(lightness.value - 10, 0), lightness)}>Get Darker</button>
      <button
        onclick={flow(
          () => lightness(255),
          () => counter(200)
        )}
      >
        Reset
      </button>
    </div>
  );
}

function subscribeFor(
  property: string | { styleName: keyof CSSStyleDeclaration },
  observable: RlxSubscribe<PrimitiveValue>
) {
  return <E extends HTMLElement>(element: E): E => {
    observable.subscribe((value) => {
      if (isString(property)) {
        const propSetter = getPropertyDescriptor(property, Object.getPrototypeOf(element))?.set ?? 0;
        if (propSetter) {
          scopedLogger().info(`[signal] set property el.${property} = ${value}`);
          propSetter.call(element, value);
        } else {
          scopedLogger().info(`[signal] setAttribute("${property}", ${value})`);
          setAttribute(element, property, value.toString());
        }
        return;
      }

      if (hasProperty('styleName', property)) {
        scopedLogger().info(`[signal] set style ${property.styleName}: ${value};`);
        setStyleAttributes(element, { [property.styleName]: value.toString() });
        return;
      }
    });
    return element;
  };
}
