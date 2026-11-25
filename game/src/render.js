// render.js — everything Sizzle & Serve paints: the kitchen, the order
// board, the assembly plate, the ingredient stations and the overlays.
// Pure Canvas 2D, no images: every ingredient is drawn from shapes, so the
// game ships no asset files at all. Also owns the layout rectangles the
// input code hit-tests against, so what is drawn is what is clickable.

import { INGREDIENTS, STATION_ORDER, ingredient } from './recipes.js';
import { isComplete } from './orders.js';

export const VIEW_W = 1280;
export const VIEW_H = 800;

// Layout: HUD strip, ticket row, assembly counter, station row.
export const layout = {
  hud: { x: 0, y: 0, w: VIEW_W, h: 54 },
  board: { x: 16, y: 66, w: VIEW_W - 32, h: 178 },
  ticket: { w: 296, h: 162, gap: 14, x0: 28, y: 74 },
  pass: { x: 16, y: 256, w: VIEW_W - 32, h: 268 },
  plate: { cx: 470, cy: 452, r: 118 },
  serve: { x: 1052, y: 330, w: 196, h: 84 },
  trash: { x: 1052, y: 430, w: 196, h: 56 },
  hint: { x: 648, y: 300, w: 380, h: 196 },
  stations: { x0: 16, y: 540, w: 96, h: 118, gap: 7 },
};

export function ticketRect(i) {
  return { x: layout.ticket.x0 + i * (layout.ticket.w + layout.ticket.gap), y: layout.ticket.y, w: layout.ticket.w, h: layout.ticket.h };
}

