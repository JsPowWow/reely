import { SourceView } from '../../demo/source.view';
import { measured } from '../../site/measurements';
import { Board as KeyedBoard } from '../evolution/steps/step12.keyed-list';
import keyedListSource from '../evolution/steps/step12.keyed-list.tsx?highlight';
import { Board as LiveBoard } from '../evolution/steps/step13.five-hundred';
import fiveHundredSource from '../evolution/steps/step13.five-hundred.tsx?highlight';
import { ReelyLinks as JsxLinks } from '../evolution/steps/step2.jsx';
import jsxSource from '../evolution/steps/step2.jsx.tsx?highlight';
import { ReelyLinks as ComponentLinks } from '../evolution/steps/step3.components';
import componentsSource from '../evolution/steps/step3.components.tsx?highlight';
import { Counter as DerivedCounter } from '../evolution/steps/step8.derived';
import derivedSource from '../evolution/steps/step8.derived.ts?highlight';
import { Counter as GetterCounter } from '../evolution/steps/step9.getter';
import getterSource from '../evolution/steps/step9.getter.ts?highlight';
import { Counter as BatchCounter } from '../evolution/steps/step11.batch';
import batchSource from '../evolution/steps/step11.batch.ts?highlight';
import { CheckboxCounter } from './demos/advanced/checkbox.counter';
import checkboxCounterSource from './demos/advanced/checkbox.counter.tsx?highlight';
import { ConditionalBinding } from './demos/advanced/conditional.binding';
import conditionalBindingSource from './demos/advanced/conditional.binding.tsx?highlight';
import { Flavours } from './demos/advanced/flavours';
import flavoursSource from './demos/advanced/flavours.tsx?highlight';
import { Greeting } from './demos/advanced/greeting';
import greetingSource from './demos/advanced/greeting.tsx?highlight';
import { LabelAfterMount } from './demos/advanced/label.after.mount';
import labelAfterMountSource from './demos/advanced/label.after.mount.tsx?highlight';
import { PreOrSpan } from './demos/advanced/pre.or.span';
import preOrSpanSource from './demos/advanced/pre.or.span.tsx?highlight';
import { TurnBold } from './demos/advanced/turn.bold';
import turnBoldSource from './demos/advanced/turn.bold.tsx?highlight';
import { Counter } from './demos/first.counter';
import firstCounterSource from './demos/first.counter.tsx?highlight';
import { LapClock } from './demos/lap.clock';
import lapClockSource from './demos/lap.clock.tsx?highlight';
import { PitWall } from './demos/pit.stop';
import pitStopSource from './demos/pit.stop.tsx?highlight';
import { RaceFinish } from './demos/race.finish';
import raceFinishSource from './demos/race.finish.tsx?highlight';
import derivationSource from './snippets/advanced.derivation.ts?highlight';
import granularitySource from './snippets/advanced.granularity.ts?highlight';
import resourceSource from './snippets/async.resource.tsx?highlight';
import listsSource from './snippets/lists.for.tsx?highlight';
import signalsSource from './snippets/signals.api.ts?highlight';
import mountSource from './snippets/start.mount.tsx?highlight';

import { Live } from './docs.live';

import type { SourceLines } from '../../highlight/source.types';

/** The groups of the docs rail, in the order the library is layered. */
export const docGroups = ['Start', 'Markup', 'Reactivity', 'Structure', 'Deeper', 'Measure'] as const;

export type DocGroup = (typeof docGroups)[number];

/** One docs page: one question, its answer running with DOM writes counted, then the details. */
export interface DocTopic {
  slug: string;
  group: DocGroup;
  title: string;
  lead: string;
  Demo: () => Node;
  /** The module that renders the demo, highlighted at build time. */
  source: SourceLines;
  /** The rest of the answer: the API and its rules, after the demo. */
  Details: () => Node;
}

