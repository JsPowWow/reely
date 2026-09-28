/** A piece of a source line with its theme color; plain text has no color. */
export interface SourceToken {
  readonly content: string;
  readonly color?: string;
}

/** A step source: one array of tokens per line. */
export type SourceLines = readonly (readonly SourceToken[])[];
