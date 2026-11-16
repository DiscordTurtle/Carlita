# Carlita & Cristian — La multi ani ♥

A tiny Growtopia-inspired birthday mini-game built with React + Vite + Tailwind.

## Run it

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

## What to customize

- **Photo at the end** — drop a JPG at `frontend/public/us.jpg`. Until then the modal shows a placeholder card.
- **Letter text** — edit the lines in `frontend/src/letter.js`.
- **Background music / SFX** — files live in `frontend/public/sounds/`.
- **Avatars** — `frontend/public/sprites/carlita.png` and `cristian.png`.

## Controls

- **← →** (or **A / D**) — walk
- **E** — plant seed (only works next to the tree, while you still have the seed)
- **SPACE** — punch (only works next to the letter tree)

## Flow

1. Title screen → PLAY → world-picker (WorldSelector)
2. Enter **CRISTIAN_FARM** → cinematic: Cristian greets Carlita, wizard flies in, steals Cristian, leaves a PM
3. Back to world-picker (phase 2) → enter **P4rkour** → parkour map; die = Growtopia soul-rise death + respawn
4. Complete parkour → back to world-picker (phase 3) → enter **CRISTIAN_FARM** again (GameScene)
5. Walk to the tree → plant seed → punch → letter falls → walk over it → fireworks → letter modal
6. **Bonus:** if Carlita walks onto Cristian, he says **"Te iubesc ♥"**

A persistent chat bar (Growtopia-style) sits at the top of every screen after the title, showing login messages, game events, and character dialog as it types live.

## Scene Builder

A standalone visual world editor at `/scene-builder.html` (run dev server and open it directly).

Tools: pencil, rectangle fill, select+move, hand/pan. Supports all autotile blocks from gtworldplanner pages 1–9, weather backgrounds, zoom, undo/redo, and JSON export/import.

## TODO

### Scene Builder
- **Skipped autotile spreads** — spreads 4 (spikes), 6 (seaweed), 9 (cave crystals) have unknown frame layouts and are not yet wired up.

### Game
- **Zoom broken** — scroll-wheel zoom in the parkour world (GridWorld) may be broken; needs investigation.
- **Final photo** — drop `frontend/public/us.jpg` to replace the placeholder card shown at the end of the letter modal.
- **Letter text** — still placeholder; fill in `frontend/src/letter.js` with the real birthday message.

### Done ✓
- Bg/fg layers in Scene Builder (`{ fg, bg }` per cell, auto-routes by category)
- Select-and-move rectangle tool in Scene Builder
- CRISTIAN_FARM cinematic (wizard steals Cristian, explosion, PM notification)
- Growtopia death animation in parkour (soul rises, player shrinks, instant respawn)
- Persistent chat bar across all screens (login messages, game events, live character dialog)

## Screenshots

`C:\Users\Cristian\Pictures\Screenshots`

## Asset credits

Sprites, font, and sounds: Ubisoft / Growtopia Fan Kit (assets were copied into `public/` from the `sprites/Growtopia FanKit/` folder).
