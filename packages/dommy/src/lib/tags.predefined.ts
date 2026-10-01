import { createElement } from './createElement';
import { isValidChildDOMNode } from './utils/element.utils';

import type { DOMElementFactoryFunction, HtmlElementTag } from './types/dommy.types';

export const a: DOMElementFactoryFunction<'a'> = (...args) => fromTag('a', ...args);

export const abbr: DOMElementFactoryFunction<'abbr'> = (...args) => fromTag('abbr', ...args);

export const address: DOMElementFactoryFunction<'address'> = (...args) => fromTag('address', ...args);

export const area: DOMElementFactoryFunction<'area'> = (...args) => fromTag('area', ...args);

export const article: DOMElementFactoryFunction<'article'> = (...args) => fromTag('article', ...args);

export const aside: DOMElementFactoryFunction<'aside'> = (...args) => fromTag('aside', ...args);

export const audio: DOMElementFactoryFunction<'audio'> = (...args) => fromTag('audio', ...args);

export const b: DOMElementFactoryFunction<'b'> = (...args) => fromTag('b', ...args);

export const base: DOMElementFactoryFunction<'base'> = (...args) => fromTag('base', ...args);

export const bdi: DOMElementFactoryFunction<'bdi'> = (...args) => fromTag('bdi', ...args);

export const bdo: DOMElementFactoryFunction<'bdo'> = (...args) => fromTag('bdo', ...args);

export const blockquote: DOMElementFactoryFunction<'blockquote'> = (...args) => fromTag('blockquote', ...args);

export const body: DOMElementFactoryFunction<'body'> = (...args) => fromTag('body', ...args);

export const br: DOMElementFactoryFunction<'br'> = (...args) => fromTag('br', ...args);

export const button: DOMElementFactoryFunction<'button'> = (...args) => fromTag('button', ...args);

export const canvas: DOMElementFactoryFunction<'canvas'> = (...args) => fromTag('canvas', ...args);

export const caption: DOMElementFactoryFunction<'caption'> = (...args) => fromTag('caption', ...args);

export const cite: DOMElementFactoryFunction<'cite'> = (...args) => fromTag('cite', ...args);

export const code: DOMElementFactoryFunction<'code'> = (...args) => fromTag('code', ...args);

export const col: DOMElementFactoryFunction<'col'> = (...args) => fromTag('col', ...args);

export const colgroup: DOMElementFactoryFunction<'colgroup'> = (...args) => fromTag('colgroup', ...args);

export const data: DOMElementFactoryFunction<'data'> = (...args) => fromTag('data', ...args);

export const datalist: DOMElementFactoryFunction<'datalist'> = (...args) => fromTag('datalist', ...args);

export const dd: DOMElementFactoryFunction<'dd'> = (...args) => fromTag('dd', ...args);

export const del: DOMElementFactoryFunction<'del'> = (...args) => fromTag('del', ...args);

export const details: DOMElementFactoryFunction<'details'> = (...args) => fromTag('details', ...args);

export const dfn: DOMElementFactoryFunction<'dfn'> = (...args) => fromTag('dfn', ...args);

export const dialog: DOMElementFactoryFunction<'dialog'> = (...args) => fromTag('dialog', ...args);

export const div: DOMElementFactoryFunction<'div'> = (...args) => fromTag('div', ...args);

export const dl: DOMElementFactoryFunction<'dl'> = (...args) => fromTag('dl', ...args);

export const dt: DOMElementFactoryFunction<'dt'> = (...args) => fromTag('dt', ...args);

export const em: DOMElementFactoryFunction<'em'> = (...args) => fromTag('em', ...args);

export const embed: DOMElementFactoryFunction<'embed'> = (...args) => fromTag('embed', ...args);

export const fieldset: DOMElementFactoryFunction<'fieldset'> = (...args) => fromTag('fieldset', ...args);

export const figcaption: DOMElementFactoryFunction<'figcaption'> = (...args) => fromTag('figcaption', ...args);

export const figure: DOMElementFactoryFunction<'figure'> = (...args) => fromTag('figure', ...args);

export const footer: DOMElementFactoryFunction<'footer'> = (...args) => fromTag('footer', ...args);

