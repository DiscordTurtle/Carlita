# Assets

## Block sprites — `frontend/public/sprites/blocks/`

Sourced from `cdn.growtopiawiki.com/sprites/{id}.png` (fan wiki CDN, individual PNGs).

| File | Wiki ID | Used for tile | Notes |
|---|---|---|---|
| `dirt.png` | 2 | DIRT (1) | Grass-topped dirt block |
| `stone.png` | 8 | PLATFORM (2) | Purple-grey rock, jump-through platforms |
| `lava.png` | 4 | LAVA (3) | Lethal — respawns player |
| `door.png` | 12 | DOOR (4) | End of parkour, golden knob |
| `platform.png` | 102 | — | Wooden sign/plank, available if needed |
| `rock.png` | 10 | — | Pebble pile, available if needed |
| `grass.png` | 16 | — | Decorative tufts, not a solid block |

To add more blocks: `curl -s -o name.png "https://cdn.growtopiawiki.com/sprites/{ID}.png"`  
Find IDs on the Growtopia wiki (growtopia.fandom.com) infoboxes.

## Character sprites — `frontend/public/sprites/`

| File | Character |
|---|---|
| `carlita.png` | Player character |
| `cristian.png` | NPC (final scene) |

## Background / world sprites — `frontend/public/sprites/`

| File | Used in |
|---|---|
| `bg-empty.png` | GameScene background |
| `sun.png` | TitleScreen + GameScene |
| `clouds.png` | TitleScreen + GameScene |
| `logo-tree.png`, `grow.png`, `opia.png`, `logo-leaf.png` | TitleScreen logo |

## Sounds — `frontend/public/sounds/`

`about_theme.mp3`, `theme.mp3`, `tree-splice.mp3`, `tree-harvest.wav`,
`punch-hit.wav`, `punch-miss.wav`, `achievement.wav`, `firework.wav`,
`firework2.wav`, `step.wav`, `jump.wav`, `click.wav`, `blip.wav`
