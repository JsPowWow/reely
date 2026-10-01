---
version: 1
slug: "src-pages-home"
primary_target: "src/pages/home"
related_targets: []
---

# Home page

Scope: the reely home page at `/`, the way into every package. Mode: Persuade.

Audience: any JS/TS developer arriving from npm, GitHub or a talk, looking for a package that solves their problem. Job: find theirs among equals and open its page. Action: open a package's page (primary); install it from that page. Proof: a live scoreboard the visitor watches run, built from three of the packages together, its DOM writes counted; each package's size, measured by the site's build from the repo; the fact that the whole site is built with reely. Constraints: no invented adopters or claims; only `@reely/*` at runtime; the timing-screen world of DESIGN.md; no package is the main one.

Memorable moment: a split-flap scoreboard that keeps reordering on its own, every letter turning, while a counter under it shows how few DOM writes that takes, and a caption names which package does which part.

## Direction contract

THESIS: One headline says what reely is ("reely — small TypeScript packages, no dependencies"); the scoreboard shows what they do together; the list shows each on its own. Equal salience for every package: the same plate, the same facts, in the order they stack.

OWN-WORLD: The site's timing screen, unchanged: asphalt ground, graphite band, signal yellow for the leader's plate and the one action, flag red only for node writes, Big Shoulders Display for headings and figures in tabular numerals, Atkinson Hyperlegible for prose, JetBrains Mono only for code (package names in an install line count as code).

FIRST VIEWPORT: A graphite band under the site header. Left: the headline at display size and one sentence under it. Right, on a white panel: the scoreboard (place, name, time; no laps, sectors or splits), a pause control, the write counter, and the caption mapping parts to packages (signals: standings and times; dommy: rows and letters; dommy-kit: letter timing and reduced motion), each name linking to its plate below.

PACKAGES: A section `#packages` on asphalt: plates in a responsive grid, ordered by layer (basics, signals, dommy, dommy-kit, emitter, queue, state-machine, simple-store, logger, async, colors, strings). Each plate: the package name, one line on why it exists, its size in gzip (figure in the display face), what other reely packages it uses; the whole plate opens the package's page. No icons, no badges, no "featured" plate.

MOTION: Only the scoreboard moves: letters turn through two drum letters and settle; the board reorders every few seconds. Paused while the tab is hidden or the board is off screen, on the visitor's pause, and under reduced motion (rows then change in place without turning).

STATES: The race data is a deterministic simulation, labelled as one ("Simulated race"); the board is the shape AI::Race's real one has. Sizes come from the build; a package added to the site gets its size the same way.

RESPONSIVE: Below 68.75em the band stacks (headline, then board). On a phone the board shows its top five rows; the plates go to one column.

FINISH: unreviewed and undocumented is unfinished; the build ends with the finish review and DESIGN.md updated for the home page and the plates.
