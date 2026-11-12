export const TILES = {
  AIR:      0,
  DIRT:     1,
  PLATFORM: 2,  // solid top-only; player can jump through from below
  LAVA:     3,  // lethal — respawns player
  DOOR:     4,  // scene-transition trigger
  SEED:     5,  // one-time pickup
}

export const TILE_DEF = {
  0: { solid: false,  lethal: false, label: 'Air',      color: 'transparent', border: 'transparent' },
  1: { solid: true,   lethal: false, label: 'Dirt',     color: '#5c3a1e', border: '#3d2010', sprite: '/sprites/blocks/dirt.png'     },
  2: { solid: 'top',  lethal: false, label: 'Platform', color: '#8b6914', border: '#5a4008', sprite: '/sprites/blocks/stone.png'    },
  3: { solid: false,  lethal: true,  label: 'Lava',     color: '#ff4800', border: '#cc2200', sprite: '/sprites/blocks/lava.png'     },
  4: { solid: false,  lethal: false, label: 'Door',     color: '#c8a060', border: '#8b6914', sprite: '/sprites/blocks/door.png',    special: 'door' },
  5: { solid: false,  lethal: false, label: 'Seed',     color: '#90ee90', border: '#228b22',                                        special: 'seed' },
}
