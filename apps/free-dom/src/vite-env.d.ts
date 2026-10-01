/// <reference types="vite/client" />

// Repeats `SourceLines`, which an ambient module cannot import; the registries assign it to
// `SourceLines`, so the two cannot drift apart unnoticed.
declare module '*?highlight' {
  const lines: readonly (readonly { readonly content: string; readonly color?: string }[])[];
  export default lines;
}

// Repeats `PackageFacts`, which an ambient module cannot import; `measure/measures.ts` assigns these
// to the site's own types, so a fact's shape cannot drift; a package left out fails the home spec.
declare module 'virtual:measures' {
  export const packages: Readonly<
    Record<
      string,
      {
        readonly version: string;
        readonly gzipBytes: number;
        readonly uses: readonly string[];
        readonly outside: readonly string[];
        readonly exports: readonly string[];
      }
    >
  >;
  export const bundles: Readonly<Record<string, number>>;
}
