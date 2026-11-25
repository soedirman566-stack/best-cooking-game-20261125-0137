// main.js — Sizzle & Serve's shift manager: it owns the game state, runs
// the clock, and applies the house rules. Read a ticket, stack its dish in
// order on the plate, ring the bell before patience runs out. A wrong
// ingredient or an empty timer loses the order; three lost orders end the
// shift. Serves pay the dish price plus a speed tip, and a clean streak
// builds a combo that fattens every payout.

import { draw, VIEW_W, VIEW_H } from './render.js';
import { attachInput } from './input.js';
import { sfx } from './audio.js';
import { makeOrder, levelForServed, spawnDelayFor, maxOrdersFor, nextIngredient, isComplete, tipFor } from './orders.js';
import { applyShot, shotName, shotSeed, mulberry32 } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
canvas.width = VIEW_W;
canvas.height = VIEW_H;

// Keep the whole kitchen on screen at any window size, letterboxed.
function fitCanvas() {
  const scale = Math.min(window.innerWidth / VIEW_W, window.innerHeight / VIEW_H);
  canvas.style.width = `${Math.floor(VIEW_W * scale)}px`;
  canvas.style.height = `${Math.floor(VIEW_H * scale)}px`;
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

const shot = shotName();
const rng = shot ? mulberry32(shotSeed()) : Math.random;

const state = {
  mode: 'title',
  score: 0,
  combo: 0,
  bestCombo: 0,
  served: 0,
  strikes: 0,
  level: 1,
  orders: [],
  selected: 0,
  spawnIn: 0,
  popups: [],
  shake: 0,
  flash: 0,
};

function popup(x, y, text, color) {
  state.popups.push({ x, y, text, color, life: 1.4 });
}

function announce(text) {
  if (status) status.textContent = text;
}

function currentOrder() {
  return state.orders[state.selected] ?? null;
}

function loseOrder(index, why) {
  const [gone] = state.orders.splice(index, 1);
  state.strikes += 1;
  state.combo = 0;
  state.shake = 14;
  if (state.selected >= state.orders.length) state.selected = Math.max(0, state.orders.length - 1);
  popup(470, 300, why, '#ff7a6b');
  announce(`Ticket ${gone.ticket} lost. Strike ${state.strikes} of 3.`);
  if (state.strikes >= 3) {
    state.mode = 'over';
    sfx.gameover();
    announce(`Shift over. Final score ${state.score}.`);
  }
}

const game = {
  state,

  start() {
    state.mode = 'playing';
    state.score = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.served = 0;
    state.strikes = 0;
    state.level = 1;
    state.orders = [makeOrder(1, rng), makeOrder(1, rng)];
    state.selected = 0;
    state.spawnIn = 3;
    state.popups = [];
    sfx.click();
    announce('The kitchen is open. First tickets are up.');
  },

  select(i) {
    if (state.orders.length === 0) return;
    const next = ((i % state.orders.length) + state.orders.length) % state.orders.length;
    if (next !== state.selected) {
      state.selected = next;
      sfx.click();
    }
  },

  addIngredient(id) {
    const order = currentOrder();
    if (!order || isComplete(order)) return;
    if (nextIngredient(order) === id) {
      order.built += 1;
      sfx.place();
      popup(470, 330 - order.built * 16, '✓', '#8be08a');
      if (isComplete(order)) {
        sfx.ready();
        announce(`${order.dish.name} is stacked. Ring the bell to serve it.`);
      }
    } else {
      sfx.wrong();
      loseOrder(state.selected, 'WRONG INGREDIENT — ORDER LOST!');
    }
  },

  scrap() {
    const order = currentOrder();
    if (!order || order.built === 0) return;
    order.built = 0;
    sfx.click();
    popup(470, 330, 'plate scrapped', '#f5efe4');
  },

  serve() {
    const order = currentOrder();
    if (!order || !isComplete(order)) return;
    const tip = tipFor(order);
    const gain = order.dish.price + tip + state.combo * 2;
    state.score += gain;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.served += 1;
    state.level = levelForServed(state.served);
    state.flash = 1;
    popup(1150, 300, `+${gain}c`, '#ffd166');
    sfx.serve();
    announce(`Served ${order.dish.name} for ${gain} coins.`);
    state.orders.splice(state.selected, 1);
    if (state.selected >= state.orders.length) state.selected = Math.max(0, state.orders.length - 1);
    if (state.orders.length === 0) state.spawnIn = Math.min(state.spawnIn, 0.6);
  },
};

attachInput(canvas, game);

// A handle for the maker's own play-tests (harmless in play).
window.__sizzle = game;

// A staged screenshot scene freezes the clock; live play never does.
const frozen = applyShot(state, shot, rng);

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!frozen && state.mode === 'playing') {
    // patience countdowns; an empty timer loses the order
    for (let i = state.orders.length - 1; i >= 0; i--) {
      const order = state.orders[i];
      order.left -= dt;
      if (order.left <= 0) {
        sfx.expire();
        loseOrder(i, 'TOO SLOW — ORDER LOST!');
        if (state.mode !== 'playing') break;
      }
    }
    // the rush: new tickets while the board has room
    if (state.mode === 'playing') {
      state.spawnIn -= dt;
      if (state.spawnIn <= 0) {
        if (state.orders.length < maxOrdersFor(state.level)) {
          state.orders.push(makeOrder(state.level, rng));
          sfx.click();
        }
        state.spawnIn = spawnDelayFor(state.level, rng);
      }
    }
  }
  for (const p of state.popups) { p.y -= 34 * dt; p.life -= dt; }
  state.popups = state.popups.filter((p) => p.life > 0);
  state.shake = Math.max(0, state.shake - 60 * dt);
  state.flash = Math.max(0, state.flash - 2.4 * dt);
  draw(ctx, state);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
