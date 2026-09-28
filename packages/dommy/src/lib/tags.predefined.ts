import { createElement } from './createElement';
import { isValidChildDOMNode } from './utils/element.utils';

import type { DOMElementFactoryFunction, HtmlElementTag } from './types/dommy.types';

export const a = /* @__PURE__ */ createElementFromTag('a');

export const abbr = /* @__PURE__ */ createElementFromTag('abbr');

export const address = /* @__PURE__ */ createElementFromTag('address');

export const area = /* @__PURE__ */ createElementFromTag('area');

export const article = /* @__PURE__ */ createElementFromTag('article');

export const aside = /* @__PURE__ */ createElementFromTag('aside');

export const audio = /* @__PURE__ */ createElementFromTag('audio');

export const b = /* @__PURE__ */ createElementFromTag('b');

export const base = /* @__PURE__ */ createElementFromTag('base');

export const bdi = /* @__PURE__ */ createElementFromTag('bdi');

export const bdo = /* @__PURE__ */ createElementFromTag('bdo');

export const blockquote = /* @__PURE__ */ createElementFromTag('blockquote');

export const body = /* @__PURE__ */ createElementFromTag('body');

export const br = /* @__PURE__ */ createElementFromTag('br');

export const button = /* @__PURE__ */ createElementFromTag('button');

export const canvas = /* @__PURE__ */ createElementFromTag('canvas');

export const caption = /* @__PURE__ */ createElementFromTag('caption');

export const cite = /* @__PURE__ */ createElementFromTag('cite');

export const code = /* @__PURE__ */ createElementFromTag('code');

export const col = /* @__PURE__ */ createElementFromTag('col');

export const colgroup = /* @__PURE__ */ createElementFromTag('colgroup');

export const data = /* @__PURE__ */ createElementFromTag('data');

export const datalist = /* @__PURE__ */ createElementFromTag('datalist');

export const dd = /* @__PURE__ */ createElementFromTag('dd');

export const del = /* @__PURE__ */ createElementFromTag('del');

export const details = /* @__PURE__ */ createElementFromTag('details');

export const dfn = /* @__PURE__ */ createElementFromTag('dfn');

export const dialog = /* @__PURE__ */ createElementFromTag('dialog');

export const div = /* @__PURE__ */ createElementFromTag('div');

export const dl = /* @__PURE__ */ createElementFromTag('dl');

export const dt = /* @__PURE__ */ createElementFromTag('dt');

export const em = /* @__PURE__ */ createElementFromTag('em');

export const embed = /* @__PURE__ */ createElementFromTag('embed');

export const fieldset = /* @__PURE__ */ createElementFromTag('fieldset');

export const figcaption = /* @__PURE__ */ createElementFromTag('figcaption');

export const figure = /* @__PURE__ */ createElementFromTag('figure');

export const footer = /* @__PURE__ */ createElementFromTag('footer');

export const form = /* @__PURE__ */ createElementFromTag('form');

export const h1 = /* @__PURE__ */ createElementFromTag('h1');

export const h2 = /* @__PURE__ */ createElementFromTag('h2');

export const h3 = /* @__PURE__ */ createElementFromTag('h3');

export const h4 = /* @__PURE__ */ createElementFromTag('h4');

export const h5 = /* @__PURE__ */ createElementFromTag('h5');

export const h6 = /* @__PURE__ */ createElementFromTag('h6');

export const head = /* @__PURE__ */ createElementFromTag('head');

export const header = /* @__PURE__ */ createElementFromTag('header');

export const hgroup = /* @__PURE__ */ createElementFromTag('hgroup');

export const hr = /* @__PURE__ */ createElementFromTag('hr');

export const html = /* @__PURE__ */ createElementFromTag('html');

export const i = /* @__PURE__ */ createElementFromTag('i');

export const iframe = /* @__PURE__ */ createElementFromTag('iframe');

export const img = /* @__PURE__ */ createElementFromTag('img');

export const input = /* @__PURE__ */ createElementFromTag('input');

export const ins = /* @__PURE__ */ createElementFromTag('ins');

export const kbd = /* @__PURE__ */ createElementFromTag('kbd');

export const label = /* @__PURE__ */ createElementFromTag('label');

