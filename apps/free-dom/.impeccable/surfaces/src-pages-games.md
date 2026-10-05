---
version: 1
slug: "src-pages-games"
primary_target: "src/pages/games"
related_targets: []
---

# Memory game

Scope: the memory game at `/games/memory`, the first page of the site's Games section (header: Packages, Games, Labs). Mode: Experience — the visitor is inside the work: the game leads from the first viewport.

Audience: a JS/TS developer who wants to see reely carry a whole small app, not a snippet; also a student of the RS School memory-game task. Job: play a round, then see how little it takes. Action: play (primary); read the modules that run it (secondary). Proof: the game on a white panel with the write board under it counting every DOM write a flip causes; the sources beside it are the modules that run. Constraints: the RS School memory-game rules (16 cards, 8 pairs, Fisher–Yates shuffle, moves and pairs counters, ~1 s turn back with clicks ignored, New game cancels the timer, victory and leaderboard dialogs closed by button, backdrop or Escape, top 10 in localStorage sorted by moves then date, DD.MM.YYYY); no innerHTML; only `@reely/*` at runtime; the game's UI in English like every demo.

Memorable moment: "0 if" posted as a figure the page counted from its own sources; a board of reely packages turning signal yellow pair by pair; and, one click under the board, the exact region of the state machine that just ran for the move. Every quoted region is the code that runs: the article below cuts its snippets from the same modules by region markers.

## Direction contract

THESIS: A finished app without one `if`: a state machine decides, signals hold, signals draw, and the page proves it with counted figures, a live write board and the code that just ran. The table and the best ten live in signals — the leaderboard through `persisted` from `@reely/dommy-kit`, not a simple store. It refuses the category's default of colourful cartoon cards on a felt table.

OWN-WORLD: The site's timing screen unchanged. Card backs graphite with a slate hairline frame and a slate display "r"; faces white with a graphite 2px-stroke pictogram of the package and its name in Big Shoulders Display 800 under a slate `@reely/`; a found pair is a signal plate (posted); a wrong pair waits as a failure plate with a 2px graphite border. Moves and pairs as display readouts with tabular figures. Dialogs are white panels (6px, hairline) over a graphite scrim; the leaderboard is a timing sheet with place plates, the leader's in signal.

STORY: The visitor reads one line on what the game is and which package does which part, plays, wins, sees their place posted, opens the leaderboard, then reads, under the game, the story of how it is built: a headline, a lede, and eight chapters in build order (rules, machine, time, state, card, leaderboard, dialog, proof), each with prose and the region-cut code it quotes, ending over a hairline on a link to the sources.

FIRST VIEWPORT: A graphite band under the site header. Left (5fr), set to the top: "Memory game" at display size, one sentence, one counted figure in signal, "0 if" (no `if` or `switch` in any module of the game), then the credits (state-machine, signals, dommy, dommy-kit, logger, each naming its part). Right (7fr): the white game panel — a bar with Moves and Pairs readouts, New game (solid) and Leaderboard (outlined) — the 4×4 board, a quiet "The code that just ran" disclosure, and the write board under it. On a phone the game follows the title and the figure; the credits come after it.

FORM: Code-led, structure fixed by the task (bar, board, two dialogs), first of one candidate; no concept roll (an extension inside an established world, decided with the user). Below the band, the article on asphalt: one reading column at a 46rem measure, chapter titles in the display face, prose at 68ch, and a code pane a step apart from the prose, its caption naming only the file.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
