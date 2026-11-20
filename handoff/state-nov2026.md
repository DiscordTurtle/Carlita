# Carlita — Project State Handoff (November 2026)

## What this is
A Growtopia-inspired web game built as a birthday gift. The player (Carla / Carlita) goes through a story involving Cristian, a villain wizard, parkour, a captured boyfriend, and a love letter hidden in a tree.

**Live URL**: `carlita-draga-mea.vercel.app`  
**Repo**: `github.com/DiscordTurtle/Carlita` branch `deploy`  
**Vercel project**: `prj_baUnuBIGjg3PUVMLNHcKHCkQ5oyN` team `team_56jkOYxvf48N4q2g6yXkZoZE`

After every deploy, manually reassign alias:
```
mcp__vercel__assign_alias(id=<new deployment id>, alias="carlita-draga-mea.vercel.app")
```
Vercel auto-updates `carlita-xiao-wei.vercel.app` only.

---

## Screen Flow

```
title → worldselect (phase 1) → cristiantree → worldselect (phase 2) → parkour → worldselect (phase 3) → game (FarmFinalScene)
```

| Screen key | Component | What happens |
|---|---|---|
| `title` | `TitleScreen` | Splash + Play button. `about_theme.mp3` plays. |
| `worldselect` | `WorldSelector` | World picker map. Phase-based PM whisper types in chat. |
| `cristiantree` | `CristianTreeScene` | Cristian_Tree.json — cinematic, Cristian is kidnapped, wizard appears. Ends by advancing to phase 2. |
| `parkour` | `GridWorld` with `Parkour.json` | Platformer. Player kills wizard (5HP), frees Cristian from cage, picks up Love Seed. Ends by advancing to phase 3. |
| `game` | `FarmFinalScene` | Cristian_Farm.json — player splices seed on tree, tree grows, harvest drops letter + anemonite. Letter modal = ending. |

---

## Key Architecture

### App.jsx
- Owns `screen`, `worldPhase`, `hasSeed`, `wizardKilled` state.
- `PHASE_WHISPERS` object: phase 1 Cristian whisper, phase 2 wizard whisper (with follow-up), phase 3 Cristian whisper.
- Whisper is played imperatively in `handlePlay()` via `setTimeout(..., 900)` (bypasses React effect system to stay in user-gesture chain for autoplay policy).
- `enterWorld(worldName)` routes click → screen transition.
- Persistent chat bar at top of screen, draggable to resize.

### GridWorld.jsx
- Tile-based physics platformer engine. Loads any `*.json` scene.
- `TILE = 32px` base. Display scaling: `tileScale = window.innerWidth / (15 * TILE)`.
- Props: `scenePath`, `onComplete`, `onSeedPickup`, `onMenu`, `onChatMsg`, `onCustomInteraction`, `hoverNames`, `hideActionMenu`.
- `onCustomInteraction(cPhysX, cPhysY, px, py)` — FarmFinalScene hooks into this to intercept tree clicks.
- `hoverNames: { 'tile.png': 'Name' }` — tooltip appears near cursor when hovering that tile.
- Wizard: `WIZ_COL = 97`, `WIZ_ROW = 52`. 5 HP, dies → drops seed after 850ms.
- Seed pickup: enabled 2000ms after drop (grace period so player can see it). Radius ±1.5 tiles horizontal, ±2 tiles vertical.
- Cristian in cage: freed by punching cage after wizard dies. After freedom message, waits 5s then poof-animation + door-slam + "Cristian has left the world." in chat.
- `window.__gCam = { x, y, dt }` — exported each render frame for overlay components to sync to.
- `window.__gPlayer = { x, y }` — same.

### FarmFinalScene.jsx
- Wraps GridWorld with `Cristian_Farm.json`.
- **Tree state machine**: `normal` → `growing` (3s, not punchable) → `spliced` → `broken`/`harvested`
- Splice: seed selected + click ≤2.5 tiles from tree → `tree-splice.mp3`, tree turns golden.
- Harvest: punch spliced tree → `tree-harvest.wav` + letter drop + anemonite drop.
- Drops appear at `TREE_COL - 0.6` and `TREE_COL + 0.9` in world coords.
- Pickup: walk over drop (±2 tile radius) → `seed-pickup.mp3` + slot fills.
- Both collected → fireworks (`Fireworks` component) + `LetterModal`.
- **Cristian overlay**: at `CRIS_COL = 51`, positioned via RAF using `window.__gCam`. Height `CRIS_H_TILES = 0.875` (matches player: `PLAYER_H/TILE = 28/32`).
- Two dialogs: entry (1.5s delay) = "Of soricel, iti pregatisem..."; post-splice (500ms) = "Yeeeey Carlita, ai gasit-o!!!!".
- Both dialogs: whisper sound + speech bubble (RAF-positioned) + chat bar typewriter + commit to log.

### CristianTreeScene.jsx
- Wraps GridWorld with `Cristian_Tree.json`.
- Cinematic-style scene: Cristian stands next to tree, wizard appears, kidnap happens.
- Cristian height: `CRIS_H_TILES = 0.875` (same as FarmFinalScene). Anchored from **bottom** (not top) so name label pushes up, not down.
- Whisper sounds for each dialog. `crisWhisperSoundedRef` / `wizWhisperSoundedRef` prevent double-play.

### useAudio.js
- `masterVolume = 0.1` (10% default). All `playSfx` calls multiply by this.
- `playSfx(src, { volume = 0.7, rate = 1, startTime = 0 })` — cloneNode pattern for overlapping sounds.
- `subscribeToMasterVolume(listener)` — used by background music audio element.

