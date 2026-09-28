/// <reference types="vite/client" />

/** A step source highlighted at build time by `sourceHighlight`: one array of tokens per line. */
declare module '*?highlight' {
  const lines: readonly (readonly { readonly content: string; readonly color?: string }[])[];
  export default lines;
}
