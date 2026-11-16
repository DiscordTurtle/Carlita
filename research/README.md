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


### Requests from user

death animation, hurt animation, pushback should be in the opposite direction vector the user was coming from (for lava)
add double jump
short spacebar tap = short jump, long spacebar tab = longer jump (with still upper limit)
camera is too zoomed in initially, it should start from more zoomed in.
deploy the website online
❯ max zoom out should be much smaller


### Things for user to do

make a new scene for the world picker
make a new scene for the tree world
think of animation for evil ass rape wizard to steal something, such that the character (Carla) does the parkour to retrieve said thing.


### New plot
Cristian is me
Carla will be her, playing the game

Initially, after pressing play, she will get a message notification, similar to the one about the parkour map. She then will come to the world, which will trigger the cinematic of the evil ass rape wizard, who will have a short "Joins the battle meme" like intro, similar to https://www.youtube.com/watch?v=TLPmOMmduS8 (document yourself online on this meme). This wizard (with the sprite of the wizard) will then steal Cristian. Then Carla will get a notification from the evil ass rape wizard, telling her she will never get to see her boyfriend again. The broadcast will be from another world. She will then leave that world, and have highlighted the world where the evil ass rape wizard is, which is the current p4rkour map. She will do the parkour, get to the evil ass rape wizard. Punch him once, he has an animation of exploding, and saves me. Killing the evil ass rape wizard also gets her the "seed" he stole from me, which goes in her hotbar. The hotbar is the same as it was in the current implementation in the "tree scene" where she can choose the seed or the fist. I then tell her that I wanted to show her something I made for her birthday, so I tell her to meet me in another world, and leave. She then leaves the world, joins the "tree world". She sees me sad, and I tell her that the evil ass rape wizard stole my seed, and my gift for her is ruined. She will then place the seed on the tree, which will make it grow (very similar to the current tree scene, but it will be an actual gridmaker map instead). The tree grows, she punches it, and gets the letter. Once she opens the letter (exactly how we had it for now). But, the letter is glitched, showing glitching effects after opening it, and making the text unreadable. I say what the hell? Ah, I knew I had some bugs, thank god I had a copy! (In this moment I give her the physical letter) Cristian Then sits at the computer (in game) and starts coding, fixing the letter aswell (showing it on the screen aswell). After she closes the letter, Cristian character congratulates her again for her 23rd birthday. During the parkour, she will also find a silver anemonite. If she punches it, she will have it in her inventory. After reading the letter and closing it, this will also start glitching, at which point cristian says "Not again, what the fuck!" and I will give her the silver pendant with an anemonite in real life.