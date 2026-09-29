/// <reference types="vite/client" />

// Repeats `SourceLines`, which an ambient module cannot import; the registries assign it to
// `SourceLines`, so the two cannot drift apart unnoticed.
declare module '*?highlight' {
  const lines: readonly (readonly { readonly content: string; readonly color?: string }[])[];
  export default lines;
}