---

## Sprites

| File | Description |
|---|---|
| `frontend/public/sprites/carlita.png` | Carla's player sprite (replaced with `Carla_Growtopia.png`) |
| `frontend/public/sprites/cristian.png` | Cristian NPC sprite (replaced with `Cristian_Growtopia.png`, green hat) |
| `frontend/public/sprites/seed.webp` | 16×16 Love Seed sprite, golden glow applied via CSS filter |
| `frontend/public/sprites/letter.webp` | Letter drop / inventory item |
| `frontend/public/sprites/blocks/all/anemone.png` | Silver anemonite (inventory item) |

**Block sprites**: gitignored (~8000 `.png` files in `sprites/blocks/`). The game loads gracefully with broken images for map tiles. Scenes still work.

---

## Sounds

All in `frontend/public/sounds/`. Key ones:

| File | Used for |
|---|---|
| `about_theme.mp3` | Title screen background music |
| `theme.mp3` | In-game background music (after Play) |
| `whisper.mp3` | PM whisper notification (normalized, was -31.7dB) |
| `world-enter.mp3` | Entering a world |
| `door-slam.mp3` | Exiting a world (trimmed 3.09s leading silence) |
| `death.mp3` | Player death (trimmed 386ms leading silence) |
| `tree-splice.mp3` | Splicing seed onto tree |
| `tree-harvest.wav` | Punching/breaking spliced tree; also cage-break sound |
| `achievement.wav` | Seed drops after wizard kill |
| `seed-pickup.mp3` | Picking up seed, letter, or anemonite |

---

## Scenes (JSON files in `frontend/public/scenes/`)

| File | Used by | Notes |
|---|---|---|
| `world-picker.json` | WorldSelector | Background map for the world selection screen |
| `Cristian_Tree.json` | CristianTreeScene | Cinematic kidnap scene |
| `Parkour.json` | GridWorld (parkour screen) | Full platformer level, `WIZ_COL=97` |
| `Cristian_Farm.json` | FarmFinalScene | Final scene with crystal tree at `TREE_COL=50`, Cristian at `CRIS_COL=51` |

---

## Known Issues / Watch Points

### World-picker whisper (phase 1) — history of fixes
Three attempts to fix the whisper sound not playing on first world-select entry. Final fix: imperative `setTimeout` directly in `handlePlay()` (stays in user-gesture call stack). **Believed fixed** as of commit `71695f0`. User may need to confirm on a fresh browser session (no cached state).

### Seed drop visibility
Was invisible at `DT * 0.375` (~34px) + 500ms grace period (immediate auto-pickup). Fixed to `DT * 0.5` and 2000ms grace. If still too small, increase to `DT * 0.6`.

### Cristian sinking into ground
CristianTreeScene and FarmFinalScene both fixed to use `bottom` anchor for the sprite container (name label pushes up, not down). If Cristian sinks again, check if a fork accidentally reverted to `top` anchor.

### Sprites gitignored
`frontend/public/sprites/blocks/` is gitignored. The game gracefully handles missing images. If the full sprite set needs to be on Vercel, it must be unignored and committed (large operation, ~8000 files).

---

## ActionMenu / Inventory

`ActionMenu.jsx` renders the bottom toolbar:
- Slot 1: Fist (always present, default selected)
- Slot 2: Seed (shown if `hasSeed` prop is true, auto-selected on pickup)
- Slot 3: Letter (shown if `hasLetter` prop)
- Slot 4: Silver Anemonite (shown if `hasAnemonite` prop)

Yellow corner highlight + tooltip label shows selected slot name. Only fist-slot can punch; seed-slot enables tree splice.

---

## Deployment Procedure

```bash
# After code changes:
git add <files>
git commit -m "..."
git push origin deploy

# Then via Vercel MCP:
mcp__vercel__create_deployment(project: "prj_baUnuBIGjg3PUVMLNHcKHCkQ5oyN", team: "team_56jkOYxvf48N4q2g6yXkZoZE", branch: "deploy")
# Wait for READY, then:
mcp__vercel__assign_alias(id: <new_id>, alias: "carlita-draga-mea.vercel.app")
```

---

## Recent Commit History (at time of writing)

```
0f3720d  fix: seed drop visible — DT*0.5, 2s grace period
5116e60  fix: Cristian parkour size 0.875, +3s before leave, poof animation
e109204  fix: anchor Cristian to ground bottom in CristianTreeScene
8f36b3b  feat: Cristian disappears 2s after freed message with chat + door-slam
36a05bc  fix: seed drop 50% smaller, remove RIDICĂ label
352ba3d  fix: scale Cristian sprite to match player size (0.875 tiles)
2dd2c27  feat: replace Cristian sprite with Cristian_Growtopia.png
eb96d37  feat: replace Carla avatar with Carla_Growtopia.png
938b2eb  feat: Cristian dialogs, 3s grow delay, tree hover names in final scene
be774e0  fix: seed visible on ground, slot selection, fist-only punch
39fd0e0  feat: tree splice+harvest mechanics, item drops, anemonite slot in FarmFinalScene
5e5c4d3  fix: anchor Cristian to ground via bottom, add dialog on entry in FarmFinalScene
71695f0  fix: play world-picker whisper sound imperatively in handlePlay
59259c3  feat: replace final GameScene with GridWorld-based FarmFinalScene
```
