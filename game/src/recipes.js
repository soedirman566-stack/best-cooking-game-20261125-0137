// recipes.js — the menu of Sizzle & Serve: every ingredient the kitchen stocks
// and every dish a customer can order, as a bottom-to-top stack of ingredients.
// Pure data plus two small lookups; nothing here draws or listens.

// Each ingredient: how it is labelled on its station, the key that adds it,
// and the colours the renderer paints it with (body, edge and a detail tone).
export const INGREDIENTS = {
  bunbase: { name: 'Bun Base', key: '1', body: '#e8a94e', edge: '#b97a26', detail: '#f6cd85', height: 20 },
  patty:   { name: 'Patty',    key: '2', body: '#7a4a21', edge: '#54300f', detail: '#96602e', height: 18 },
  cheese:  { name: 'Cheese',   key: '3', body: '#ffc93c', edge: '#e0a916', detail: '#ffe08a', height: 10 },
  lettuce: { name: 'Lettuce',  key: '4', body: '#69b44c', edge: '#478732', detail: '#97d67e', height: 10 },
  tomato:  { name: 'Tomato',   key: '5', body: '#e2483d', edge: '#b02a21', detail: '#ff8a7a', height: 12 },
  onion:   { name: 'Onion',    key: '6', body: '#e9e2f2', edge: '#b9a8d4', detail: '#ffffff', height: 10 },
  egg:     { name: 'Egg',      key: '7', body: '#fdf6e3', edge: '#e3cf9e', detail: '#ffb703', height: 12 },
  bacon:   { name: 'Bacon',    key: '8', body: '#b3402f', edge: '#7e2a1e', detail: '#e0705c', height: 10 },
  buntop:  { name: 'Bun Top',  key: '9', body: '#f0b45c', edge: '#c07f2a', detail: '#ffd9a0', height: 22 },
  pancake: { name: 'Pancake',  key: 'q', body: '#eec27f', edge: '#c79a4b', detail: '#f7ddab', height: 14 },
  cream:   { name: 'Cream',    key: 'w', body: '#fff8f0', edge: '#e8d9c8', detail: '#ffffff', height: 10 },
  berry:   { name: 'Berries',  key: 'e', body: '#7b2d8b', edge: '#551d63', detail: '#c86dd7', height: 12 },
};

// The station row shows the ingredients in this order, left to right.
export const STATION_ORDER = [
  'bunbase', 'patty', 'cheese', 'lettuce', 'tomato', 'onion',
  'egg', 'bacon', 'buntop', 'pancake', 'cream', 'berry',
];

// A dish: its ticket name, the stack to build (bottom first), the coins it
// pays before tips, and the level at which it joins the menu.
export const DISHES = [
  { id: 'classic', name: 'Classic Stack', stack: ['bunbase', 'patty', 'cheese', 'lettuce', 'buntop'], price: 12, minLevel: 1 },
  { id: 'garden', name: 'Garden Stack', stack: ['bunbase', 'lettuce', 'tomato', 'onion', 'cheese', 'buntop'], price: 14, minLevel: 1 },
  { id: 'sunrise', name: 'Sunrise Stack', stack: ['bunbase', 'egg', 'bacon', 'cheese', 'buntop'], price: 15, minLevel: 2 },
  { id: 'double', name: 'Double Trouble', stack: ['bunbase', 'patty', 'cheese', 'patty', 'cheese', 'buntop'], price: 18, minLevel: 2 },
  { id: 'berrytower', name: 'Berry Tower', stack: ['pancake', 'cream', 'berry', 'pancake', 'cream', 'berry'], price: 16, minLevel: 3 },
  { id: 'fullhouse', name: 'Full House', stack: ['bunbase', 'patty', 'bacon', 'egg', 'tomato', 'buntop'], price: 20, minLevel: 3 },
  { id: 'greenmile', name: 'Green Mile', stack: ['bunbase', 'lettuce', 'cheese', 'tomato', 'lettuce', 'onion', 'buntop'], price: 19, minLevel: 4 },
];

export function ingredient(id) {
  return INGREDIENTS[id];
}

export function dishesForLevel(level) {
  return DISHES.filter((dish) => dish.minLevel <= level);
}
