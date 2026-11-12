# Architecture

## Component tree

```
App
├── TitleScreen          — Growtopia-style split-screen intro, PLAY button
└── GameScene            — owns ALL game state; physics loop runs here
    ├── Character        — Carlita (player) + Cristian (NPC)
    ├── Tree             — 3 visual states: tree / letter-tree / punched
    ├── Seed             — rendered inside Character's holding prop
    ├── DroppedLetter    — visible only while lying on ground
    ├── SpeechBubble     — "Te iubesc ♥" above Cristian when Carlita walks into him
    ├── ActionMenu       — hotbar: punch / seed / letter slots
    ├── Fireworks        — 22 fireworks on letter open
    ├── LetterModal      — the actual birthday letter
    └── GameMenu         — ESC menu with volume slider
```

`Sign`, `GameSettings` exist as files but aren't currently mounted.

## Game progression

Five stages, all in `GameScene`. Linear, no reset.

1. **walk_to_tree** — Carlita starts with the seed
2. **punch** — seed planted near tree; tree becomes "Love Letter Tree"
3. **collect_letter** — tree punched; letter lies on the ground
4. **has_letter** — Carlita walks over letter; it enters inventory
5. **letter_open** — select letter + click; fireworks + modal

## Physics

`requestAnimationFrame` loop in `GameScene`. Walk speed 4.2 px/frame, jump velocity 13, gravity 0.6 px/frame², max jump 220 px. Layout positions are % of `window.innerWidth` so the scene spans the full screen.

## Audio

`useAudio.js` — module-level singleton. `playSfx()` clones a cached `Audio` node. Master volume is a pub/sub (`Set` of listeners). `App.jsx` manages music tracks directly with `new Audio()` and swaps `about_theme.mp3` → `theme.mp3` on PLAY.
