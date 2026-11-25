[![make.fun bounty](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/soedirman566-stack/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/soedirman566-stack/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

# Sizzle & Serve

A stacking-diner cooking game for the make.fun *best cooking game* bounty.
Customer tickets land on the order board, each one a dish drawn as a stack
of ingredients with a patience timer. You build the dish on the plate at
the pass — ingredient by ingredient, in stack order — and ring the bell to
serve it before the timer empties.

## How to play

- Click a ticket (or use ← / →) to choose the order you are building.
- Click an ingredient station on the counter, or press its key
  (1–9, Q, W, E), to add the next layer to the plate.
- A wrong ingredient loses the order on the spot; an empty timer loses it
  too. Three lost orders end the shift.
- Finish a stack and click **SERVE** (or press Space) to hand it over:
  the dish price plus a speed tip, fattened by your combo streak.
- Scrap the plate with the trash button (or Backspace) to restart a stack
  without losing the ticket.
- Every four serves the rush levels up: new dishes join the menu, tickets
  arrive faster, patience runs thinner, and the board holds more orders.

## The game

Plain Canvas 2D with no libraries and no assets — every ingredient is
drawn from shapes and every sound is a WebAudio oscillator, so the game
plays fully offline from the static files in `game/`. Serve it with
`node serve.ts` and open http://localhost:8080.

Source layout, one job per file: `game/src/recipes.js` (the menu),
`game/src/orders.js` (tickets and the rush), `game/src/render.js` (all
drawing), `game/src/input.js` (mouse and keyboard), `game/src/audio.js`
(synthesized sounds), `game/src/main.js` (the shift itself), and
`game/src/shots.js` (staged scenes for the screenshots).

`main.ts` at the root hands the entry in: it copies `game/` and
`screenshots/` to the output directory and writes `dossier.json` with the
vendored make.fun library.
