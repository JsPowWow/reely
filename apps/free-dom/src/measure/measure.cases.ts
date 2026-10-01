/** What dommy's pages weigh it with: an app's real imports, bundled and minified. */
export const dommyBundles = {
  signalsOnly: "export { batch, computed, effect, signal } from '@reely/dommy';",
  jsxApp:
    "export { For, Show, mount, signal } from '@reely/dommy'; export { jsx, jsxs, Fragment } from '@reely/dommy/jsx-runtime';",
} as const;

export type DommyBundle = keyof typeof dommyBundles;