export function stationRect(i) {
  return { x: layout.stations.x0 + i * (layout.stations.w + layout.stations.gap), y: layout.stations.y, w: layout.stations.w, h: layout.stations.h };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// One ingredient layer, drawn sitting on `baseY` (its bottom edge) centred
// on `cx`, `width` wide. Returns the layer's height so stacks can pile up.
export function drawIngredientLayer(ctx, id, cx, baseY, width) {
  const spec = ingredient(id);
  const h = spec.height * (width / 150);
  const w = width;
  const x = cx - w / 2;
  const y = baseY - h;
  ctx.save();
  ctx.fillStyle = spec.body;
  ctx.strokeStyle = spec.edge;
  ctx.lineWidth = 2;
  if (id === 'buntop') {
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.quadraticCurveTo(x, y - h * 0.5, cx, y - h * 0.35);
    ctx.quadraticCurveTo(x + w, y - h * 0.5, x + w, baseY);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff3d6';
    for (const [sx, sy] of [[-0.28, 0.45], [-0.08, 0.2], [0.14, 0.38], [0.3, 0.55], [0.02, 0.62]]) {
      ctx.beginPath();
      ctx.ellipse(cx + sx * w, baseY - h * sy, 4.5, 2.6, sx * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'lettuce') {
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    for (let i = 0; i <= 6; i++) {
      const px = x + (w / 6) * i;
      ctx.quadraticCurveTo(px - w / 14, y - 3, px, baseY - (i % 2 ? h * 0.75 : h * 0.25));
    }
    ctx.lineTo(x + w, baseY);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
  } else if (id === 'cheese') {
    ctx.beginPath();
    ctx.moveTo(x, y + 2);
    ctx.lineTo(x + w, y + 2);
    ctx.lineTo(x + w - 8, baseY + 4);
    ctx.lineTo(x + w * 0.62, baseY - 2);
    ctx.lineTo(x + w * 0.45, baseY + 5);
    ctx.lineTo(x + w * 0.2, baseY - 2);
    ctx.lineTo(x + 8, baseY + 3);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
  } else if (id === 'egg') {
    ctx.beginPath();
    ctx.ellipse(cx, baseY - h / 2, w * 0.48, h * 0.62, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = spec.detail;
    ctx.beginPath();
    ctx.arc(cx, baseY - h / 2, h * 0.34, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'bacon') {
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    for (let i = 0; i <= 4; i++) {
      const px = x + (w / 4) * i;
      ctx.quadraticCurveTo(px - w / 9, y - 2, px, baseY - (i % 2 ? h * 0.8 : h * 0.3));
    }
    ctx.lineTo(x + w, baseY);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle = spec.detail;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 6, baseY - h * 0.5);
    ctx.lineTo(x + w - 6, baseY - h * 0.5);
    ctx.stroke();
  } else if (id === 'berry') {
    const r = h * 0.52;
    for (const dx of [-0.26, 0, 0.26]) {
      ctx.beginPath();
      ctx.arc(cx + dx * w, baseY - r, r, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = spec.detail;
    ctx.beginPath();
    ctx.arc(cx - w * 0.1, baseY - r * 1.25, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'cream') {
    for (const [dx, s] of [[-0.24, 0.75], [0.24, 0.75], [0, 1]]) {
      ctx.beginPath();
      ctx.arc(cx + dx * w, baseY - h * 0.35, h * 0.5 * s, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }
  } else {
    roundRect(ctx, x, y, w, h, Math.min(7, h / 2));
    ctx.fill(); ctx.stroke();
    if (id === 'patty') {
      ctx.fillStyle = spec.detail;
      for (const dx of [-0.3, -0.05, 0.22, 0.36]) {
        ctx.beginPath();
        ctx.arc(cx + dx * w, y + h * 0.45, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (id === 'tomato') {
      ctx.fillStyle = spec.detail;
      for (const dx of [-0.25, 0, 0.25]) {
        ctx.beginPath();
        ctx.ellipse(cx + dx * w, y + h / 2, 5, 2.6, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (id === 'onion') {
      ctx.strokeStyle = spec.edge;
      ctx.lineWidth = 2;
      for (const dx of [-0.22, 0.05, 0.3]) {
        ctx.beginPath();
        ctx.arc(cx + dx * w, y + h / 2, h * 0.3, 0.15, Math.PI - 0.15);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
  return h;
}

// The stack of a dish (or of what is built so far), drawn on a plate.
function drawPlateStack(ctx, stack, cx, baseY, width) {
  ctx.save();
  ctx.fillStyle = '#f4f6f8';
  ctx.strokeStyle = '#c3ccd4';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(cx, baseY + 10, width * 0.72, 20, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#e2e8ee';
  ctx.beginPath();
  ctx.ellipse(cx, baseY + 10, width * 0.5, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  let y = baseY;
  for (const id of stack) y -= drawIngredientLayer(ctx, id, cx, y, width);
  ctx.restore();
  return y;
}

// A miniature stack for a ticket: the whole recipe, small, with the part
// already built in full colour and the rest faded.
function drawTicketStack(ctx, order, x, y, w) {
  const layerH = 11;
  const totalH = order.dish.stack.length * layerH;
  let base = y + totalH;
  order.dish.stack.forEach((id, i) => {
    ctx.save();
    if (i >= order.built) ctx.globalAlpha = 0.28;
    const spec = ingredient(id);
    ctx.fillStyle = spec.body;
    ctx.strokeStyle = spec.edge;
    ctx.lineWidth = 1.2;
    const lw = w * (id === 'buntop' || id === 'bunbase' ? 1 : 0.92);
    roundRect(ctx, x + (w - lw) / 2, base - layerH + 2, lw, layerH - 2, 3);
    ctx.fill(); ctx.stroke();
    ctx.restore();
    base -= layerH;
  });
}

function drawTicket(ctx, state, order, i) {
  const r = ticketRect(i);
  const selected = i === state.selected;
  ctx.save();
  // pin + paper
  ctx.fillStyle = selected ? '#fffdf4' : '#f7f3e8';
  ctx.strokeStyle = selected ? '#e2574c' : '#cbbf9f';
  ctx.lineWidth = selected ? 3.5 : 1.5;
  roundRect(ctx, r.x, r.y, r.w, r.h, 8);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#e2574c';
  ctx.beginPath();
  ctx.arc(r.x + r.w / 2, r.y + 8, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#33302a';
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`#${order.ticket}  ${order.dish.name}`, r.x + 12, r.y + 30);
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillStyle = '#8a6d1f';
  ctx.textAlign = 'right';
  ctx.fillText(`${order.dish.price}c`, r.x + r.w - 12, r.y + 30);
  ctx.textAlign = 'left';
  drawTicketStack(ctx, order, r.x + 16, r.y + 44, 62);
  // ingredient checklist, next one highlighted
  ctx.font = '13.5px system-ui, sans-serif';
  order.dish.stack.forEach((id, j) => {
    const ly = r.y + 56 + j * 15.5;
    if (j === order.built) {
      ctx.fillStyle = '#fde9c8';
      roundRect(ctx, r.x + 88, ly - 11, r.w - 100, 15, 4);
      ctx.fill();
    }
    ctx.fillStyle = j < order.built ? '#9aa39b' : '#33302a';
    const mark = j < order.built ? '✓ ' : j === order.built ? '▸ ' : '· ';
    ctx.fillText(mark + ingredient(id).name, r.x + 92, ly);
  });
  // patience bar
  const frac = Math.max(0, order.left / order.total);
  const bw = r.w - 24;
  ctx.fillStyle = '#e6ddc8';
  roundRect(ctx, r.x + 12, r.y + r.h - 24, bw, 12, 6);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#69b44c' : frac > 0.25 ? '#f2a007' : '#e2483d';
  if (frac > 0) {
    roundRect(ctx, r.x + 12, r.y + r.h - 24, Math.max(10, bw * frac), 12, 6);
    ctx.fill();
  }
  ctx.fillStyle = '#33302a';
  ctx.font = 'bold 12.5px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${Math.ceil(order.left)}s`, r.x + r.w - 14, r.y + r.h - 28);
  ctx.textAlign = 'left';
  ctx.restore();
}

function drawHud(ctx, state) {
  ctx.save();
  ctx.fillStyle = '#2e2a26';
  ctx.fillRect(layout.hud.x, layout.hud.y, layout.hud.w, layout.hud.h);
  ctx.fillStyle = '#ffb703';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText('SIZZLE & SERVE', 18, 36);
  ctx.fillStyle = '#f5efe4';
  ctx.font = 'bold 19px system-ui, sans-serif';
  ctx.fillText(`Score  ${state.score}`, 330, 36);
  ctx.fillStyle = state.combo >= 2 ? '#ffd166' : '#f5efe4';
  ctx.fillText(`Combo  ×${Math.max(1, state.combo)}`, 520, 36);
  ctx.fillStyle = '#f5efe4';
  ctx.fillText(`Level  ${state.level}`, 720, 36);
  ctx.fillText(`Served  ${state.served}`, 880, 36);
  // strikes as crossed tickets
  ctx.font = 'bold 19px system-ui, sans-serif';
  ctx.fillText('Strikes', 1064, 36);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < state.strikes ? '#e2483d' : '#5a544c';
    ctx.fillText('✕', 1160 + i * 34, 37);
  }
  ctx.restore();
}

function drawKitchen(ctx, state) {
  ctx.save();
  // tiled wall
  ctx.fillStyle = '#f3e9d2';
  ctx.fillRect(0, layout.hud.h, VIEW_W, VIEW_H - layout.hud.h);
  ctx.strokeStyle = 'rgba(190,160,110,0.25)';
  ctx.lineWidth = 1;
  for (let x = 0; x < VIEW_W; x += 64) {
    ctx.beginPath(); ctx.moveTo(x, layout.hud.h); ctx.lineTo(x, layout.board.y + layout.board.h); ctx.stroke();
  }
  for (let y = layout.hud.h; y < layout.board.y + layout.board.h; y += 42) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(VIEW_W, y); ctx.stroke();
  }
  // cork board behind the tickets
  ctx.fillStyle = '#b98a4e';
  roundRect(ctx, layout.board.x, layout.board.y, layout.board.w, layout.board.h, 10);
  ctx.fill();
  ctx.fillStyle = '#a87c42';
  roundRect(ctx, layout.board.x + 6, layout.board.y + 6, layout.board.w - 12, layout.board.h - 12, 8);
  ctx.fill();
  // pass counter
  ctx.fillStyle = '#8d6e63';
  ctx.fillRect(layout.pass.x, layout.pass.y, layout.pass.w, layout.pass.h);
  ctx.fillStyle = '#a1887f';
  ctx.fillRect(layout.pass.x, layout.pass.y, layout.pass.w, 26);
  ctx.fillStyle = '#6d4c41';
  ctx.fillRect(layout.pass.x, layout.pass.y + layout.pass.h - 18, layout.pass.w, 18);
  // station counter
  ctx.fillStyle = '#795548';
  ctx.fillRect(0, layout.stations.y - 16, VIEW_W, VIEW_H - layout.stations.y + 16);
  ctx.fillStyle = '#8d6e63';
  ctx.fillRect(0, layout.stations.y - 16, VIEW_W, 10);
  ctx.restore();
}

function drawAssembly(ctx, state) {
  const order = state.orders[state.selected];
  ctx.save();
  ctx.translate(state.shake ? (Math.random() - 0.5) * state.shake : 0, 0);
  // the plate on the pass
  if (order) {
    const builtStack = order.dish.stack.slice(0, order.built);
    drawPlateStack(ctx, builtStack, layout.plate.cx, layout.plate.cy + 58, 190);
  } else {
    drawPlateStack(ctx, [], layout.plate.cx, layout.plate.cy + 58, 190);
    ctx.fillStyle = '#efe6da';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Waiting for orders…', layout.plate.cx, layout.plate.cy - 70);
    ctx.textAlign = 'left';
  }
  ctx.restore();

  // now-building hint card
  ctx.save();
  const h = layout.hint;
  ctx.fillStyle = 'rgba(46,42,38,0.88)';
  roundRect(ctx, h.x, h.y, h.w, h.h, 10);
  ctx.fill();
  ctx.fillStyle = '#f5efe4';
  ctx.font = 'bold 16px system-ui, sans-serif';
  if (order) {
    ctx.fillText(`NOW BUILDING — ticket #${order.ticket}`, h.x + 16, h.y + 30);
    ctx.font = '15px system-ui, sans-serif';
    const nextId = order.dish.stack[order.built];
    if (nextId) {
      ctx.fillText(`Next: ${ingredient(nextId).name}  (key ${ingredient(nextId).key.toUpperCase()} or click)`, h.x + 16, h.y + 58);
      drawIngredientLayer(ctx, nextId, h.x + 52, h.y + 128, 84);
      ctx.fillStyle = '#f5efe4';
      ctx.fillText(`${order.built} of ${order.dish.stack.length} stacked`, h.x + 110, h.y + 116);
      ctx.fillText('Wrong pick = the order is lost!', h.x + 110, h.y + 140);
    } else {
      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 19px system-ui, sans-serif';
      ctx.fillText('STACK COMPLETE — ring the bell!', h.x + 16, h.y + 62);
      ctx.fillStyle = '#f5efe4';
      ctx.font = '15px system-ui, sans-serif';
      ctx.fillText('Click SERVE (or press Space) to hand it over', h.x + 16, h.y + 92);
      ctx.fillText(`Pays ${order.dish.price}c + tip`, h.x + 16, h.y + 118);
    }
  } else {
    ctx.fillText('THE PASS', h.x + 16, h.y + 30);
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillText('Tickets land on the board up top.', h.x + 16, h.y + 58);
    ctx.fillText('Click a ticket to build it, click the', h.x + 16, h.y + 82);
    ctx.fillText('ingredients below in stack order.', h.x + 16, h.y + 104);
  }
  ctx.restore();

  // serve bell + trash buttons
  ctx.save();
  const s = layout.serve;
  const ready = order && isComplete(order);
  ctx.fillStyle = ready ? '#e8a100' : '#9c8d77';
  roundRect(ctx, s.x, s.y, s.w, s.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#7a5c00';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#2e2a26';
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🔔 SERVE', s.x + s.w / 2, s.y + 52);
  const t = layout.trash;
  ctx.fillStyle = '#6d4c41';
  roundRect(ctx, t.x, t.y, t.w, t.h, 12);
  ctx.fill();
  ctx.fillStyle = '#f5efe4';
  ctx.font = 'bold 19px system-ui, sans-serif';
  ctx.fillText('🗑 SCRAP PLATE', t.x + t.w / 2, t.y + 36);
  ctx.textAlign = 'left';
  ctx.restore();
}

function drawStations(ctx, state) {
  const order = state.orders[state.selected];
  const nextId = order ? order.dish.stack[order.built] : null;
  STATION_ORDER.forEach((id, i) => {
    const r = stationRect(i);
    const spec = INGREDIENTS[id];
    ctx.save();
    ctx.fillStyle = id === nextId ? '#fff3cf' : '#efe6da';
    ctx.strokeStyle = id === nextId ? '#e8a100' : '#b8a88f';
    ctx.lineWidth = id === nextId ? 3.5 : 1.5;
    roundRect(ctx, r.x, r.y, r.w, r.h, 10);
    ctx.fill(); ctx.stroke();
    drawIngredientLayer(ctx, id, r.x + r.w / 2, r.y + 58, 76);
    ctx.fillStyle = '#33302a';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(spec.name, r.x + r.w / 2, r.y + 84);
    ctx.fillStyle = '#8a7a5c';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillText(`[${spec.key.toUpperCase()}]`, r.x + r.w / 2, r.y + 103);
    ctx.textAlign = 'left';
    ctx.restore();
  });
}

function drawPopups(ctx, state) {
  ctx.save();
  ctx.textAlign = 'center';
  for (const p of state.popups) {
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
    ctx.fillStyle = p.color;
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillText(p.text, p.x, p.y);
  }
  ctx.restore();
}

function drawTitle(ctx, state) {
  ctx.save();
  ctx.fillStyle = 'rgba(30,24,18,0.72)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffb703';
  ctx.font = 'bold 84px system-ui, sans-serif';
  ctx.fillText('SIZZLE & SERVE', VIEW_W / 2, 240);
  ctx.fillStyle = '#f5efe4';
  ctx.font = '24px system-ui, sans-serif';
  ctx.fillText('The stacking-diner rush: build every ticket before patience runs out.', VIEW_W / 2, 292);
  ctx.font = '20px system-ui, sans-serif';
  ctx.fillText('Click a ticket, then click ingredients (or press their keys) in stack order.', VIEW_W / 2, 356);
  ctx.fillText('Finish the stack and ring the bell with SERVE / Space.', VIEW_W / 2, 388);
  ctx.fillText('A wrong ingredient or an empty timer loses the order — three strikes end the shift.', VIEW_W / 2, 420);
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.fillText('Click or press Enter to open the kitchen', VIEW_W / 2, 500);
  ctx.textAlign = 'left';
  ctx.restore();
}

function drawGameOver(ctx, state) {
  ctx.save();
  ctx.fillStyle = 'rgba(30,24,18,0.78)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e2483d';
  ctx.font = 'bold 72px system-ui, sans-serif';
  ctx.fillText('SHIFT OVER!', VIEW_W / 2, 250);
  ctx.fillStyle = '#f5efe4';
  ctx.font = '26px system-ui, sans-serif';
  ctx.fillText(`Final score  ${state.score}`, VIEW_W / 2, 330);
  ctx.fillText(`Dishes served  ${state.served}      Best combo  ×${Math.max(1, state.bestCombo)}`, VIEW_W / 2, 372);
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 28px system-ui, sans-serif';
  ctx.fillText('Click or press Enter to cook again', VIEW_W / 2, 470);
  ctx.textAlign = 'left';
  ctx.restore();
}

// The one entry point: paint the whole frame for the current state.
export function draw(ctx, state) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  drawKitchen(ctx, state);
  drawHud(ctx, state);
  state.orders.forEach((order, i) => drawTicket(ctx, state, order, i));
  drawAssembly(ctx, state);
  drawStations(ctx, state);
  drawPopups(ctx, state);
  if (state.flash > 0) {
    ctx.fillStyle = `rgba(255, 209, 102, ${state.flash * 0.25})`;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
  if (state.mode === 'title') drawTitle(ctx, state);
  if (state.mode === 'over') drawGameOver(ctx, state);
}