export const legend = /* @__PURE__ */ createElementFromTag('legend');

export const li = /* @__PURE__ */ createElementFromTag('li');

export const link = /* @__PURE__ */ createElementFromTag('link');

export const main = /* @__PURE__ */ createElementFromTag('main');

export const map = /* @__PURE__ */ createElementFromTag('map');

export const mark = /* @__PURE__ */ createElementFromTag('mark');

export const menu = /* @__PURE__ */ createElementFromTag('menu');

export const meta = /* @__PURE__ */ createElementFromTag('meta');

export const meter = /* @__PURE__ */ createElementFromTag('meter');

export const nav = /* @__PURE__ */ createElementFromTag('nav');

export const noscript = /* @__PURE__ */ createElementFromTag('noscript');

export const object = /* @__PURE__ */ createElementFromTag('object');

export const ol = /* @__PURE__ */ createElementFromTag('ol');

export const optgroup = /* @__PURE__ */ createElementFromTag('optgroup');

export const option = /* @__PURE__ */ createElementFromTag('option');

export const output = /* @__PURE__ */ createElementFromTag('output');

export const p = /* @__PURE__ */ createElementFromTag('p');

export const picture = /* @__PURE__ */ createElementFromTag('picture');

export const pre = /* @__PURE__ */ createElementFromTag('pre');

export const progress = /* @__PURE__ */ createElementFromTag('progress');

export const q = /* @__PURE__ */ createElementFromTag('q');

export const rp = /* @__PURE__ */ createElementFromTag('rp');

export const rt = /* @__PURE__ */ createElementFromTag('rt');

export const ruby = /* @__PURE__ */ createElementFromTag('ruby');

export const s = /* @__PURE__ */ createElementFromTag('s');

export const samp = /* @__PURE__ */ createElementFromTag('samp');

export const script = /* @__PURE__ */ createElementFromTag('script');

export const search = /* @__PURE__ */ createElementFromTag('search');

export const section = /* @__PURE__ */ createElementFromTag('section');

export const select = /* @__PURE__ */ createElementFromTag('select');

export const slot = /* @__PURE__ */ createElementFromTag('slot');

export const small = /* @__PURE__ */ createElementFromTag('small');

export const source = /* @__PURE__ */ createElementFromTag('source');

export const span = /* @__PURE__ */ createElementFromTag('span');

export const strong = /* @__PURE__ */ createElementFromTag('strong');

export const style = /* @__PURE__ */ createElementFromTag('style');

export const sub = /* @__PURE__ */ createElementFromTag('sub');

export const summary = /* @__PURE__ */ createElementFromTag('summary');

export const sup = /* @__PURE__ */ createElementFromTag('sup');

export const table = /* @__PURE__ */ createElementFromTag('table');

export const tbody = /* @__PURE__ */ createElementFromTag('tbody');

export const td = /* @__PURE__ */ createElementFromTag('td');

export const template = /* @__PURE__ */ createElementFromTag('template');

export const textarea = /* @__PURE__ */ createElementFromTag('textarea');

export const tfoot = /* @__PURE__ */ createElementFromTag('tfoot');

export const th = /* @__PURE__ */ createElementFromTag('th');

export const thead = /* @__PURE__ */ createElementFromTag('thead');

export const time = /* @__PURE__ */ createElementFromTag('time');

export const title = /* @__PURE__ */ createElementFromTag('title');

export const tr = /* @__PURE__ */ createElementFromTag('tr');

export const track = /* @__PURE__ */ createElementFromTag('track');

export const u = /* @__PURE__ */ createElementFromTag('u');

export const ul = /* @__PURE__ */ createElementFromTag('ul');

export const var_ = /* @__PURE__ */ createElementFromTag('var');

export const video = /* @__PURE__ */ createElementFromTag('video');

export const wbr = /* @__PURE__ */ createElementFromTag('wbr');

function createElementFromTag<Tag extends HtmlElementTag>(tag: Tag): DOMElementFactoryFunction<Tag> {
  return (props, ...children) => {
    if (isValidChildDOMNode(props)) {
      return createElement(tag, null, [props, ...children]);
    }
    return createElement(tag, props, ...children);
  };
}
