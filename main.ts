// Sizzle & Serve — the hand-in program for the best-cooking-game bounty
// (Node 22, standard library only). The game itself is this directory's
// game/ folder: plain static files (game/index.html and its ES modules, no
// library, no network request) that a desktop browser plays offline. This
// program copies game/ and screenshots/ from beside this file to /output
// and writes /output/dossier.json, the summary the judge reads, with the
// vendored make.fun library in vendor/makefun-game.ts.
//
// Serve the game locally with `node serve.ts`, then open
// http://localhost:8080. Outside the grader's container,
// MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The game and its screenshots travel exactly as they sit in the repo.
mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The dossier, built by the kit's own library from the files just copied,
// under the scorer's caps: at most 4 screenshots of 256 KiB each, at most
// 993 files and 48 MiB under game/, no game path over 1,000 bytes, and the
// dossier's source text capped at 160 KiB. The gate rebuilds this dossier
// with the same library and compares the two byte for byte, so nothing
// here may be edited by hand afterwards.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
