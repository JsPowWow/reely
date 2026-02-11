import { type ChildDOMElement } from '@reely/dommy';
import { CounterNaiveRef } from './_1_counter.naiveRef.component';
import { CounterNaiveReelx } from './_2_counter.naiveReelx.component';
import { CounterReelxHandmade } from './_3_counter.reactive.handmade.reelx.component';
import { CaseCard } from './case.card.component';
import { CounterSignalsHandmade } from './_4_counter.reactive.handmade.signals.component';

const Counters = (props: { children: ChildDOMElement }) => {
  return (
    <div
      styles={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'center',
        gap: '10px',
        width: '100%',
        maxWidth: '600px',
        minWidth: '380px',
      }}
    >
      {props.children}
    </div>
  );
};

export const CountersPlayground = () => (
  <div styles={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <h1 styles={{ margin: '15px' }}>Counters</h1>
    <Counters>
      <CounterNaiveRef initialValue={11} />
      <CounterNaiveReelx initialValue={12} />
      <CaseCard caption='Reactive Counter Reelx (handmade)'>
        <CounterReelxHandmade />
      </CaseCard>
      <CaseCard caption='Reactive Counter Signals (handmade)'>
        <CounterSignalsHandmade initialValue={300} />
      </CaseCard>
    </Counters>
  </div>
);