/** Text that is not TypeScript (a command, a config file), shown in the same panel. */
const plain = (text: string): SourceLines => text.split('\n').map((line) => [{ content: line }]);

const Code = ({ caption, source }: { caption: string; source: SourceLines }): Node => (
  <SourceView caption={caption} source={source} />
);

export const docTopics: readonly DocTopic[] = [
  {
    slug: 'getting-started',
    group: 'Start',
    title: 'Getting started',
    lead: 'Install @reely/dommy, point JSX at it, and mount a view. The counter below is the whole program: a click edits one text node, and the board under it counts exactly that.',
    Demo: Counter,
    source: firstCounterSource,
    Details: () => (
      <>
        <h2>Install</h2>
        <Code caption='Terminal' source={plain('npm i @reely/dommy@next')} />
        <p>
          The package has no dependencies and ships ES modules with TypeScript types. It is a pre-release: the{' '}
          <code>next</code> tag installs the API these docs describe.
        </p>
        <h2>Set up JSX</h2>
        <Code
          caption='tsconfig.json'
          source={plain('{\n  "compilerOptions": {\n    "jsx": "react-jsx",\n    "jsxImportSource": "@reely/dommy"\n  }\n}')}
        />
        <p>
          esbuild takes <code>--jsx=automatic --jsx-import-source=@reely/dommy</code>; Vite reads both options from{' '}
          <code>tsconfig.json</code>. JSX is optional: every tag is also a function, see{' '}
          <a href='/docs/elements'>Elements and JSX</a>.
        </p>
        <h2>Mount a view</h2>
        <Code caption='main.tsx' source={mountSource} />
        <p>
          <code>mount</code> renders once. From then on, only the nodes bound to a signal change, and{' '}
          <code>unmount()</code> removes the view with every binding it made.
        </p>
      </>
    ),
  },
  {
    slug: 'elements',
    group: 'Markup',
    title: 'Elements and JSX',
    lead: 'Every HTML tag is a function that returns a real element: props first, children after. JSX compiles to the same calls, so both build exactly the same nodes, once.',
    Demo: JsxLinks,
    source: jsxSource,
    Details: () => (
      <>
        <h2>Props are DOM names</h2>
        <ul>
          <li>
            <code>className</code>, <code>htmlFor</code>, <code>tabIndex</code>; <code>value</code>,{' '}
            <code>checked</code> and other live state are set as properties, not attributes.
          </li>
          <li>
            <code>{"styles={{ marginTop: '1rem', '--accent': 'red' }}"}</code> sets inline styles, custom properties
            included.
          </li>
          <li>
            <code>{"aria={{ role: 'status', ariaLabel: 'Score' }}"}</code> sets <code>role</code> and{' '}
            <code>aria-*</code>.
          </li>
          <li>
            <code>onClick</code> and every other <code>on*</code> prop takes a function; the event and{' '}
            <code>event.currentTarget</code> are typed by the element. A string is never set as an inline handler.
          </li>
          <li>
            <code>elementRef</code> gets the element, typed by its tag: an object from{' '}
            <code>createObjectReference()</code>, or a function.
          </li>
        </ul>
        <h2>Text stays text</h2>
        <p>Strings and numbers become text nodes, so user input can never turn into markup.</p>
        <h2>Factories or JSX</h2>
        <p>
          A factory returns its exact type: <code>canvas()</code> is an <code>HTMLCanvasElement</code>. A JSX
          expression is a <code>Node</code>, whatever the tag, because TypeScript gives every JSX expression one type;
          when you need the element itself, take it from <code>elementRef</code>. SVG tags are created in the SVG
          namespace either way.
        </p>
      </>
    ),
  },
  {
    slug: 'components',
    group: 'Markup',
    title: 'Components',
    lead: 'A component is a plain function of props that runs once. There is no re-render to schedule: what changes later changes through bindings, node by node.',
    Demo: ComponentLinks,
    source: componentsSource,
    Details: () => (
      <>
        <h2>What a component returns</h2>
        <p>
          A <code>ReelyNode</code>, the counterpart of React’s <code>ReactNode</code>: a node, text, a number, a getter,
          nothing (<code>null</code>, <code>undefined</code>, a boolean) or a list of these. <code>children</code> are a{' '}
          <code>ReelyNode</code> too. A component that returns markup declares <code>(): Node</code>; one that may
          return text or nothing declares <code>(): ReelyNode</code>.
        </p>
        <h2>A JSX expression is a node</h2>
        <p>
          <code>{'<Card />'}</code> is always one <code>Node</code>, ready for <code>append</code>. A tag gives its
          element; a component that returns something else gives a <code>DocumentFragment</code> of it, like{' '}
          <code>{'<>…</>'}</code>. A fragment empties into its parent when it is inserted, so place it once; to move or
          remove it later, keep it inside an element or render it with <code>mount</code>.
        </p>
      </>
    ),
  },
  {
    slug: 'signals',
    group: 'Reactivity',
    title: 'Signals',
    lead: 'A signal is a value that knows who reads it. A computed value derives from signals, an effect re-runs when what it read changes, and all of it happens synchronously.',
    Demo: DerivedCounter,
    source: derivedSource,
    Details: () => (
      <>
        <h2>The API</h2>
        <Code caption='signals.ts' source={signalsSource} />
        <ul>
          <li>
            <code>signal(value)</code> holds any value, a function included; <code>.value</code> reads and subscribes,{' '}
            <code>.peek()</code> reads without subscribing.
          </li>
          <li>
            <code>computed(fn)</code> runs <code>fn</code> when it is read after a change, and caches the result, a
            thrown error included.
          </li>
          <li>
            <code>effect(fn)</code> runs now and after every change it depends on; it returns the function that stops it.{' '}
            <code>onCleanup</code> inside it runs before the next run and when it stops.
          </li>
          <li>A write of an equal value (<code>Object.is</code>) changes nothing and runs nothing.</li>
        </ul>
      </>
    ),
  },
  {
    slug: 'bindings',
    group: 'Reactivity',
    title: 'Bindings',
    lead: 'A signal or any function in a child or a prop is bound: when the signals it reads change, dommy writes the new value to that one text node or attribute, and only when the value really differs.',
    Demo: GetterCounter,
    source: getterSource,
    Details: () => (
      <>
        <h2>What can be bound</h2>
        <ul>
          <li>A child: the signal or getter becomes one text node whose text follows it.</li>
          <li>
            A prop, other than <code>on*</code>: <code>className</code>, <code>disabled</code>, a <code>styles</code>{' '}
            entry, an <code>aria</code> entry, a data attribute.
          </li>
        </ul>
        <h2>Values</h2>
        <p>
          A bound <code>null</code> or <code>undefined</code> removes the attribute; boolean props such as{' '}
          <code>hidden</code> and <code>disabled</code> take <code>true</code> and <code>false</code>. A function child
          renders text; to switch between whole nodes, use <a href='/docs/conditions'>Show</a>.
        </p>
        <h2>Released with their view</h2>
        <p>
          Every binding belongs to the view that created it and is released when that view goes: by{' '}
          <code>unmount()</code>, a removed row of <code>For</code> or a hidden branch of <code>Show</code>.
        </p>
      </>
    ),
  },
  {
    slug: 'batch',
    group: 'Reactivity',
    title: 'Batch',
    lead: 'Effects and bindings run synchronously, after every write. batch applies several writes first and runs each binding once when it returns: this summary is written once per click, not twice.',
    Demo: BatchCounter,
    source: batchSource,
    Details: () => (
      <>
        <h2>When to batch</h2>
        <p>
          When one action writes several signals that the same view reads. Without <code>batch</code> the view is
          correct after every write, just written more often; with it, it is written once, with the final values.
        </p>
        <p>
          <code>batch(fn)</code> returns what <code>fn</code> returns. Batches nest: the outermost one runs the effects.
        </p>
      </>
    ),
  },
  {
    slug: 'lists',
    group: 'Structure',
    title: 'Keyed lists',
    lead: 'For renders one row per key, once. When the items change, a row whose key stays keeps its nodes, and only the rows that changed places are moved: race a lap and count the moves.',
    Demo: KeyedBoard,
    source: keyedListSource,
    Details: () => (
      <>
        <h2>The props</h2>
        <Code caption='standings.tsx' source={listsSource} />
        <ul>
          <li>
            <code>each</code>: a signal or a getter of an array.
          </li>
          <li>
            <code>by</code>: the key of an item. JSX keeps <code>key</code> for itself, so the prop has its own name.
          </li>
          <li>
            <code>children</code>: renders one row. <code>racer()</code> and <code>index()</code> are getters that follow
            later updates of that key, so the row updates through its bindings instead of being built again.
          </li>
        </ul>
        <h2>What survives a reorder</h2>
        <p>
          A row that keeps its key keeps its nodes, so focus, text selection and input state inside it survive. New
          keys get new rows; removed rows go with their bindings. The fewest rows needed are moved: the ones outside the
          longest run that is already in order.
        </p>
      </>
    ),
  },
  {
    slug: 'conditions',
    group: 'Structure',
    title: 'Conditions',
    lead: 'Show renders children while when is truthy and fallback otherwise. A branch is built when it is shown and removed with its bindings when it is hidden; while the truthiness stays, the branch stays and updates itself.',
    Demo: RaceFinish,
    source: raceFinishSource,
    Details: () => (
      <>
        <h2>The props</h2>
        <ul>
          <li>
            <code>when</code>: a signal or a getter; only a change of its truthiness switches the branch, so the laps
            above update the text without rebuilding it.
          </li>
          <li>
            <code>children</code> and <code>fallback</code>: functions that build a branch. <code>fallback</code> is
            optional; without it nothing is shown.
          </li>
        </ul>
        <p>
          Press Next lap and count one text edit. Press Finish and count the nodes: the fallback paragraph goes, the
          winner’s plate comes.
        </p>
        <h2>A new branch for a new value</h2>
        <p>
          <code>Show</code> keeps its branch while the truthiness stays. <code>Keyed</code> builds the branch anew, with
          new state, whenever its value changes: <code>
            {'<Keyed value={reviewer}>{(name) => <ReviewForm name={name} />}</Keyed>'}
          </code>{' '}
          gives every reviewer an empty form.
        </p>
      </>
    ),
  },
  {
    slug: 'async',
    group: 'Structure',
    title: 'Async',
    lead: 'Await shows the fallback while a promise is pending, then its result or its error. Give it a getter and it loads again when a signal it reads changes; only the latest promise ever renders.',
    Demo: PitWall,
    source: pitStopSource,
    Details: () => (
      <>
        <h2>The props</h2>
        <ul>
          <li>
            <code>promise</code>: a promise, or a signal or getter of one. A getter is tracked: here it reads the stop
            number, so every call to the pits loads again. <code>promise={'{'}load{'}'}</code> starts the load when the
            view renders.
          </li>
          <li>
            <code>children</code>: a function of the value, built once the promise resolves.
          </li>
          <li>
            <code>fallback</code>: shown while the promise is pending; nothing by default.
          </li>
          <li>
            <code>catch</code>: a function of the reason, as an <code>Error</code>. It is required, so a failure always
            has a view; JavaScript that leaves it out shows the error as text.
          </li>
        </ul>
        <h2>A resource from a getter</h2>
        <p>
          A getter of the promise is all a resource needs: it reads the signals the request depends on, so a change
          loads again. The fallback shows while the new request runs, and an answer that comes late for the old one is
          dropped.
        </p>
        <Code caption='lap.leader.tsx' source={resourceSource} />
        <h2>Only the latest promise</h2>
        <p>
          Press Box, box twice while the crew works: the first stop never posts, its answer is dropped. A promise that
          settles after the view is taken down renders nothing either. The third stop fails; pressing again is the
          retry, since the getter reads the stop number.
        </p>
        <p>
          Every stop after the first costs the board 4 nodes: the result goes and the fallback comes, then the other
          way round.
        </p>
      </>
    ),
  },
  {
    slug: 'lifecycle',
    group: 'Structure',
    title: 'Mount and cleanup',
    lead: 'mount appends a view and returns the function that takes it down: the nodes go, and every binding, effect and cleanup created while rendering it is released. onCleanup adds your own release.',
    Demo: LapClock,
    source: lapClockSource,
    Details: () => (
      <>
        <h2>onCleanup</h2>
        <p>
          Register what the view started: a timer, an animation frame, an observer, an outside subscription. Mount the
          stopwatch, then unmount it: the timer count goes back to zero because its cleanup ran.
        </p>
        <h2>Who takes a view down</h2>
        <ul>
          <li>
            <code>unmount()</code>, the function <code>mount</code> returned.
          </li>
          <li>
            <code>For</code>, for a row whose key is gone; <code>Show</code>, <code>Keyed</code> and{' '}
            <code>Await</code>, for the branch they hide.
          </li>
          <li>An effect, before its next run and when it is stopped.</li>
        </ul>
      </>
    ),
  },
  {
    slug: 'advanced',
    group: 'Deeper',
    title: 'Advanced topics',
    lead: 'The pitfalls VanJS lists in its own advanced topics, each answered in reely with a live demo. First, conditional bindings: a binding depends on what its last run read, so the sum below runs for a and b, or for c and d, never for all four.',
    Demo: ConditionalBinding,
    source: conditionalBindingSource,
    Details: () => (
      <>
        <h2>Conditional bindings</h2>
        <p>
          Change c while the formula is a + b: the run count stays. Switch the formula, and a and b stop counting
          instead. The same holds for a <code>computed</code> and an <code>effect</code>. Every answer on this page is also
          checked by the specs of @reely/dommy (<code>advanced.topics.spec.tsx</code>), and the headings follow{' '}
          <a href='https://vanjs.org/advanced'>vanjs.org/advanced</a>.
        </p>
        <h2>DOM attributes vs. properties</h2>
        <p>
          Live state (<code>value</code>, <code>checked</code>, <code>selected</code>, <code>indeterminate</code>,{' '}
          <code>muted</code>) is set as a property, so the form shows it. Everything else is an attribute, a read-only{' '}
          <code>list</code> included. A property that takes an object, such as <code>srcObject</code>, goes through{' '}
          <code>elementRef</code>.
        </p>
        <Live Demo={Flavours} caption='flavours.tsx' source={flavoursSource} />
        <h2>Why can’t a signal hold a DOM node?</h2>
        <p>
          A bound child is text. In VanJS a state holding one node, bound in two places, can be in one place only, so
          the first name disappears. In reely a signal of nodes does not type-check as a child, and from JavaScript it
          renders as text and the dommy logger reports it. To switch nodes, use <code>Show</code> or{' '}
          <code>Keyed</code>: each place builds its own node.
        </p>
        <Live Demo={TurnBold} caption='turn.bold.tsx' source={turnBoldSource} />
        <h2>Signal granularity</h2>
        <p>
          A binding runs again when any signal it read changes. Prefer a signal per field that changes on its own; when
          the object stays one signal, read a field through a <code>computed</code>, which passes a change on only when
          its result differs.
        </p>
        <Code caption='granularity.ts' source={granularitySource} />
        <h2>The scope of DOM updates</h2>
        <p>
          VanJS advises a derived state so that typing does not rebuild the whole paragraph. Here there is nothing to
          remember: a function child renders text, and <code>Show</code> keeps its branch while the truthiness of{' '}
          <code>when</code> stays. Type a name and count one text edit per key; clear it and count the nodes.
        </p>
        <Live Demo={Greeting} caption='greeting.tsx' source={greetingSource} />
        <h2>Advanced state derivation</h2>
        <p>
          One effect can write several signals from one source. The timed derivations VanJS builds by hand come from{' '}
          <code>@reely/dommy/kit</code>: <code>persisted</code> keeps a signal in storage, <code>throttled</code> passes
          at most one change per interval, and <code>later</code> delays a write and is cancelled by the next change.
        </p>
        <Code caption='derivation.ts' source={derivationSource} />
        <h2>Self-referencing in effects</h2>
        <p>
          The effect below reads <code>timesChecked</code> and then writes it. As in VanJS 1.3, a signal an effect reads
          and then writes stops being its dependency, so its own write does not run it again and Reset sets the count to
          0 for good. It still runs for <code>checked</code>, which it only reads. The price: an effect cannot clamp a
          signal it writes; a <code>computed</code> can. Two effects that write what the other reads would run
          forever; after 100 waves of writes the flush throws a cycle error instead.
        </p>
        <Live Demo={CheckboxCounter} caption='checkbox.counter.tsx' source={checkboxCounterSource} />
        <h2>Releasing bindings</h2>
        <p>
          VanJS collects the bindings of disconnected nodes as garbage, so a view built across an <code>await</code> can
          lose them. reely has no such collection: bindings are released by their owner. A branch that goes releases the
          signal, the computed and the subscriptions made in it. Switch as often as you like; one branch stays alive.
        </p>
        <Live Demo={PreOrSpan} caption='pre.or.span.tsx' source={preOrSpanSource} />
        <p>
          The other side: a node built outside any owner, at module level or in an event handler and appended by hand,
          keeps its bindings as long as their signals live. Build views inside <code>mount</code> and switch nodes with
          the flow components.
        </p>
        <h2>Lifecycle hooks</h2>
        <p>
          A component runs before its nodes are in the document. What must run once they are, such as focusing a field
          or reading the rendered text, goes in <code>later(0, fn)</code> from <code>@reely/dommy/kit</code>; it is
          cancelled if the view goes first. Increment rebuilds the label, and the message reads it from the document. The
          other end is <code>onCleanup</code>, run when the owner lets the view go; a node moved out of the document by
          other code is noticed only by a custom element’s <code>disconnectedCallback</code>.
        </p>
        <Live Demo={LabelAfterMount} caption='label.after.mount.tsx' source={labelAfterMountSource} />
      </>
    ),
  },
  {
    slug: 'performance',
    group: 'Measure',
    title: 'Size and speed',
    lead: 'A race on a field of hundreds, timed in your browser from the write to the finished layout. Then give every row a new key on every lap and watch what rebuilding costs instead of moving.',
    Demo: LiveBoard,
    source: fiveHundredSource,
    Details: () => (
      <>
        <h2>Size</h2>
        <table>
          <caption>What an app ships of @reely/dommy, minified and gzipped</caption>
          <thead>
            <tr>
              <th scope='col'>App</th>
              <th scope='col'>gzip</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope='row'>Signals only</th>
              <td>{measured.signalsOnly}</td>
            </tr>
            <tr>
              <th scope='row'>
                JSX with <code>For</code>, <code>Show</code> and <code>mount</code>
              </th>
              <td>{measured.jsxApp}</td>
            </tr>
            <tr>
              <th scope='row'>The whole package</th>
              <td>{measured.wholePackage}</td>
            </tr>
          </tbody>
        </table>
        <p>
          Measured on the packed npm tarball, bundled with esbuild. There are no runtime dependencies, and the package is
          tree-shakeable: what an app does not import, it does not ship.
        </p>
        <h2>Speed</h2>
        <p>
          The demo above times every lap in your browser, from the write to the finished layout. Its numbers are the
          ones that count: they come from your machine, not from ours.
        </p>
      </>
    ),
  },
];
