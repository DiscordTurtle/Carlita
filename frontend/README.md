# Carlita & Cristian — One Year ♥

A tiny Growtopia-inspired anniversary mini-game built with React + Vite + Tailwind.

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

## Asset credits

Sprites, font, and sounds: Ubisoft / Growtopia Fan Kit (assets were copied into `public/` from the `sprites/Growtopia FanKit/` folder).
