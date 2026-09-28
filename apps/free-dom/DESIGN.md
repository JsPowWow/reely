---
name: reely
description: The home and docs of @reely/dommy, drawn as a race-timing screen.
colors:
  asphalt: "#e9edf1"
  panel: "#ffffff"
  graphite: "#1f2933"
  slate: "#5b6b7a"
  line: "#cbd2d9"
  signal: "#f5c518"
  signal-ink: "#9c6d00"
  flag: "#d64545"
  code-text: "#e4e7eb"
typography:
  display:
    fontFamily: "'Big Shoulders Display', 'Arial Narrow', sans-serif"
    fontSize: "clamp(3.25rem, 6.6vw, 5.5rem)"
    fontWeight: 800
    lineHeight: 0.92
  headline:
    fontFamily: "'Big Shoulders Display', 'Arial Narrow', sans-serif"
    fontSize: "clamp(2.5rem, 5vw, 4rem)"
    fontWeight: 800
    lineHeight: 1
  title:
    fontFamily: "'Big Shoulders Display', 'Arial Narrow', sans-serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.05
  subtitle:
    fontFamily: "'Big Shoulders Display', 'Arial Narrow', sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1.1
  readout:
    fontFamily: "'Big Shoulders Display', 'Arial Narrow', sans-serif"
    fontSize: "2.75rem"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "tnum"
  body:
    fontFamily: "'Atkinson Hyperlegible', system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Atkinson Hyperlegible', system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.3
  code:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "3px"
  md: "4px"
  lg: "6px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
  2xl: "2rem"
  gutter: "clamp(1rem, 4vw, 3rem)"
  band: "clamp(3rem, 7vw, 5.5rem)"
components:
  button-primary:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.md}"
    padding: "0.8rem 1.35rem"
  button-primary-hover:
    backgroundColor: "{colors.asphalt}"
    textColor: "{colors.graphite}"
  button-demo:
    backgroundColor: "transparent"
    textColor: "{colors.graphite}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.9rem"
  button-demo-hover:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.asphalt}"
  button-solid:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.asphalt}"
    rounded: "{rounded.md}"
    padding: "0.6rem 1rem"
  button-solid-hover:
    backgroundColor: "{colors.slate}"
  install-line:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.asphalt}"
    typography: "{typography.code}"
    rounded: "{rounded.md}"
    padding: "0.7rem 0.9rem"
  header:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.code-text}"
  rail-link:
    backgroundColor: "transparent"
    textColor: "{colors.slate}"
    rounded: "{rounded.md}"
    padding: "0.35rem 0.5rem"
  rail-link-current:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.graphite}"
  demo-panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.lg}"
    padding: "2rem 1.5rem"
  code-pane:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.code-text}"
    typography: "{typography.code}"
    rounded: "{rounded.lg}"
    padding: "1.25rem 0"
  place-plate:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.asphalt}"
    width: "2.5rem"
  place-plate-leader:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.graphite}"
  readout-value:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.md}"
    padding: "0.1em 0.35em"
---

# Design System: reely

## Overview

**Creative North Star: "The Timing Screen"**

The whole site reads like the timing screen of a race: an asphalt ground, graphite ink and bands, white panels where the live cars run, signal yellow for whatever is current, leading or driven, and flag red for the one kind of event that matters most. Every number that the reader might compare (DOM writes, split times, sizes, lap times) is set in a condensed display face with tabular figures, as a tower would post it. The site is built with the library it documents, so the visual system is there to make each live demo and its write count legible, not to decorate around them.

Density is that of a working tool: a docs rail, a demo beside its source, a write board under each demo. The landing page is the same world, bolder: graphite bands open and close the page, a kerb of signal-yellow and white blocks closes the start straight, a chequered edge opens the finish, and a sticky sector bar fills in signal yellow as each sector is scrolled through. Nothing is lifted by shadow; depth is the step from asphalt to white panel to graphite band.

Motion is a timing sweep: fills are linear and driven by the reader's scroll, controls shift colour in 120ms, and nothing moves on its own.

**Key Characteristics:**
- Asphalt ground, white demo panels, graphite bands and code panes; flat, bordered with 1px hairlines.
- Signal yellow marks state (current page, driven sector, leader, primary action), never fills a surface for decoration.
- Big Shoulders Display at weight 800 for headings and every posted number; Atkinson Hyperlegible for prose; JetBrains Mono only for code.
- Small, even corners (3 to 6px); plates, not pills.
- Every live demo ships with its write board; every code pane is the module that runs.

## Colors

A cool graphite-and-asphalt neutral scale with two race signals: a yellow for state and a red for node writes.

