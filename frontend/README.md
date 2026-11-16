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

1. Title screen with the **Growtopia** logo and a **PLAY** button. Music starts on click (browsers block autoplay).
2. Carlita spawns on the left holding a seed; Cristian stands on the right; a tree sits between them.
3. Walk to the tree → press **E** → seed is planted, tree turns into a glowing **letter tree**.
4. Press **SPACE** → tree gets punched, a letter falls.
5. Walk over the letter → fireworks → letter modal opens, lines fade in one by one, photo appears at the end.
6. **Bonus:** if Carlita walks onto Cristian, he says **"Te iubesc ♥"**.

## Scene Builder

A standalone visual world editor at `/scene-builder.html` (run dev server and open it directly).

Tools: pencil, rectangle fill, select+move, hand/pan. Supports all autotile blocks from gtworldplanner pages 1–9, weather backgrounds, zoom, undo/redo, and JSON export/import.

## TODO

### Scene Builder
- **Bg/fg layers** — grid cells are currently a single tile. Need `{ fg, bg }` per cell so background blocks (wooden_background, rock_background, wallpapers, etc.) render behind foreground blocks, matching how Growtopia world-building works. Breaking change: grid format, JSON save/load, renderer, and block palette all need updating. Blocks with category "Background Block" / "SFX Background" auto-route to the bg layer.
- **Skipped autotile spreads** — spreads 4 (spikes), 6 (seaweed), 9 (cave crystals) have unknown frame layouts and are not yet wired up.

### Game
- **Final photo** — drop `frontend/public/us.jpg` to replace the placeholder card shown at the end of the letter modal.
- **Letter text** — still placeholder; fill in `frontend/src/letter.js` with the real birthday message.

## Screenshots

`C:\Users\Cristian\Pictures\Screenshots`

## Asset credits

Sprites, font, and sounds: Ubisoft / Growtopia Fan Kit (assets were copied into `public/` from the `sprites/Growtopia FanKit/` folder).