export const form: DOMElementFactoryFunction<'form'> = (...args) => fromTag('form', ...args);

export const h1: DOMElementFactoryFunction<'h1'> = (...args) => fromTag('h1', ...args);

export const h2: DOMElementFactoryFunction<'h2'> = (...args) => fromTag('h2', ...args);

export const h3: DOMElementFactoryFunction<'h3'> = (...args) => fromTag('h3', ...args);

export const h4: DOMElementFactoryFunction<'h4'> = (...args) => fromTag('h4', ...args);

export const h5: DOMElementFactoryFunction<'h5'> = (...args) => fromTag('h5', ...args);

export const h6: DOMElementFactoryFunction<'h6'> = (...args) => fromTag('h6', ...args);

export const head: DOMElementFactoryFunction<'head'> = (...args) => fromTag('head', ...args);

export const header: DOMElementFactoryFunction<'header'> = (...args) => fromTag('header', ...args);

export const hgroup: DOMElementFactoryFunction<'hgroup'> = (...args) => fromTag('hgroup', ...args);

export const hr: DOMElementFactoryFunction<'hr'> = (...args) => fromTag('hr', ...args);

export const html: DOMElementFactoryFunction<'html'> = (...args) => fromTag('html', ...args);

export const i: DOMElementFactoryFunction<'i'> = (...args) => fromTag('i', ...args);

export const iframe: DOMElementFactoryFunction<'iframe'> = (...args) => fromTag('iframe', ...args);

export const img: DOMElementFactoryFunction<'img'> = (...args) => fromTag('img', ...args);

export const input: DOMElementFactoryFunction<'input'> = (...args) => fromTag('input', ...args);

export const ins: DOMElementFactoryFunction<'ins'> = (...args) => fromTag('ins', ...args);

export const kbd: DOMElementFactoryFunction<'kbd'> = (...args) => fromTag('kbd', ...args);

export const label: DOMElementFactoryFunction<'label'> = (...args) => fromTag('label', ...args);

export const legend: DOMElementFactoryFunction<'legend'> = (...args) => fromTag('legend', ...args);

export const li: DOMElementFactoryFunction<'li'> = (...args) => fromTag('li', ...args);

export const link: DOMElementFactoryFunction<'link'> = (...args) => fromTag('link', ...args);

export const main: DOMElementFactoryFunction<'main'> = (...args) => fromTag('main', ...args);

export const map: DOMElementFactoryFunction<'map'> = (...args) => fromTag('map', ...args);

export const mark: DOMElementFactoryFunction<'mark'> = (...args) => fromTag('mark', ...args);

export const menu: DOMElementFactoryFunction<'menu'> = (...args) => fromTag('menu', ...args);

export const meta: DOMElementFactoryFunction<'meta'> = (...args) => fromTag('meta', ...args);

export const meter: DOMElementFactoryFunction<'meter'> = (...args) => fromTag('meter', ...args);

export const nav: DOMElementFactoryFunction<'nav'> = (...args) => fromTag('nav', ...args);

export const noscript: DOMElementFactoryFunction<'noscript'> = (...args) => fromTag('noscript', ...args);

export const object: DOMElementFactoryFunction<'object'> = (...args) => fromTag('object', ...args);

export const ol: DOMElementFactoryFunction<'ol'> = (...args) => fromTag('ol', ...args);

export const optgroup: DOMElementFactoryFunction<'optgroup'> = (...args) => fromTag('optgroup', ...args);

export const option: DOMElementFactoryFunction<'option'> = (...args) => fromTag('option', ...args);

export const output: DOMElementFactoryFunction<'output'> = (...args) => fromTag('output', ...args);

export const p: DOMElementFactoryFunction<'p'> = (...args) => fromTag('p', ...args);

export const picture: DOMElementFactoryFunction<'picture'> = (...args) => fromTag('picture', ...args);

export const pre: DOMElementFactoryFunction<'pre'> = (...args) => fromTag('pre', ...args);

export const progress: DOMElementFactoryFunction<'progress'> = (...args) => fromTag('progress', ...args);

