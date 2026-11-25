// Harbour & Honey — the entrypoint the grader runs (Node 22, stdlib only).
//
// What lives here: the game itself is plain static files in game/
// (index.html plus plain ES modules, zero libraries, zero network), and the
// screenshots in screenshots/ (the first by name is the cover). This file
// hands all of it in: it mirrors game/ and screenshots/ into the output
// directory the grader provides, then writes dossier.json there through the
// vendored make.fun helper. The dossier is the summary the judge reads.
//
// Local dry run:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the game locally with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const rootDir = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Mirror one top-level folder into the output directory, when it exists.
function mirrorFolder(name) {
  const src = join(rootDir, name);
  if (!existsSync(src)) return;
  cpSync(src, join(outDir, name), { recursive: true });
}

mkdirSync(outDir, { recursive: true });
mirrorFolder('game');
mirrorFolder('screenshots');

// The caps below mirror the scorer's own gate: at most 4 screenshots, each
// at most 256 KiB; at most 993 files in game/ and 48 MiB of game files in
// all; no path under game/ longer than 1000 bytes. The dossier text itself
// is capped at 163840 bytes.
const dossierText = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossierText);
