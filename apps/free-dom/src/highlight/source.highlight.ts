import { readFile } from 'node:fs/promises';

import { codeToTokens } from 'shiki';

import type { SourceLines } from './source.types';
import type { ThemeRegistration } from 'shiki';
import type { Plugin } from 'vite';

/** Code colors, each 5.6:1 or more on the panel and on new lines; no yellow, which marks new lines. */
export const reelyCodeTheme = {
  /** The panel itself: mirrors `--graphite` in the site styles. */
  background: '#1F2933',
  text: '#E4E7EB',
  comment: '#B3BDC7',
  keyword: '#9CC3FF',
  string: '#B5DCAA',
  number: '#F7B996',
  type: '#8FDCD2',
  function: '#D7C6FF',
  punctuation: '#C3CCD5',
} as const;

const theme: ThemeRegistration = {
  name: 'reely',
  type: 'dark',
  colors: { 'editor.foreground': reelyCodeTheme.text, 'editor.background': reelyCodeTheme.background },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: reelyCodeTheme.comment } },
    { scope: ['keyword', 'storage', 'variable.language'], settings: { foreground: reelyCodeTheme.keyword } },
    { scope: ['string', 'punctuation.definition.string'], settings: { foreground: reelyCodeTheme.string } },
    { scope: ['constant.numeric', 'constant.language'], settings: { foreground: reelyCodeTheme.number } },
    {
      scope: ['entity.name.type', 'support.type', 'support.class', 'entity.name.tag'],
      settings: { foreground: reelyCodeTheme.type },
    },
    { scope: ['entity.name.function', 'support.function'], settings: { foreground: reelyCodeTheme.function } },
    { scope: ['punctuation', 'meta.brace', 'keyword.operator'], settings: { foreground: reelyCodeTheme.punctuation } },
  ],
};

/** Splits a source into lines of tokens colored with the reely theme. */
export const highlightSource = async (code: string, lang: 'ts' | 'tsx' | 'css'): Promise<SourceLines> => {
  const { tokens } = await codeToTokens(code, { lang, theme });
  return tokens.map((line) => line.map(({ content, color }) => ({ content, color })));
};

const query = '?highlight';

// a stylesheet's highlighted lines get an id of their own: one that ends in `.css`, or `.css?…`, goes down
// Vite's and Vitest's CSS pipelines instead
const cssSuffix = '.css.lines';

const langOf = (file: string): 'ts' | 'tsx' | 'css' => {
  const extension = file.slice(file.lastIndexOf('.') + 1);
  return extension === 'tsx' || extension === 'css' ? extension : 'ts';
};

// the stylesheet behind its own id, or a module behind `?highlight`
const sourceFile = (id: string): string | undefined => {
  if (id.endsWith(cssSuffix)) {
    return `${id.slice(0, -cssSuffix.length)}.css`;
  }
  return id.endsWith(query) ? id.slice(0, -query.length) : undefined;
};

/** Vite plugin: `./step.ts?highlight` is the source as highlighted lines, so the page ships no highlighter. */
export const sourceHighlight = (): Plugin => ({
  name: 'free-dom:source-highlight',
  enforce: 'pre',
  async resolveId(source, importer): Promise<string | null> {
    if (!source.endsWith(`.css${query}`)) {
      return null;
    }
    const resolved = await this.resolve(source.slice(0, -query.length), importer, { skipSelf: true });
    return resolved ? `${resolved.id.slice(0, -'.css'.length)}${cssSuffix}` : null;
  },
  async load(id): Promise<string | null> {
    const file = sourceFile(id);
    if (file === undefined) {
      return null;
    }
    this.addWatchFile(file);
    const code = (await readFile(file, 'utf8')).trimEnd();
    const lines = await highlightSource(code, langOf(file));
    return `export default ${JSON.stringify(lines)};`;
  },
});
