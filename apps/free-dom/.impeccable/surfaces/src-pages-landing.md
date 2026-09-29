---
version: 1
slug: "src-pages-landing"
primary_target: "src/pages/landing"
related_targets: []
---

# Landing page

Scope: the reely landing page at `/`. Mode: Persuade.

Audience: any JS/TS developer arriving from npm, GitHub or a talk. Job: decide reely is worth trying. Action: open the docs (primary); install with `npm i @reely/dommy@next` and read the source on GitHub (secondary). Proof: live demos with their DOM writes counted, the measured sizes (1.7 / 5.1 / 7.1 kB gzip), a pointer to time a 500-row board in the reader's own browser (no headless speed figure), and the fact that this page and the whole site are built with reely. Constraints: no invented adopters or claims; only `@reely/*` at runtime; the palette and type of the site's timing-screen world, with no race story on this page (the author found the lap, sectors and splits confusing).

Memorable moment: an example the visitor can break with their own hands (type, reverse, type fast) while the board under it counts the DOM writes.

## Direction contract

THESIS: Show, then tell, in plain words: what reely is, four live examples a JS developer recognises (a keystroke that edits two text nodes, the element itself, rows that move with what you typed in them, a search that shows only the latest answer), then the measured size and speed and the docs. It refuses metaphor: every heading says what the example proves.

OWN-WORLD: Asphalt #e9edf1 ground, graphite #1f2933 opening band and numbers band, signal yellow #f5c518 for the primary action, the one "current" plate in a demo and figures on graphite, flag red #d64545 only for node writes. Big Shoulders Display for headings and figures in tabular numerals; Atkinson Hyperlegible for prose; JetBrains Mono only for code. White demo panels with the write board under each demo, the module that renders it beside.

STORY: The visitor learns in one line what reely is (real DOM, one write per change), tries four examples whose claims the write board confirms as they act, reads the size and speed, learns the page is built with reely, and opens the docs.

FIRST VIEWPORT: A graphite band under the site header. Left, at 5.5rem display: "Real DOM. One write per change." Under it one sentence on how, the signal-yellow "Open the docs" button beside the `npm i @reely/dommy@next` line, and "This page, its examples and their write counters are built with reely". Right: the live counter with its write board, on a white panel.

FORM: Code-led, no concept roll (the earlier lap-sectors roll, seed 5281967b, was retired). A plain sequence: opening band, four example sections (heading that states the claim, one explaining paragraph, demo with its board beside its source, the demo sticky while the source scrolls), a graphite numbers band that closes the page. No sticky progress bar, no numbered sections, no decorative edges. Motion only where a demo answers the visitor (the shake), reduced to an opacity pulse under reduced motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