### Primary
- **Signal Yellow** (signal): the current page plate in the rails, the posted split and the fill of the sector bar, the leader's place plate, the lines added since the previous step in a code pane, the primary action button, and text or rules on graphite bands. On light surfaces it is a fill under graphite text, never a text colour.
- **Signal Ink** (signal-ink): signal yellow darkened for marks on light surfaces (4.6:1 on the panel): the text-edit and attribute-edit pips and deltas on the write board, list markers in docs prose.

### Secondary
- **Flag Red** (flag): only for nodes added or removed, on the write board's pip and delta. It is the costliest write, so it gets the only red.

### Neutral
- **Asphalt** (asphalt): the page ground, text on graphite bands, the primary button's hover fill.
- **Panel White** (panel): demo panels, read-out boxes, inline code, the white blocks of the kerb, mobile rail chips.
- **Graphite** (graphite): body text on light surfaces, the site header, the landing start and finish bands, code panes, place plates, the solid button, the focus ring on light surfaces.
- **Slate** (slate): secondary text on light surfaces (leads, captions, board labels, unposted splits, idle rail links), hover of solid graphite controls, row rules on graphite bands.
- **Hairline** (line): every 1px border and rule on light surfaces, and the empty track of the sector bar.
- **Code Text** (code-text): text in code panes and quiet prose on graphite (header links, pitch, finish notes).

### Named Rules
**The Signal Is State Rule.** Signal yellow means "this one": current, leading, driven, or the one primary action. A yellow surface that does not answer "which one?" does not belong; the kerb is the single decorative use, and it is part of a graphite band's edge.

**The Signal Ink Rule.** Yellow as text or a small mark on asphalt or white is signal ink; pure signal is for fills under graphite text and for anything on graphite.

**The Flag Means Nodes Rule.** Flag red marks node insertions and removals and nothing else: no error states, no emphasis, no hover.

## Typography

**Display Font:** Big Shoulders Display, weight 800 (with Arial Narrow)
**Body Font:** Atkinson Hyperlegible, 400 and 700 (with system-ui)
**Label/Mono Font:** JetBrains Mono (with ui-monospace), code only

**Character:** a condensed, heavy timing-tower face for headings and numbers against a highly legible humanist sans for explanation; mono appears only where the reader is looking at code that runs.

### Hierarchy
- **Display** (800, clamp(3.25rem, 6.6vw, 5.5rem), 0.92): the landing thesis, max 11ch, balanced. The finish title runs larger (up to 6rem, 0.9).
- **Headline** (800, clamp(2.5rem, 5vw, 4rem), 1): landing sector titles, with the sector number on a graphite plate in signal.
- **Title** (800, clamp(2rem, 4vw, 3rem), 1.05): docs and evolution page titles; evolution pairs it with a step number at clamp(5rem, 12vw, 8rem).
- **Subtitle** (800, 1.75rem, 1.1): section headings in docs prose, the guide ending, the wordmark.
- **Readout** (800, 2.75rem, 1, tabular): write-board figures; 2.25rem on phones. Demo read-out boxes run 3.5rem, the start demo up to 6rem, split times 1.5 to 2rem, finish times 2 to 3rem in signal.
- **Body** (400, 1.0625rem, 1.5): prose at 62 to 68ch; leads and claims in slate at 1.125rem, the landing pitch at 1.1875rem.
- **Label** (400, 0.875rem, 1.3): board labels, code captions, table heads, the keyboard hint; slate.
- **Code** (400, 0.8125rem, 1.6): code panes, 0.75rem on phones; inline code at 0.85em on panel white.

### Named Rules
**The Posted Number Rule.** Any figure that changes or is compared (writes, splits, sizes, times, places, step numbers) is set in the display face at 800 with tabular figures.

**The Mono Is Code Rule.** JetBrains Mono appears only for code: code panes, inline code, and the install line. Labels and numbers never borrow it.

**The Sentence Case Rule.** Headings, labels and navigation are sentence case with default tracking; the build has no uppercase or letter-spaced labels.

## Layout

Two frames. Guide pages (docs and evolution) are a 17rem rail beside a main column capped at 76rem, padded 2.5rem on top and by the gutter (clamp(1rem, 4vw, 3rem)) at the sides; the rail sits on a 1px hairline. The landing is full-width bands whose content centres in an 80rem measure, each band padded vertically by clamp(3rem, 7vw, 5.5rem) or more.

A live demo and its source sit side by side at 5fr to 7fr with a 1.5rem gap; the demo is sticky while the source scrolls. Below 68.75em they stack and the landing start straight goes to one column. Below 45em the rail becomes a wrap of 2.75rem chips (evolution) or topic plates (docs) above the page, the demo stage tightens to 1.25rem 1rem, and the main column leaves 5rem at the bottom for the floating Netlify badge.

Rhythm comes from a short set of gaps (0.25, 0.5, 0.75, 1, 1.5, 2rem) and 2rem between page blocks. Prose holds 62 to 68ch; docs headings sit 1rem above their block and closer to it than to what came before.

## Elevation & Depth

