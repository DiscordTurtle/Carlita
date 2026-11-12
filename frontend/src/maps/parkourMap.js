// 20 rows × 60 cols  |  TILE_SIZE = 40px
// 0=AIR 1=DIRT 2=PLATFORM 3=LAVA 4=DOOR 5=SEED
// Row 0 = sky top, Row 19 = underground bottom
// Ground level = row 14; rows 15-19 always solid underground

function build() {
  const ROWS = 20, COLS = 60
  const m = Array.from({ length: ROWS }, () => Array(COLS).fill(0))

  // Underground: rows 15-19 always solid
  for (let r = 15; r <= 19; r++)
    for (let c = 0; c < COLS; c++) m[r][c] = 1

  // Ground row (row 14): dirt with lava pits, seed, door
  //       0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59
  const G = [1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 3, 3, 3, 3, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 5, 1, 3, 3, 1, 4]
  G.forEach((t, c) => { m[14][c] = t })

  // — Stepping stone over the 4-tile lava pit (cols 25-28)
  //   Reachable: 3 tiles above ground < max jump height ~3.5 tiles
  m[11][26] = 2
  m[11][27] = 2

  // — Optional helper platforms (not required, add fun routing)
  m[10][11] = 2                   // high route over pit 10-12
  m[ 9][19] = 2                   // mid step for pit 18-20
  m[ 9][41] = 2                   // mid step for pit 40-42

  // — Decorative aerial platforms (visual interest, like parkour.jpg)
  m[6][15] = 2; m[6][16] = 2; m[6][17] = 2
  m[7][33] = 2; m[7][34] = 2
  m[5][44] = 2; m[5][45] = 2; m[5][46] = 2

  return m
}

export const PARKOUR_MAP = build()

// Player spawns on top of tile (col 1, row 14) = first safe ground tile
export const SPAWN = { col: 1, row: 14 }
