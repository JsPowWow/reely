import { localized } from '../../i18n/localized';
import { measured } from '../../site/measurements';
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
import { Code, Live, plain } from './docs.live';
import derivationSource from './snippets/advanced.derivation.ts?highlight';
import granularitySource from './snippets/advanced.granularity.ts?highlight';
import forecastSource from './snippets/async.forecast.tsx?highlight';
import listsSource from './snippets/lists.inbox.tsx?highlight';
import signalsSource from './snippets/signals.api.ts?highlight';
import mountSource from './snippets/start.mount.tsx?highlight';

import type { DocGroup, DocSlug } from './docs.topics';

/** The words of one docs page: its question, the answer's lead, and the details after the demo. */
export interface TopicText {
  title: string;
  lead: string;
  Details: () => Node;
}

const en = {
  /** Follows the topic's title in the tab. */
  documentTitle: 'reely docs',
  home: 'Docs',
  railLabel: 'Docs topics',
  groups: {
    start: 'Start',
    markup: 'Markup',
    reactivity: 'Reactivity',
    structure: 'Structure',
    deeper: 'Deeper',
    measure: 'Measure',
  } satisfies Record<DocGroup, string>,
  Keys: (): Node => (
    <>
      Use <kbd>←</kbd> and <kbd>→</kbd> to move between topics.
    </>
  ),
  missing: {
    title: (slug: string): string => `There is no topic “${slug}”`,
    lead: 'Pick a topic from the list, or start from the beginning.',
    start: 'Getting started',
  },
  panelsLabel: 'Demo and source',
  sourceCaption: 'The module that renders this demo',
  onward: 'See it built step by step: reely evolution',
  topics: {
    'getting-started': {
      title: 'Getting started',
      lead: 'Install @reely/dommy, point JSX at it, and mount a view. The like button below is the whole program: a click edits one text node, and the board under it counts exactly that.',
      Details: (): Node => (
        <>
          <h2>Install</h2>
          <Code caption='Terminal' source={plain('npm i @reely/dommy')} />
          <p>The package has no third-party dependencies and ships ES modules with TypeScript types.</p>
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
    elements: {
      title: 'Elements and JSX',
      lead: 'Every HTML tag is a function that returns a real element: props first, children after. JSX compiles to the same calls, so both build exactly the same nodes, once.',
      Details: (): Node => (
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
              <code>{"aria={{ role: 'status', ariaLabel: 'Cart total' }}"}</code> sets <code>role</code> and{' '}
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
    components: {
      title: 'Components',
      lead: 'A component is a plain function of props that runs once. There is no re-render to schedule: what changes later changes through bindings, node by node.',
      Details: (): Node => (
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
    signals: {
      title: 'Signals',
      lead: 'A signal is a value that knows who reads it. A computed value derives from signals, an effect re-runs when what it read changes, and all of it happens synchronously.',
      Details: (): Node => (
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
    bindings: {
      title: 'Bindings',
      lead: 'A signal or any function in a child or a prop is bound: when the signals it reads change, dommy writes the new value to that one text node or attribute, and only when the value really differs.',
      Details: (): Node => (
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
    batch: {
      title: 'Batch',
      lead: 'Effects and bindings run synchronously, after every write. batch applies several writes first and runs each binding once when it returns: this summary is written once per click, not twice.',
      Details: (): Node => (
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
    lists: {
      title: 'Keyed lists',
      lead: 'For renders one row per key, once. When the items change, a row whose key stays keeps its nodes, and only the rows that changed places are moved: update the prices and count the moves.',
      Details: (): Node => (
        <>
          <h2>The props</h2>
          <Code caption='inbox.tsx' source={listsSource} />
          <ul>
            <li>
              <code>each</code>: a signal or a getter of an array.
            </li>
            <li>
              <code>by</code>: the key of an item. JSX keeps <code>key</code> for itself, so the prop has its own name.
            </li>
            <li>
              <code>children</code>: renders one row. <code>message()</code> and <code>index()</code> are getters that follow
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
    conditions: {
      title: 'Conditions',
      lead: 'Show renders children while when is truthy and fallback otherwise. A branch is built when it is shown and removed with its bindings when it is hidden; while the truthiness stays, the branch stays and updates itself.',
      Details: (): Node => (
        <>
          <h2>The props</h2>
          <ul>
            <li>
              <code>when</code>: a signal or a getter; only a change of its truthiness switches the branch, so the stops
              above update the text without rebuilding it.
            </li>
            <li>
              <code>children</code> and <code>fallback</code>: functions that build a branch. <code>fallback</code> is
              optional; without it nothing is shown.
            </li>
          </ul>
          <p>
            Press Next stop and count one text edit. Press Deliver and count the nodes: the fallback paragraph goes, the
            delivery plate comes.
          </p>
          <h2>A new branch for a new value</h2>
          <p>
            <code>Show</code> keeps its branch while the truthiness stays. <code>Keyed</code> builds the branch anew, with
            new state, whenever its value changes: <code>
              {'<Keyed value={contact}>{(name) => <NotesForm name={name} />}</Keyed>'}
            </code>{' '}
            gives every contact an empty form.
          </p>
        </>
      ),
    },
    async: {
      title: 'Async',
      lead: 'Await shows the fallback while a promise is pending, then its result or its error. Give it a getter and it loads again when a signal it reads changes; only the latest promise ever renders.',
      Details: (): Node => (
        <>
          <h2>The props</h2>
          <ul>
            <li>
              <code>promise</code>: a promise, or a signal or getter of one. A getter is tracked: here it reads the request
              number, so every refresh loads again. <code>promise={'{'}load{'}'}</code> starts the load when the
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
          <Code caption='forecast.tsx' source={forecastSource} />
          <h2>Only the latest promise</h2>
          <p>
            Press Refresh the rate twice while the bank answers: the first request never shows, its answer is dropped. A promise
            that settles after the view is taken down renders nothing either. The third request fails; pressing again is
            the retry, since the getter reads the request number.
          </p>
          <p>
            Every refresh after the first costs the board 4 nodes: the result goes and the fallback comes, then the other
            way round.
          </p>
        </>
      ),
    },
    lifecycle: {
      title: 'Mount and cleanup',
      lead: 'mount appends a view and returns the function that takes it down: the nodes go, and every binding, effect and cleanup created while rendering it is released. onCleanup adds your own release.',
      Details: (): Node => (
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
    advanced: {
      title: 'Advanced topics',
      lead: 'The pitfalls VanJS lists in its own advanced topics, each answered in reely with a live demo. First, conditional bindings: a binding depends on what its last run read, so the delivery cost below runs for the courier fees or for the pickup fees, never for all four.',
      Details: (): Node => (
        <>
          <h2>Conditional bindings</h2>
          <p>
            Change the locker fee while the delivery is by courier: the run count stays. Switch to pickup, and the
            courier fees stop counting instead. The same holds for a <code>computed</code> and an <code>effect</code>. Every answer on this page is also
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
            the first one disappears. In reely a signal of nodes does not type-check as a child, and from JavaScript it
            renders as text and the dommy logger reports it. To switch nodes, use <code>Show</code> or{' '}
            <code>Keyed</code>: each place builds its own node.
          </p>
          <Live Demo={SalePrice} caption='sale.price.tsx' source={salePriceSource} />
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
            <code>when</code> stays. Type a coupon code and count one text edit per key; clear it and count the nodes.
          </p>
          <Live Demo={CouponHint} caption='coupon.hint.tsx' source={couponHintSource} />
          <h2>Advanced state derivation</h2>
          <p>
            One effect can write several signals from one source. The timed derivations VanJS builds by hand come from{' '}
            <code>@reely/dommy/kit</code>: <code>persisted</code> keeps a signal in storage, <code>throttled</code> passes
            at most one change per interval, and <code>later</code> delays a write and is cancelled by the next change.
          </p>
          <Code caption='derivation.ts' source={derivationSource} />
          <h2>Self-referencing in effects</h2>
          <p>
            The effect below reads <code>plays</code> and then writes it. As in VanJS 1.3, a signal an effect reads and
            then writes stops being its dependency, so its own write does not run it again and Reset sets the count to 0
            for good. It still runs for <code>playing</code>, which it only reads. The price: an effect cannot clamp a
            signal it writes; a <code>computed</code> can. Two effects that write what the other reads would run
            forever; after 100 waves of writes the flush throws a cycle error instead.
          </p>
          <Live Demo={PlayCounter} caption='play.counter.tsx' source={playCounterSource} />
          <h2>Releasing bindings</h2>
          <p>
            VanJS collects the bindings of disconnected nodes as garbage, so a view built across an <code>await</code> can
            lose them. reely has no such collection: bindings are released by their owner. A branch that goes releases the
            signal, the computed and the subscriptions made in it. Switch the view as often as you like; one stays alive.
          </p>
          <Live Demo={AddressView} caption='address.view.tsx' source={addressViewSource} />
          <p>
            The other side: a node built outside any owner, at module level or in an event handler and appended by hand,
            keeps its bindings as long as their signals live. Build views inside <code>mount</code> and switch nodes with
            the flow components.
          </p>
          <h2>Lifecycle hooks</h2>
          <p>
            A component runs before its nodes are in the document. What must run once they are, such as focusing a field
            or reading the rendered text, goes in <code>later(0, fn)</code> from <code>@reely/dommy/kit</code>; it is
            cancelled if the view goes first. Next slide rebuilds the caption, and the message reads it from the document. The
            other end is <code>onCleanup</code>, run when the owner lets the view go; a node moved out of the document by
            other code is noticed only by a custom element’s <code>disconnectedCallback</code>.
          </p>
          <Live Demo={SlideCaption} caption='slide.caption.tsx' source={slideCaptionSource} />
        </>
      ),
    },
    performance: {
      title: 'Size and speed',
      lead: 'Five hundred stocks ranked by today’s change, timed in your browser from the write to the finished layout. Then give every row a new key on every update and watch what rebuilding costs instead of moving.',
      Details: (): Node => (
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
            Measured on the packed npm tarball, bundled with esbuild. There are no third-party runtime dependencies, and the package is
            tree-shakeable: what an app does not import, it does not ship.
          </p>
          <h2>Speed</h2>
          <p>
            The demo above times every price update in your browser, from the write to the finished layout. Its numbers are the
            ones that count: they come from your machine, not from ours.
          </p>
        </>
      ),
    },
  } satisfies Record<DocSlug, TopicText>,
};

/** The words of the docs: the rail, the pages around the demos, and every topic. */
export type DocsText = typeof en;

export const docsText = localized(en, () => import('./docs.text.ru').then((module) => module.ru));
