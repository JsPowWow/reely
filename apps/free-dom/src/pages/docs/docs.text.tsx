import { Code, DocLink, plain } from './docs.live';
import {
  derivationSource,
  forecastSource,
  granularitySource,
  listsSource,
  mountSource,
  routingSource,
  signalsSource,
} from './docs.snippets';
import { localized } from '../../i18n/localized';
import { measured } from '../../measure/measures';
import { packageHref } from '../../site/site.paths';

import type { AdvancedExamples } from './advanced.examples';
import type { DocGroup, DocSlug } from './docs.topics';

/** The words of one docs page: its question, the answer's lead, and the details after the demo. */
export interface TopicText {
  title: string;
  lead: string;
  Details: () => Node;
}

/** The advanced topic places live demos the page builds, so its details take them. */
export interface AdvancedText extends Omit<TopicText, 'Details'> {
  Details: (examples: AdvancedExamples) => Node;
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
  sourceCaption: 'The module that renders this demo',
  onward: 'See it built step by step: reely evolution',
  topics: {
    'getting-started': {
      title: 'Getting started',
      lead: 'Install @reely/dommy, point JSX at it, and mount a view. The like button below is the whole program. Press Like: the board under it counts one text edit, because the number is one text node bound to a signal, and that node is all that changes.',
      Details: (): Node => (
        <>
          <h2>Install</h2>
          <Code caption='Terminal' source={plain('npm i @reely/dommy')} />
          <p>The package has no third-party dependencies and ships ES modules with TypeScript types.</p>
          <h2>Set up JSX</h2>
          <Code
            caption='tsconfig.json'
            source={plain(
              '{\n  "compilerOptions": {\n    "jsx": "react-jsx",\n    "jsxImportSource": "@reely/dommy"\n  }\n}'
            )}
          />
          <p>
            esbuild takes <code>--jsx=automatic --jsx-import-source=@reely/dommy</code>; Vite reads both options from{' '}
            <code>tsconfig.json</code>. JSX is optional: every tag is also a function, see{' '}
            <DocLink slug='elements'>Elements and JSX</DocLink>.
          </p>
          <h2>Mount a view</h2>
          <Code caption='main.tsx' source={mountSource} />
          <p>
            <code>mount</code> renders once. After that, only the nodes bound to a signal change: in this view, a
            keystroke rewrites the one text node of the counter and nothing else. <code>unmount()</code> removes the
            view with every binding it made.
          </p>
        </>
      ),
    },
    elements: {
      title: 'Elements and JSX',
      lead: 'Every HTML tag is a function that returns a real element: props first, children after. JSX compiles to the same calls, so both build the same nodes, once. The card below is plain JSX: the board counts the nodes it built at first render, and no writes after that, since nothing in it is bound.',
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
              <code>aria-*</code>. A true/false state, such as <code>ariaPressed</code>, also takes a boolean:{' '}
              <code>ariaPressed: on</code>.
            </li>
            <li>
              <code>onClick</code> and every other <code>on*</code> prop takes a function; the event and{' '}
              <code>event.currentTarget</code> are typed by the element. For listener options, pass{' '}
              <code>{'{ handleEvent, once, capture, passive, signal }'}</code>, and an array for several listeners. A
              string is never set as an inline handler.
            </li>
            <li>
              <code>elementRef</code> gets the element, typed by its tag: an object from{' '}
              <code>createObjectReference()</code> (<code>@reely/basics</code>), or a function.
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
      lead: 'A component is a plain function of props, and it runs once. There is no re-render to schedule: what changes later changes through bindings, node by node. The card below is the one from Elements and JSX, now built by a LinkItem component called three times. Compare the boards: a component adds no nodes of its own.',
      Details: (): Node => (
        <>
          <h2>What a component returns</h2>
          <p>
            A <code>ReelyNode</code>, the counterpart of React’s <code>ReactNode</code>: a node, text, a number, a
            getter, nothing (<code>null</code>, <code>undefined</code>, a boolean) or a list of these.{' '}
            <code>children</code> are a <code>ReelyNode</code> too. A component that returns markup declares{' '}
            <code>(): Node</code>; one that may return text or nothing declares <code>(): ReelyNode</code>.
          </p>
          <h2>A JSX expression is a node</h2>
          <p>
            <code>{'<Card />'}</code> is always one <code>Node</code>, ready for <code>append</code>. A tag gives its
            element; a component that returns something else gives a <code>DocumentFragment</code> of it, like{' '}
            <code>{'<>…</>'}</code>. A fragment empties into its parent when it is inserted, so place it once; to move
            or remove it later, keep it inside an element or render it with <code>mount</code>.
          </p>
        </>
      ),
    },
    signals: {
      title: 'Signals',
      lead: 'A signal is a value that knows who reads it. A computed value derives from signals, an effect runs again when what it read changes, and all of it happens synchronously. Press +1 three times. The number is one text edit each time. The data-plan attribute follows a computed plan, empty, single or group, so it changes on the first two presses only: on the third, the computed returns group again and passes nothing on.',
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
              <code>effect(fn)</code> runs now and after every change it depends on; it returns the function that stops
              it. <code>onCleanup</code> inside it runs before the next run and when it stops.
            </li>
            <li>
              A write of an equal value (<code>Object.is</code>) changes nothing and runs nothing.
            </li>
          </ul>
        </>
      ),
    },
    bindings: {
      title: 'Bindings',
      lead: 'A signal or any function in a child or a prop is bound: when the signals it reads change, dommy writes the new value to that one text node or attribute, and only when the value differs. Here a plain getter disables −1 at zero. Press +1: the board counts two attribute edits, data-plan and disabled. Press it again: the getter runs, still answers false, and disabled is not written.',
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
            <code>hidden</code> and <code>disabled</code> take <code>true</code> and <code>false</code>. A function
            child renders text; to switch between whole nodes, use <DocLink slug='conditions'>Show</DocLink>.
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
      lead: 'Effects and bindings run synchronously, after every write. batch applies several writes first and runs each binding once, when it returns. Press +1: it writes the tickets and the seats left, and the board counts two text edits, the number and the summary. The summary reads both signals, yet it is written once.',
      Details: (): Node => (
        <>
          <h2>When to batch</h2>
          <p>
            When one action writes several signals that the same view reads. Without <code>batch</code> this summary
            would be written twice per press: first with the new tickets and the old seats, then with both new. The view
            is correct after every write either way; with <code>batch</code> it is written once, with the final values.
          </p>
          <p>
            <code>batch(fn)</code> returns what <code>fn</code> returns. Batches nest: the outermost one runs the
            effects.
          </p>
        </>
      ),
    },
    lists: {
      title: 'Keyed lists',
      lead: 'For renders one row per key, once. When the items change, a row whose key stays keeps its nodes, and only the rows that changed places are moved. Press Update prices: the changed numbers are edited in place, Nodes moved counts only the rows that had to move, and Nodes added or removed stays at zero.',
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
              <code>children</code>: renders one row. <code>message()</code> and <code>index()</code> are getters that
              follow later updates of that key, so the row updates through its bindings instead of being built again.
            </li>
          </ul>
          <h2>What survives a reorder</h2>
          <p>
            A row that keeps its key keeps its nodes, so focus, text selection and input state inside it survive. New
            keys get new rows; removed rows go with their bindings. Only the fewest rows needed are moved: the ones
            outside the longest run that is already in order. That is why a stock that jumps from last to first costs
            one move, though every rank below it changes.
          </p>
        </>
      ),
    },
    conditions: {
      title: 'Conditions',
      lead: 'Show renders children while when is truthy, and fallback otherwise. A branch is built when it is shown and removed with its bindings when it is hidden; while the truthiness stays, the branch stays and updates itself. Press Next stop a couple of times, then Deliver, and watch the board.',
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
            Next stop is one text edit: the count of stops changes inside the paragraph that stays. Deliver makes{' '}
            <code>deliveredAt</code> truthy, so the fallback paragraph goes and the delivery plate comes, two nodes on
            the board. Send another builds a fresh fallback, which reads five stops again.
          </p>
          <h2>A new branch for a new value</h2>
          <p>
            <code>Show</code> keeps its branch while the truthiness stays. <code>Keyed</code> builds the branch anew,
            with new state, whenever its value changes:{' '}
            <code>{'<Keyed value={contact}>{(name) => <NotesForm name={name} />}</Keyed>'}</code> gives every contact an
            empty form.
          </p>
        </>
      ),
    },
    async: {
      title: 'Async',
      lead: 'Await shows the fallback while a promise is pending, then its result or its error. Give it a getter and it loads again when a signal it reads changes; only the latest promise ever renders. Press Refresh the rate: Asking the bank… stays until the answer comes, a little under a second later.',
      Details: (): Node => (
        <>
          <h2>The props</h2>
          <ul>
            <li>
              <code>promise</code>: a promise, or a signal or getter of one. A getter is tracked: here it reads the
              request number, so every refresh loads again.{' '}
              <code>
                promise={'{'}load{'}'}
              </code>{' '}
              starts the load when the view renders.
            </li>
            <li>
              <code>children</code>: a function of the value, built once the promise resolves.
            </li>
            <li>
              <code>fallback</code>: shown while the promise is pending; nothing by default.
            </li>
            <li>
              <code>catch</code>: a function of the reason, as an <code>Error</code>. It is required, so a failure
              always has a view; JavaScript that leaves it out shows the error as text.
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
            Press Refresh the rate twice, quickly, while the bank is still answering: the first of the two never shows,
            its answer is dropped. A promise that settles after the view is taken down renders nothing either. The third
            request fails with The bank timed out. Press again, and that is the retry: the getter reads the request
            number, so a new number is a new request.
          </p>
          <p>
            Watch Nodes added or removed: every refresh after the first adds 4, as the result goes and the fallback
            comes, then the other way round.
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
            Register what the view started: a timer, an animation frame, an observer, an outside subscription. Press
            Mount a stopwatch: the view starts a timer, and Timers running reads 1. Press Stop and unmount: the count
            goes back to 0, because the cleanup the stopwatch registered ran and cleared its timer.
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
    routing: {
      title: 'Routing',
      lead: 'defineRoutes turns path patterns into the routes of an app: an address gets the page of the first route that matches and answers. Press the addresses below: /products/42 hands its id to the page, /cart takes a moment, as a page behind import() would, and /orders/7 falls through to /*rest. Router, from @reely/dommy/router, does the same for the address bar: it shows the page and follows links, back and forward, without loading the document. It is @reely/router in a component; that package works in an app without dommy too.',
      Details: (): Node => (
        <>
          <h2>Patterns and params</h2>
          <ul>
            <li>
              <code>:id</code> takes one segment of the path, <code>*rest</code> the rest of it; both reach the route
              decoded and typed, so <code>{'({ id })'}</code> compiles for <code>/products/:id</code> and a name the
              pattern lacks does not.
            </li>
            <li>
              The routes are tried in order. A route that answers <code>undefined</code> passes the path on: the site’s{' '}
              <code>/:name</code> answers only for a package and leaves the rest to <code>/*rest</code>.
            </li>
            <li>
              A route can answer with a promise of its page, so a page behind <code>import()</code> ships in its own
              chunk and loads when it is first opened.
            </li>
          </ul>
          <h2>The router</h2>
          <Code caption='main.tsx' source={routingSource} />
          <ul>
            <li>
              It takes over a plain click on a link of the site (no modifier, no <code>target</code>, no{' '}
              <code>download</code>, no <code>rel="external"</code>); a link to a place on the page is left to the
              browser.
            </li>
            <li>
              The page shown stays until the next one has loaded, and only the latest move counts: a slow page overtaken
              by a quicker click never shows.
            </li>
            <li>
              A new page starts at the top, or at the place its URL names, with focus on its heading; back and forward
              return to where the reader had scrolled.
            </li>
            <li>
              <code>catch</code> is required, as on <code>Await</code>: a page that fails to load, and a path no route
              answers, still have a view.
            </li>
          </ul>
          <h2>Links and the page shown</h2>
          <ul>
            <li>
              <code>href(pattern, params)</code> fills a route’s pattern in, encoded and typed from it: links and routes
              share one path. This site keeps its patterns in one object; the routes are its keys, the links come from{' '}
              <code>href</code>.
            </li>
            <li>
              <code>currentPath()</code> is the path of the page shown, read like a signal: a menu’s{' '}
              <code>aria-current</code> follows every move. <code>pageLoading()</code> says the next page is loading,
              for a progress bar anywhere in the app.
            </li>
            <li>
              <code>navigate(url)</code> moves from code; a move to the URL already shown adds no history entry, and{' '}
              <code>{'{ replace: true }'}</code> takes the place of the entry left, as a redirect does.
            </li>
            <li>
              A route gets the query after its params: <code>{"'/search': (_params, query) => …"}</code>.
            </li>
          </ul>
          <p>
            A router inside part of the page, the loading state and apps without dommy:{' '}
            <a href={packageHref('router')}>@reely/router</a>.
          </p>
          <p>
            This site runs on it: every page but the home page is its own chunk, so the first visit loads about a fifth
            of the code it used to.
          </p>
        </>
      ),
    },
    advanced: {
      title: 'Advanced topics',
      lead: 'The questions that come up once the basics work, each answered with a live demo to try. First, conditional bindings: a binding depends on what its last run read, so the delivery cost below runs again for the courier fees or for the pickup fees, never for all four.',
      Details: ({
        flavours,
        salePrice,
        couponHint,
        playCounter,
        addressView,
        slideCaption,
      }: AdvancedExamples): Node => (
        <>
          <h2>Conditional bindings</h2>
          <p>
            Change Locker fee while Delivery is Courier: the line “The cost ran … time(s)” keeps its number, because the
            last run never read the locker fee. Switch Delivery to Pickup, which is one more run, then change Courier
            fee: now that one leaves the count alone. The same holds for a <code>computed</code> and an{' '}
            <code>effect</code>. Every answer on this page is also checked by the specs of @reely/dommy (
            <code>advanced.topics.spec.tsx</code>).
          </p>
          <h2>DOM attributes vs. properties</h2>
          <p>
            Live state (<code>value</code>, <code>checked</code>, <code>selected</code>, <code>indeterminate</code>,{' '}
            <code>muted</code>) is set as a property, so the form shows it, and so is a boolean (<code>autoplay</code>,{' '}
            <code>noValidate</code>). Everything else is an attribute, a read-only <code>list</code> included; a
            property that is no attribute, such as <code>innerHTML</code> or <code>tagName</code>, is no prop. A
            property that takes an object, such as <code>srcObject</code>, goes through <code>elementRef</code>. Start
            typing in Choose a flavour: the browser suggests the options of the datalist, which the <code>list</code>{' '}
            attribute names by its id.
          </p>
          {flavours}
          <h2>Why can’t a signal hold a DOM node?</h2>
          <p>
            A bound child is text. A node can stand in one place only, so one node bound in two places would leave the
            first one empty. A signal of nodes does not type-check as a child, and from JavaScript it renders as text
            and the dommy logger reports it. To switch nodes, use <code>Show</code> or <code>Keyed</code>: each place
            builds its own node. Press Start the sale: both prices turn to €32, and the board counts four nodes added or
            removed, two for each place.
          </p>
          {salePrice}
          <h2>Signal granularity</h2>
          <p>
            A binding runs again when any signal it read changes. Prefer a signal per field that changes on its own;
            when the object stays one signal, read a field through a <code>computed</code>, which passes a change on
            only when its result differs.
          </p>
          <Code caption='granularity.ts' source={granularitySource} />
          <h2>The scope of DOM updates</h2>
          <p>
            Typing into a field does not rebuild the paragraph that shows it, and there is nothing to arrange for that:
            a function child renders text, and <code>Show</code> keeps its branch while the truthiness of{' '}
            <code>when</code> stays. Type a coupon code: the first letter swaps the hint for the plate, two nodes, and
            every letter after it is one text edit. Clear the field, and the hint comes back.
          </p>
          {couponHint}
          <h2>Advanced state derivation</h2>
          <p>
            One effect can write several signals from one source. The timed derivations come ready from{' '}
            <code>@reely/dommy-kit</code>: <code>persisted</code> keeps a signal in storage, <code>throttled</code>{' '}
            passes at most one change per interval, and <code>later</code> delays a write and is cancelled by the next
            change, which makes it a debounce of a signal; <code>debounced</code> is one for a function you call. A full
            quota does not break <code>persisted</code>: it keeps the value in memory, tries the storage again on the
            next write, and tells <code>onSaveError</code> that saving failed.
          </p>
          <Code caption='derivation.ts' source={derivationSource} />
          <h2>Self-referencing in effects</h2>
          <p>
            The effect below counts with <code>plays.update</code>, which reads <code>plays</code> untracked, so the
            effect does not depend on it. Tick Playing: the count goes to 1, once. Press Reset: it goes to 0 and stays
            there. Untick and tick Playing again: the effect still runs for <code>playing</code>, which it reads, and
            counts 1. A run never hears what it writes itself, so an effect that reads and writes a signal settles
            instead of looping; a later write from outside is heard again, so an effect that clamps a signal clamps
            every write. Two effects that write what the other reads would run forever; after 100 waves of writes the
            flush throws a cycle error instead, and a <code>computed</code> that reads itself, directly or through
            others, throws one when it is read.
          </p>
          {playCounter}
          <h2>Releasing bindings</h2>
          <p>
            Bindings are released by their owner, not collected as garbage when their nodes leave the document, so a
            view built across an <code>await</code> keeps them. A branch that goes releases the signal, the computed and
            the subscriptions made in it. Press Switch view a few times: Views built climbs, alive stays at 1.
          </p>
          {addressView}
          <p>
            The other side: a node built outside any owner, at module level or in an event handler and appended by hand,
            keeps its bindings as long as their signals live. Build views inside <code>mount</code> and switch nodes
            with the flow components.
          </p>
          <p>
            To find such a node, <code>{'defineDommyConfig({ useLogger: true, logger, warnUnowned: true })'}</code>{' '}
            warns of the first binding made outside any owner. A node made in an event handler goes under an owner with{' '}
            <code>mount(list, () =&gt; …)</code>, whose dispose takes it out and releases it; one that lives at module
            level goes under <code>withOwner(fn)</code>, whose dispose releases it.
          </p>
          <h2>Lifecycle hooks</h2>
          <p>
            A component runs before its nodes are in the document. What must run once they are, such as focusing a field
            or reading the rendered text, goes in <code>later(0, fn)</code> from <code>@reely/dommy-kit</code>; it is
            cancelled if the view goes first. Press Next slide: <code>Keyed</code> builds a new caption, and the line
            under it shows the caption’s text as read from the document. The other end is <code>onCleanup</code>, run
            when the owner lets the view go; a node moved out of the document by other code is noticed only by a custom
            element’s <code>disconnectedCallback</code>.
          </p>
          {slideCaption}
        </>
      ),
    },
    performance: {
      title: 'Size and speed',
      lead: 'Press Start: five hundred stocks rank again by today’s change four times a second, and every update is timed in your browser, from the write to the finished layout. Then tick New keys every update and see what it costs to rebuild every row instead of moving it.',
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
            Measured by the site's build on the package built in the repo, bundled with esbuild. There are no
            third-party runtime dependencies, and the package is tree-shakeable: what an app does not import, it does
            not ship.
          </p>
          <h2>Speed</h2>
          <p>
            The demo above times every price update in your browser, from the write to the finished layout. Median and
            95th percentile appear once twenty updates are timed, and each setting of Stocks and of the keys is timed
            from scratch. Its numbers are the ones that count: they come from your machine, not from ours.
          </p>
        </>
      ),
    },
  } satisfies Record<Exclude<DocSlug, 'advanced'>, TopicText> & { advanced: AdvancedText },
};

/** The words of the docs: the rail, the pages around the demos, and every topic. */
export type DocsText = typeof en;

export const docsText = localized(en, () => import('./docs.text.ru').then((module) => module.ru));