The system is flat. There is no box-shadow anywhere in the build; depth is tonal: asphalt ground, white panels on it with a 1px hairline, graphite bands and code panes as the darkest layer. The only gradients are functional: the sector bar's fill, the scroll cue at the edges of a code pane, and the kerb and chequered edge of the landing bands.

### Named Rules
**The Flat Screen Rule.** Surfaces never lift. To separate, change the tone (asphalt, panel, graphite) or draw a hairline; never add a shadow.

## Shapes

Small, even corners: 3px on the smallest plates (posted split, inline code, keys), 4px on controls, plates, rail items and list rows, 6px on the demo panel and code pane. Pips on the write board are round. Place plates run square-edged inside their 4px row. Borders are 1px hairline on light surfaces; state is drawn with heavier strokes: 3px underline for the header's current link, 4px signal underline under a split, 4px signal left edge on an added code line, 2px graphite outline on the current mobile chip. Landing bands end in geometric edges: a 0.75rem kerb of 2.5rem signal and white blocks over a 3px graphite rule, and a 1.5rem chequer at the top of the finish.

## Components

### Buttons
Plain and firm: a filled or outlined plate with bold text, no icon.
- **Shape:** gently squared (4px).
- **Primary:** signal fill, graphite text, display face at 1.5rem, padding 0.8rem 1.35rem. One per view, on graphite bands; hover turns it asphalt.
- **Demo:** transparent with a 1px graphite border and bold body text, padding 0.5rem 0.9rem; hover fills graphite with asphalt text; disabled keeps a hairline border and slate text.
- **Solid:** graphite fill, asphalt text, padding 0.6rem 1rem; hover goes slate. Used for the "back to start" action and the landing's first demo, where it grows to the display face at 2rem.
- **Secondary link:** bold asphalt text on a 2px slate underline that turns signal on hover.
- **Transitions:** background and border colour in 120ms ease-out, only without reduced motion.

### Install Line
The `npm i @reely/dommy@next` command: mono at 0.9375rem, asphalt on graphite, a 1px slate border at 4px, selectable in one click.

### Navigation
- **Header:** a graphite strip with the display wordmark at 1.75rem and bold code-text links; hover lightens to asphalt over a slate 3px underline, the current part of the site gets a signal underline.
- **Rail:** idle links in slate, hover graphite, the current page a signal plate with graphite bold text. Docs groups are headed in slate display at 1.125rem; evolution steps carry a display number in a 2rem column.
- **Mobile:** rail items become white chips with a hairline; the current chip is signal with a 2px graphite border.
- **Pager:** bold underlined graphite links split left and right over a hairline; the last page closes with where to go next instead.

### Demo Panel and Write Board
The signature component. A white panel (6px, hairline) with the live demo on a stage, and under a hairline the write board: a two-column grid of display figures in tabular numbers with slate labels beneath. "Built at first render" is slate; text and attribute edits carry a signal-ink pip and delta; nodes added or removed carry a flag pip and delta.

### Code Pane
Graphite, 6px, code-text mono at 0.8125rem/1.6, lines kept on one line and scrolled horizontally with a light edge showing where a line runs on. Lines added since the previous step get a 4px signal left edge and a 14% signal wash. A slate caption names the module above it.

### Timing Plates
Standings rows (hairline, 4px) lead with a graphite place plate in the display face; the first row's plate is signal, and moves with whichever row leads. Read-out boxes are white with a hairline, display at 3.5rem. The winner plate is a signal fill with display text; its pending state is a dashed hairline with slate text.

### Sector Bar
On the landing, a sticky strip on asphalt: per sector a display number, a bold slate name, a posted split and a 0.375rem track. The track fills with signal linearly as the sector is scrolled through; when filled, the split posts as signal on a graphite plate. On phones names go to screen readers only.

### Timing Sheet
Figures tables (docs sizes, landing finish): tabular figures right-aligned in the display face, one rule per row, labels left in body weight 400.

## Do's and Don'ts

### Do:
- **Do** put the write board under every live demo, and show the module that renders it in a code pane beside it.
- **Do** set every posted figure in Big Shoulders Display 800 with tabular figures.
- **Do** mark the current item with a signal plate or underline, and draw focus as a 3px graphite ring on light surfaces and a 3px signal ring on graphite.
- **Do** separate layers by tone and 1px hairlines (line on light, slate on graphite).
- **Do** keep motion linear and reader-driven, and drop transitions under reduced motion.

### Don't:
- **Don't** use box-shadow or any lift; the screen is flat.
- **Don't** set signal yellow as text on asphalt or white; use signal ink.
- **Don't** use flag red for anything but nodes added or removed.
- **Don't** use JetBrains Mono outside code, or a third accent hue.
- **Don't** round past 6px or use pill shapes.
- **Don't** add uppercase, letter-spaced labels or kickers above headings; a heading carries its own number plate.