export const q: DOMElementFactoryFunction<'q'> = (...args) => fromTag('q', ...args);

export const rp: DOMElementFactoryFunction<'rp'> = (...args) => fromTag('rp', ...args);

export const rt: DOMElementFactoryFunction<'rt'> = (...args) => fromTag('rt', ...args);

export const ruby: DOMElementFactoryFunction<'ruby'> = (...args) => fromTag('ruby', ...args);

export const s: DOMElementFactoryFunction<'s'> = (...args) => fromTag('s', ...args);

export const samp: DOMElementFactoryFunction<'samp'> = (...args) => fromTag('samp', ...args);

export const script: DOMElementFactoryFunction<'script'> = (...args) => fromTag('script', ...args);

export const search: DOMElementFactoryFunction<'search'> = (...args) => fromTag('search', ...args);

export const section: DOMElementFactoryFunction<'section'> = (...args) => fromTag('section', ...args);

export const select: DOMElementFactoryFunction<'select'> = (...args) => fromTag('select', ...args);

export const slot: DOMElementFactoryFunction<'slot'> = (...args) => fromTag('slot', ...args);

export const small: DOMElementFactoryFunction<'small'> = (...args) => fromTag('small', ...args);

export const source: DOMElementFactoryFunction<'source'> = (...args) => fromTag('source', ...args);

export const span: DOMElementFactoryFunction<'span'> = (...args) => fromTag('span', ...args);

export const strong: DOMElementFactoryFunction<'strong'> = (...args) => fromTag('strong', ...args);

export const style: DOMElementFactoryFunction<'style'> = (...args) => fromTag('style', ...args);

export const sub: DOMElementFactoryFunction<'sub'> = (...args) => fromTag('sub', ...args);

export const summary: DOMElementFactoryFunction<'summary'> = (...args) => fromTag('summary', ...args);

export const sup: DOMElementFactoryFunction<'sup'> = (...args) => fromTag('sup', ...args);

export const table: DOMElementFactoryFunction<'table'> = (...args) => fromTag('table', ...args);

export const tbody: DOMElementFactoryFunction<'tbody'> = (...args) => fromTag('tbody', ...args);

export const td: DOMElementFactoryFunction<'td'> = (...args) => fromTag('td', ...args);

export const template: DOMElementFactoryFunction<'template'> = (...args) => fromTag('template', ...args);

export const textarea: DOMElementFactoryFunction<'textarea'> = (...args) => fromTag('textarea', ...args);

export const tfoot: DOMElementFactoryFunction<'tfoot'> = (...args) => fromTag('tfoot', ...args);

export const th: DOMElementFactoryFunction<'th'> = (...args) => fromTag('th', ...args);

export const thead: DOMElementFactoryFunction<'thead'> = (...args) => fromTag('thead', ...args);

export const time: DOMElementFactoryFunction<'time'> = (...args) => fromTag('time', ...args);

export const title: DOMElementFactoryFunction<'title'> = (...args) => fromTag('title', ...args);

export const tr: DOMElementFactoryFunction<'tr'> = (...args) => fromTag('tr', ...args);

export const track: DOMElementFactoryFunction<'track'> = (...args) => fromTag('track', ...args);

export const u: DOMElementFactoryFunction<'u'> = (...args) => fromTag('u', ...args);

export const ul: DOMElementFactoryFunction<'ul'> = (...args) => fromTag('ul', ...args);

export const var_: DOMElementFactoryFunction<'var'> = (...args) => fromTag('var', ...args);

export const video: DOMElementFactoryFunction<'video'> = (...args) => fromTag('video', ...args);

export const wbr: DOMElementFactoryFunction<'wbr'> = (...args) => fromTag('wbr', ...args);

// an arrow per tag, not a call at module scope, so an unused tag ships nothing even without annotations
function fromTag<Tag extends HtmlElementTag>(
  tag: Tag,
  ...[props, ...children]: Parameters<DOMElementFactoryFunction<Tag>>
): ReturnType<DOMElementFactoryFunction<Tag>> {
  if (isValidChildDOMNode(props)) {
    return createElement(tag, null, [props, ...children]);
  }
  return createElement(tag, props, ...children);
}
