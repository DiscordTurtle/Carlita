# Carlita's Birthday Game — dev notes

React + Vite browser game. Growtopia-style 2D platformer built as a birthday gift.

## Docs

- [architecture.md](architecture.md) — component tree, game loop, state flow
- [deployment.md](deployment.md) — free hosting options, how to redeploy fast
- [content.md](content.md) — copy, text, birthday message, theming

## Running locally

```
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`.

---

## TODO

### New game flow
- [x] **WorldSelector** — Growtopia-style screen, Cristian's message types in the log panel, fake worlds + P4rkour grows when others clicked
- [x] **ParkourScene (`GridWorld`)** — grid physics, lava respawn, seed pickup, door triggers scene transition
- [x] Wire new flow into `App.jsx`: Title → WorldSelector → Parkour → FinalScene
- [ ] Final scene — GameScene already starts with seed; visually confirm it feels right after parkour

### Grid / map system
- [x] Map data format — `maps/mapFormat.js`, tile registry (AIR/DIRT/PLATFORM/LAVA/DOOR/SEED)
- [x] `GridWorld` renderer — camera follow, viewport culling, tile collision
- [x] Player physics on grid — walk/jump/gravity, platform pass-through, lava respawn
- [x] **Map editor** — `MapEditor.jsx`: click/drag paint, right-click erase, export/import JSON
- [x] P4rkour map — 20×60, lava pits, stepping stones, SEED at col 54, DOOR at col 59

### Content
- [ ] Update `TitleScreen` subtitle from "Un an impreuna ♥" to birthday copy
- [ ] Write birthday letter content in `LetterModal.jsx`
- [ ] Find/create block sprites (dirt, platform, lava, door — can be simple colored tiles to start)

### Done
- [x] Title screen (split animation, Growtopia logo)
- [x] Final scene (walk, jump, plant seed, punch tree, pick up letter, open modal)
- [x] Audio system (master volume, SFX, music swap)
