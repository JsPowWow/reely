import css from './memory.layers.module.css';

import type { Memory, MemoryContext, MemoryPhase } from './memory.machine';

/** The human words of the figure; code identifiers stay in the drawing. */
export interface LayersLabels {
  /** The accessible name of the figure. */
  name: string;
  page: string;
  pageHolds: string;
  time: string;
  timeHolds: string;
  storage: string;
  storageHolds: string;
  flow: string;
  flowDoes: string;
  rules: string;
  rulesAre: string;
  eventsIn: string;
  stateOut: string;
  /** Under the clock's event: when it comes. */
  afterASecond: string;
  /** On the arrow from the flow into the rules. */
  calls: string;
  /** The direction of every dependency, said once under the drawing. */
  inward: string;
  /** Verbs of the text alternative: "<layer> sends turn", "<layer> reads table". */
  sends: string;
  reads: string;
}

type MemoryEvent = keyof Memory['events'];
type MemorySignal = keyof Pick<MemoryContext, 'table' | 'best' | 'place'>;
type Read = MemorySignal | MemoryPhase;
type Layer = 'page' | 'time' | 'storage' | 'flow' | 'rules';
type EdgeLayer = Exclude<Layer, 'flow' | 'rules'>;

interface Plate {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** A thin layer at an edge: what it holds, the events it sends in, the state it reads out. */
interface Edge extends Plate {
  readonly code: readonly string[];
  readonly sends: readonly MemoryEvent[];
  readonly reads: readonly Read[];
}

/** One arrow across a layer's border: events go in, state comes out. */
interface Traffic {
  readonly layer: EdgeLayer;
  readonly kind: 'event' | 'state';
  readonly path: string;
  readonly label: { x: number; y: number };
  readonly note?: keyof Pick<
    LayersLabels,
    'eventsIn' | 'stateOut' | 'afterASecond'
  >;
}

// a 428 by 486 drawing: the page over the flow, the rules inside it, the
// clock and the storage under it; every arrow crosses a border vertically
const edges: Readonly<Record<EdgeLayer, Edge>> = {
  page: {
    x: 8,
    y: 0,
    width: 412,
    height: 52,
    code: ['MemoryCard', 'Victory', 'BestTen'],
    sends: ['turn', 'deal'],
    reads: ['table', 'best', 'place'],
  },
  time: {
    x: 8,
    y: 396,
    width: 166,
    height: 52,
    code: ['effect', 'later'],
    sends: ['turnBack'],
    reads: ['wrongPair'],
  },
  storage: {
    x: 190,
    y: 396,
    width: 230,
    height: 52,
    code: ['persisted', 'localStorage'],
    sends: [],
    reads: ['best'],
  },
};
const edgeLayers: readonly EdgeLayer[] = ['page', 'time', 'storage'];

const flow: Plate = { x: 8, y: 122, width: 412, height: 204 };
const rules: Plate = { x: 34, y: 210, width: 360, height: 100 };

const phases: readonly MemoryPhase[] = ['ready', 'oneUp', 'wrongPair', 'won'];
const ruleCode: readonly (readonly [string, string])[] = [
  ['MemoryTable', 'turnCard'],
  ['shuffled', 'postResult'],
];

const traffic: readonly Traffic[] = [
  {
    layer: 'page',
    kind: 'event',
    path: 'M30 52V122',
    label: { x: 38, y: 83 },
    note: 'eventsIn',
  },
  {
    layer: 'page',
    kind: 'state',
    path: 'M250 122V52',
    label: { x: 258, y: 83 },
    note: 'stateOut',
  },
  {
    layer: 'time',
    kind: 'event',
    path: 'M30 396V326',
    label: { x: 38, y: 357 },
    note: 'afterASecond',
  },
  {
    layer: 'time',
    kind: 'state',
    path: 'M150 326V396',
    label: { x: 158, y: 357 },
  },
  {
    layer: 'storage',
    kind: 'state',
    path: 'M250 326V396',
    label: { x: 258, y: 357 },
  },
];

const namesOf = ({ layer, kind }: Traffic): readonly string[] => {
  const { sends, reads } = edges[layer];
  return kind === 'event' ? sends : reads;
};

const list = (names: readonly string[]): string => names.join(', ');

/** The text alternative: every arrow across a border, then the call inward. */
const description = (labels: LayersLabels): string => {
  const crossings = edgeLayers.flatMap((layer) => {
    const { sends, reads } = edges[layer];
    return [
      ...(sends.length
        ? [`${labels[layer]} ${labels.sends} ${list(sends)}`]
        : []),
      `${labels[layer]} ${labels.reads} ${list(reads)}`,
    ];
  });
  const inward = `${labels.flow} (${list(phases)}) ${labels.calls} ${
    labels.rules
  } (${list(ruleCode.flat())})`;
  return [...crossings, inward, labels.inward].join('; ') + '.';
};

const headId = 'memory-layers-head';
const readHeadId = `${headId}-read`;
const descriptionId = 'memory-layers-description';

const ArrowHead = ({ id, read }: { id: string; read: boolean }): Node => (
  <marker
    id={id}
    markerWidth={8}
    markerHeight={8}
    refX={8}
    refY={4}
    orient='auto'
    markerUnits='userSpaceOnUse'
  >
    <path className={read ? css.readHead : css.head} d='M0 0.5L8 4 0 7.5Z' />
  </marker>
);

/** Identifiers in a row, a space apart in the code's own face. */
const Code = ({
  names,
  x,
  y,
  className,
}: {
  names: readonly string[];
  x: number;
  y: number;
  className: string;
}): Node => (
  <text className={className} x={x} y={y}>
    {names.map((name, index) => (
      <tspan dx={index ? '0.75em' : 0}>{name}</tspan>
    ))}
  </text>
);

const EdgePlate = ({
  layer,
  labels,
}: {
  layer: EdgeLayer;
  labels: LayersLabels;
}): Node => {
  const { x, y, width, height, code } = edges[layer];
  return (
    <g>
      <rect
        className={css.plate}
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
      />
      <text x={x + 16} y={y + 22}>
        <tspan className={css.layer}>{labels[layer]}</tspan>
        <tspan className={css.caption} dx='0.5em'>
          {labels[`${layer}Holds`]}
        </tspan>
      </text>
      <Code names={code} x={x + 16} y={y + 42} className={css.code} />
    </g>
  );
};

const Arrow = ({
  traffic,
  labels,
}: {
  traffic: Traffic;
  labels: LayersLabels;
}): Node => {
  const { kind, path, label, note } = traffic;
  const read = kind === 'state';
  return (
    <g className={read ? css.read : undefined}>
      <path
        className={css.edge}
        d={path}
        marker-end={`url(#${read ? readHeadId : headId})`}
      />
      <Code
        names={namesOf(traffic)}
        x={label.x}
        y={label.y}
        className={css.event}
      />
      {note && (
        <text className={css.caption} x={label.x} y={label.y + 16}>
          {labels[note]}
        </text>
      )}
    </g>
  );
};

/**
 * The game as layers: the rules in the middle, the flow around them, the page,
 * the clock and the storage at the edges, with the events going in and the
 * state read out across every border.
 */
export const LayersDiagram = ({ labels }: { labels: LayersLabels }): Node => (
  <svg
    className={css.diagram}
    viewBox='0 0 428 486'
    aria={{
      role: 'img',
      ariaLabel: labels.name,
      ariaDescribedby: descriptionId,
    }}
  >
    <desc id={descriptionId}>{description(labels)}</desc>
    <defs>
      <ArrowHead id={headId} read={false} />
      <ArrowHead id={readHeadId} read={true} />
    </defs>
    <g>
      <rect
        className={css.plate}
        x={flow.x}
        y={flow.y}
        width={flow.width}
        height={flow.height}
        rx={6}
      />
      <text x={flow.x + 16} y={flow.y + 25}>
        <tspan className={css.layer}>{labels.flow}</tspan>
        <tspan className={css.caption} dx='0.5em'>
          {labels.flowDoes}
        </tspan>
      </text>
      <Code
        names={phases}
        x={flow.x + 16}
        y={flow.y + 49}
        className={css.phase}
      />
      <path
        className={css.edge}
        d='M100 178V210'
        marker-end={`url(#${headId})`}
      />
      <text className={css.caption} x={108} y={198}>
        {labels.calls}
      </text>
    </g>
    <g>
      <rect
        className={css.core}
        x={rules.x}
        y={rules.y}
        width={rules.width}
        height={rules.height}
        rx={6}
      />
      <text x={rules.x + 16} y={rules.y + 26}>
        <tspan className={`${css.layer} ${css.onCore}`}>{labels.rules}</tspan>
        <tspan className={`${css.caption} ${css.onCoreCaption}`} dx='0.5em'>
          {labels.rulesAre}
        </tspan>
      </text>
      {ruleCode.map(([first, second], row) => (
        <g>
          <text
            className={`${css.code} ${css.onCore}`}
            x={rules.x + 16}
            y={rules.y + 54 + row * 22}
          >
            {first}
          </text>
          <text
            className={`${css.code} ${css.onCore}`}
            x={rules.x + 176}
            y={rules.y + 54 + row * 22}
          >
            {second}
          </text>
        </g>
      ))}
    </g>
    {traffic.map((crossing) => (
      <Arrow traffic={crossing} labels={labels} />
    ))}
    {edgeLayers.map((layer) => (
      <EdgePlate layer={layer} labels={labels} />
    ))}
    <text className={css.caption} x={214} y={478} text-anchor='middle'>
      {labels.inward}
    </text>
  </svg>
);
