---
version: 1
slug: "src-pages-landing"
primary_target: "src/pages/landing"
related_targets: []
---

# Landing page

Scope: the reely landing page at `/`. Mode: Persuade.

Audience: any JS/TS developer arriving from npm, GitHub or a talk. Job: decide reely is worth trying. Action: open the docs (primary); install with `npm i @reely/dommy@next` and read the source on GitHub (secondary). Proof: live demos with their DOM writes counted, the measured sizes (1.3 / 4.7 / 6.3 kB gzip) and speed (500-row lap, 7.7 ms median), and the fact that this page and the whole site are built with reely. Constraints: no invented adopters or claims; only `@reely/*` at runtime; the world is race timing, same world, bolder.

Memorable moment: the sector bar filling in signal yellow as you scroll the lap, each sector proving its claim live.

## Direction contract

THESIS: Scrolling the page is driving one lap of reely: sector 1 markup, sector 2 signals, sector 3 lists, and the finish line is the docs. It refuses the category default of a centered hero, three feature cards, one code block and a closing CTA.

OWN-WORLD: Asphalt #e9edf1 ground, graphite #1f2933 start straight and finish bands, signal yellow #f5c518 for the sector bar, split times and the primary action, flag red #d64545 only for node writes. Big Shoulders Display for headings, sector names and split times in tabular figures; Atkinson Hyperlegible for prose; JetBrains Mono only for code on graphite panes. White demo panels with the write-counter board under each demo.

STORY: The visitor learns in one line what reely is (real DOM, one write per change), drives three sectors where each claim runs live beside its code with its writes counted, reads the size and speed as split times at the finish, learns the page itself is built with reely, and opens the docs.

FIRST VIEWPORT: A graphite start straight under the site header. Left, at 5.5rem display: "Real DOM. One write per change." Under it one sentence on how, the signal-yellow "Open the docs" button beside the `npm i @reely/dommy@next` line, and "This site is built with reely". Right: the live first-counter demo with its write board, on a white panel. Along the bottom edge of the band, the sector bar S1 Markup, S2 Signals, S3 Lists, Finish, each with its split, linking to its sector.

FORM: "One lap, three sectors", position 7 of 7 on the ranked structure list, dealt second; seed key 5281967b. Signature interaction: the sector bar sticks under the header and fills each segment in signal yellow as its sector is driven through; with reduced motion it jumps without easing. Motion grammar: linear fills like a timing sweep, nothing else moves on its own.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
