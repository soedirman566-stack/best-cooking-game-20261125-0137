// shots.js — staged scenes for the maker's screenshots. Opening the game
// with ?shot=<name>&seed=<n> freezes a deterministic mid-game scene (the
// clock stands still) so a screenshot shows the game at its best:
//   start — the title over a stocked kitchen with tickets up
//   play  — three tickets up, the selected dish half stacked
//   serve — a finished stack on the plate, bell lit, timer visible
//   end   — the game-over board after a busy shift
// Normal play (no ?shot=) never touches this file's scenes.

import { makeOrder } from './orders.js';

// A tiny deterministic random source, so a seed always deals the same shift.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shotName() {
  return new URLSearchParams(window.location.search).get('shot');
}

export function shotSeed() {
  const raw = Number(new URLSearchParams(window.location.search).get('seed'));
  return Number.isFinite(raw) && raw > 0 ? raw : 1;
}

// Deal a board of orders for a staged scene, at a fixed level.
export function dealBoard(state, rng, level, count) {
  state.level = level;
  state.orders = [];
  for (let i = 0; i < count; i++) state.orders.push(makeOrder(level, rng));
  state.selected = 0;
}

// Apply a named scene to a fresh state. Returns true when a scene applied.
export function applyShot(state, name, rng) {
  if (!name) return false;
  if (name === 'start') {
    dealBoard(state, rng, 2, 3);
    state.orders[0].built = 1;
    state.mode = 'title';
  } else if (name === 'play') {
    dealBoard(state, rng, 3, 3);
    state.orders[0].built = 2;
    state.orders[1].left = Math.round(state.orders[1].total * 0.45);
    state.score = 145; state.combo = 2; state.served = 6;
    state.mode = 'playing';
  } else if (name === 'serve') {
    dealBoard(state, rng, 3, 3);
    const first = state.orders[0];
    first.built = first.dish.stack.length;
    first.left = Math.round(first.total * 0.62);
    state.score = 268; state.combo = 4; state.bestCombo = 4; state.served = 11;
    state.mode = 'playing';
  } else if (name === 'end') {
    dealBoard(state, rng, 2, 2);
    state.score = 486; state.served = 17; state.bestCombo = 6; state.strikes = 3;
    state.mode = 'over';
  } else {
    return false;
  }
  return true;
}
