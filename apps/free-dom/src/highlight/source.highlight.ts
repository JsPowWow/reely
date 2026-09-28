import { readFile } from 'node:fs/promises';

import { codeToTokens } from 'shiki';

import type { SourceLines } from '../pages/tutorial/source.types';
import type { ThemeRegistration } from 'shiki';
import type { Plugin } from 'vite';

/**
 * Code colors on the graphite source panel; each keeps 5.6:1 or more on the panel and on the
 * yellow tint of new lines. Yellow itself is left out: on the panel it means "new since the last step".
 */
export const reelyCodeTheme = {
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
  colors: { 'editor.foreground': reelyCodeTheme.text, 'editor.background': '#1F2933' },
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

/**
 * Splits a source into lines of colored tokens with the reely theme.
 *
 * @param {string} code - The source text.
 * @param {'ts' | 'tsx'} lang - The source language.
 * @returns {Promise<SourceLines>} One array of tokens per source line.
 */
export const highlightSource = async (code: string, lang: 'ts' | 'tsx'): Promise<SourceLines> => {
  const { tokens } = await codeToTokens(code, { lang, theme });
  return tokens.map((line) => line.map(({ content, color }) => ({ content, color })));
};

const query = '?highlight';

/**
 * Vite plugin: `import lines from './step.ts?highlight'` gives the module's source as
 * highlighted lines, computed at build time, so the page ships no highlighter.
 *
 * @returns {Plugin} The plugin.
 */
export const sourceHighlight = (): Plugin => ({
  name: 'free-dom:source-highlight',
  async load(id): Promise<string | null> {
    if (!id.endsWith(query)) {
      return null;
    }
    const file = id.slice(0, -query.length);
    this.addWatchFile(file);
    const code = (await readFile(file, 'utf8')).trimEnd();
    const lines = await highlightSource(code, file.endsWith('.tsx') ? 'tsx' : 'ts');
    return `export default ${JSON.stringify(lines)};`;
  },
});
