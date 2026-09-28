/// <reference types="vite/client" />

/**
 * A step source highlighted at build time by `sourceHighlight`: one array of tokens per line.
 * The shape repeats `SourceLines` (an ambient module cannot import it); the step registry assigns
 * it to `SourceLines`, so the two cannot drift apart unnoticed.
 */
declare module '*?highlight' {
  const lines: readonly (readonly { readonly content: string; readonly color?: string }[])[];
  export default lines;
}
