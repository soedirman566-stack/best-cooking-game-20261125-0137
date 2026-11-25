// input.js — mouse and keyboard for Sizzle & Serve. Clicks are translated
// from page pixels into the game's 1280x800 view, then hit-tested against
// the same layout rectangles the renderer draws, so what you see is what
// you click. Keys mirror the clicks: ingredient keys add, Space serves,
// arrows move between tickets, Enter starts or restarts.

import { layout, ticketRect, stationRect, VIEW_W, VIEW_H } from './render.js';
import { STATION_ORDER, INGREDIENTS } from './recipes.js';

function inRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function toView(canvas, event) {
  const box = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - box.left) / box.width) * VIEW_W,
    y: ((event.clientY - box.top) / box.height) * VIEW_H,
  };
}

export function attachInput(canvas, game) {
  canvas.addEventListener('pointerdown', (event) => {
    const { x, y } = toView(canvas, event);
    if (game.state.mode !== 'playing') {
      game.start();
      return;
    }
    if (inRect(x, y, layout.serve)) { game.serve(); return; }
    if (inRect(x, y, layout.trash)) { game.scrap(); return; }
    for (let i = 0; i < game.state.orders.length; i++) {
      if (inRect(x, y, ticketRect(i))) { game.select(i); return; }
    }
    for (let i = 0; i < STATION_ORDER.length; i++) {
      if (inRect(x, y, stationRect(i))) { game.addIngredient(STATION_ORDER[i]); return; }
    }
  });

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (game.state.mode !== 'playing') {
      if (key === 'enter' || key === ' ') { event.preventDefault(); game.start(); }
      return;
    }
    if (key === ' ') { event.preventDefault(); game.serve(); return; }
    if (key === 'arrowright' || key === ']') { game.select(game.state.selected + 1); return; }
    if (key === 'arrowleft' || key === '[') { game.select(game.state.selected - 1); return; }
    if (key === 'backspace' || key === 'delete') { event.preventDefault(); game.scrap(); return; }
    for (const id of STATION_ORDER) {
      if (INGREDIENTS[id].key === key) { game.addIngredient(id); return; }
    }
  });
}
