import './nx.naive.css';
import { type ChildDOMElement } from '@reely/dommy';
import { pipe } from '@reely/utils';
import { appendTo } from '@reely/dommy';
import { CounterNaiveRef } from '../components/_1_counter.naiveRef.component';
import { CounterNaiveReelx } from '../components/_2_counter.naiveReelx.component';
import { CounterReelxHandmade } from '../components/_3_counter.reactive.handmade.reelx.component';
import { CaseCard } from '../components/case.card.component';
import { CounterSignalsHandmade } from '../components/_4_counter.reactive.handmade.signals.component';

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

const App = (
  <div styles={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <h1 styles={{ margin: '15px' }}>Hello World</h1>
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

pipe(App, appendTo(document.body));
