import { createElement } from './createElement';

import type { Nullable } from '../types/core.types';
import type {
  DOMNode,
  DOMElementFactoryFunction,
  DOMElementFactoryProps,
  HtmlElementTag,
  DOMElement,
} from './types/hyperscript.types';

export const a = createElementFromTag('a');

export const abbr = createElementFromTag('abbr');

export const address = createElementFromTag('address');

export const area = createElementFromTag('area');

export const article = createElementFromTag('article');

export const aside = createElementFromTag('aside');

export const audio = createElementFromTag('audio');

export const b = createElementFromTag('b');

export const base = createElementFromTag('base');

export const bdi = createElementFromTag('bdi');

export const bdo = createElementFromTag('bdo');

export const blockquote = createElementFromTag('blockquote');

export const body = createElementFromTag('body');

export const br = createElementFromTag('br');

export const button = createElementFromTag('button');

export const canvas = createElementFromTag('canvas');

export const caption = createElementFromTag('caption');

export const cite = createElementFromTag('cite');

export const code = createElementFromTag('code');

export const col = createElementFromTag('col');

export const colgroup = createElementFromTag('colgroup');

export const data = createElementFromTag('data');

export const datalist = createElementFromTag('datalist');

export const dd = createElementFromTag('dd');

export const del = createElementFromTag('del');

export const details = createElementFromTag('details');

export const dfn = createElementFromTag('dfn');

export const dialog = createElementFromTag('dialog');

export const div = createElementFromTag('div');

export const dl = createElementFromTag('dl');

export const dt = createElementFromTag('dt');

export const em = createElementFromTag('em');

export const embed = createElementFromTag('embed');

export const fieldset = createElementFromTag('fieldset');

export const figcaption = createElementFromTag('figcaption');

export const figure = createElementFromTag('figure');

export const footer = createElementFromTag('footer');

export const form = createElementFromTag('form');

export const h1 = createElementFromTag('h1');

export const h2 = createElementFromTag('h2');

export const h3 = createElementFromTag('h3');

export const h4 = createElementFromTag('h4');

export const h5 = createElementFromTag('h5');

export const h6 = createElementFromTag('h6');

export const head = createElementFromTag('head');

export const header = createElementFromTag('header');

export const hgroup = createElementFromTag('hgroup');

export const hr = createElementFromTag('hr');

export const html = createElementFromTag('html');

export const i = createElementFromTag('i');

export const iframe = createElementFromTag('iframe');

export const img = createElementFromTag('img');

export const input = createElementFromTag('input');

export const ins = createElementFromTag('ins');

export const kbd = createElementFromTag('kbd');

export const label = createElementFromTag('label');

export const legend = createElementFromTag('legend');

export const li = createElementFromTag('li');

export const link = createElementFromTag('link');

export const main = createElementFromTag('main');

export const map = createElementFromTag('map');

export const mark = createElementFromTag('mark');

export const menu = createElementFromTag('menu');

export const meta = createElementFromTag('meta');

export const meter = createElementFromTag('meter');

export const nav = createElementFromTag('nav');

export const noscript = createElementFromTag('noscript');

export const object = createElementFromTag('object');

export const ol = createElementFromTag('ol');

export const optgroup = createElementFromTag('optgroup');

export const option = createElementFromTag('option');

export const output = createElementFromTag('output');

export const p = createElementFromTag('p');

export const picture = createElementFromTag('picture');

export const pre = createElementFromTag('pre');

export const progress = createElementFromTag('progress');

export const q = createElementFromTag('q');

export const rp = createElementFromTag('rp');

export const rt = createElementFromTag('rt');

export const ruby = createElementFromTag('ruby');

export const s = createElementFromTag('s');

export const samp = createElementFromTag('samp');

export const script = createElementFromTag('script');

export const search = createElementFromTag('search');

export const section = createElementFromTag('section');

export const select = createElementFromTag('select');

export const slot = createElementFromTag('slot');

export const small = createElementFromTag('small');

export const source = createElementFromTag('source');

export const span = createElementFromTag('span');

export const strong = createElementFromTag('strong');

export const style = createElementFromTag('style');

export const sub = createElementFromTag('sub');

export const summary = createElementFromTag('summary');

export const sup = createElementFromTag('sup');

export const table = createElementFromTag('table');

export const tbody = createElementFromTag('tbody');

export const td = createElementFromTag('td');

export const template = createElementFromTag('template');

export const textarea = createElementFromTag('textarea');

export const tfoot = createElementFromTag('tfoot');

export const th = createElementFromTag('th');

export const thead = createElementFromTag('thead');

export const time = createElementFromTag('time');

export const title = createElementFromTag('title');

export const tr = createElementFromTag('tr');

export const track = createElementFromTag('track');

export const u = createElementFromTag('u');

export const ul = createElementFromTag('ul');

export const var_ = createElementFromTag('var');

export const video = createElementFromTag('video');

export const wbr = createElementFromTag('wbr');

function createElementFromTag<Tag extends HtmlElementTag>(tag: Tag): DOMElementFactoryFunction<Tag> {
  return (props: Nullable<DOMElementFactoryProps<Tag>>, ...children: DOMNode[]): DOMElement<Tag> => {
    return createElement(tag, props, ...children);
  };
}
