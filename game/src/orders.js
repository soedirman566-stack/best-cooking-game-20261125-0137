// orders.js — the order board's brain: it invents customer tickets, counts
// their patience down, and grows the rush as the shift goes on. An order is
// a dish, the seconds the customer will wait, and how far the cook has got.

import { dishesForLevel } from './recipes.js';

// Difficulty by level: patience shrinks, tickets arrive faster, and the
// board holds more of them at once.
export function levelForServed(served) {
  return 1 + Math.floor(served / 4);
}

export function patienceFor(level, stackLength, rng) {
  const base = 46 - Math.min(16, (level - 1) * 2.5);
  return Math.round((base + stackLength * 2.2) * (0.92 + rng() * 0.16));
}

export function spawnDelayFor(level, rng) {
  const base = Math.max(2.2, 6.5 - (level - 1) * 0.55);
  return base * (0.75 + rng() * 0.5);
}

export function maxOrdersFor(level) {
  return Math.min(4, 2 + Math.ceil(level / 2));
}

let nextTicket = 1;

// A fresh ticket for a random dish on the current level's menu.
export function makeOrder(level, rng) {
  const menu = dishesForLevel(level);
  const dish = menu[Math.floor(rng() * menu.length)];
  const patience = patienceFor(level, dish.stack.length, rng);
  return {
    ticket: nextTicket++,
    dish,
    total: patience,
    left: patience,
    built: 0, // how many ingredients of the stack are already on the plate
  };
}

// The slice of the stack still to build, and the one ingredient wanted next.
export function nextIngredient(order) {
  return order.dish.stack[order.built] ?? null;
}

export function isComplete(order) {
  return order.built >= order.dish.stack.length;
}

// The tip a serve earns: a share of the dish price scaled by the patience
// left, so a fast serve on a fresh ticket pays best.
export function tipFor(order) {
  const fraction = Math.max(0, order.left / order.total);
  return Math.round(order.dish.price * 0.6 * fraction);
}
