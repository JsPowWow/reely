import type { Locale } from './locale';

/** The forms of a word by count; `other` is the one used where a form is not given. */
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

/** Picks the form of a word for a count, by the plural rules of `language`: one, few, many… */
export const pluralOf = (language: Locale): ((count: number, forms: PluralForms) => string) => {
  const rules = new Intl.PluralRules(language);
  return (count, forms) => forms[rules.select(count)] ?? forms.other;
};
