// Autotiling system ported from growtopia-world-planner (mfatihrabbani, MIT)
// v: 'blob'     = spread 2 (8-neighbor, 48 frames in 8×6)
//    'cross'    = spread 5 (4-neighbor, 16 frames in 8×2)
//    'platform' = spread 3 (e/w only, 4 frames: e-only, both, w-only, isolated)
//    'vert'     = spread 7 (n/s only, 4 frames: s-only, both, n-only, isolated)
//    'single'   = spread 1 (no neighbor logic, just tile at x,y)
// s: tileset page number (defaults to 1 → tiles_page1.png)

const SHEET_SIZE = 1024  // all tileset pages are 1024×1024
const TILE_PX    = 32    // each tile slot is 32×32 in the sheet

// Frame offsets for each known autotile group
// Keys match sprite filenames in /sprites/blocks/all/
export const AUTOTILE = {
  // ── Page 1: foreground blobs ──────────────────────────────────────────────
  'dirt.png':               { x: 8,  y: 20, v: 'blob' },
  'bedrock.png':            { x: 0,  y: 26, v: 'blob' },
  'stone_wall.png':         { x: 16, y: 20, v: 'blob' },
  'lava_rock.png':          { x: 24, y: 20, v: 'blob' },
  'bricks.png':             { x: 8,  y: 26, v: 'blob' },
  'sand.png':               { x: 8,  y: 14, v: 'blob' },
  'clouds.png':             { x: 24, y: 14, v: 'blob' },
  // ── Page 1: foreground cross ──────────────────────────────────────────────
  'lava.png':               { x: 4,  y: 6,  v: 'cross' },
  'ice.png':                { x: 0,  y: 16, v: 'cross' },
  'grimstone.png':          { x: 8,  y: 12, v: 'cross' },
  'blackrock_wall.png':     { x: 16, y: 10, v: 'cross' },
  'plumbing.png':           { x: 0,  y: 14, v: 'cross' },
  'chalkboard.png':         { x: 12, y: 8,  v: 'cross' },
  'pencil.png':             { x: 8,  y: 10, v: 'cross' },
  'adobe_block.png':        { x: 16, y: 14, v: 'cross' },
  'acid.png':               { x: 16, y: 12, v: 'cross' },
  'neon_lights.png':        { x: 16, y: 16, v: 'cross' },
  // ── Page 1: platforms (horizontal) ───────────────────────────────────────
  'wooden_platform.png':    { x: 0,  y: 8,  v: 'platform' },
  'grass.png':              { x: 0,  y: 6,  v: 'platform' },
  'wooden_table.png':       { x: 0,  y: 7,  v: 'platform' },
  'wrought_iron_fence.png': { x: 20, y: 18, v: 'platform' },
  'velvet_rope.png':        { x: 20, y: 19, v: 'platform' },
  // ── Page 1: single ────────────────────────────────────────────────────────
  'sandstone_wall.png':     { x: 12, y: 4,  v: 'single' },
  'high_tech_wall.png':     { x: 18, y: 2,  v: 'single' },
  // ── Page 1: backgrounds ───────────────────────────────────────────────────
  'wooden_background.png':  { x: 0,  y: 20, v: 'blob' },
  'rock_background.png':    { x: 16, y: 26, v: 'blob' },
  'cave_background.png':    { x: 24, y: 26, v: 'blob' },

  // ── Page 2: blobs ─────────────────────────────────────────────────────────
  'snowy_rocks.png':        { x: 16, y: 17, v: 'blob',     s: 2 },
  'coral.png':              { x: 0,  y: 0,  v: 'blob',     s: 2 },
  'barn_block.png':         { x: 0,  y: 6,  v: 'blob',     s: 2 },
  'sidewalk.png':           { x: 0,  y: 12, v: 'blob',     s: 2 },
  'martian_soil.png':       { x: 0,  y: 18, v: 'blob',     s: 2 },
  'cutaway_building.png':   { x: 0,  y: 24, v: 'blob',     s: 2 },
  'cliffside.png':          { x: 8,  y: 24, v: 'blob',     s: 2 },
  'deep_sand.png':          { x: 16, y: 26, v: 'blob',     s: 2 },
  'candy_cane_block.png':   { x: 0,  y: 30, v: 'blob',     s: 2 },
  // ── Page 2: cross ─────────────────────────────────────────────────────────
  'ocean_rock.png':         { x: 8,  y: 0,  v: 'cross',    s: 2 },
  'slime.png':              { x: 8,  y: 4,  v: 'cross',    s: 2 },
  'gothic_building.png':    { x: 8,  y: 6,  v: 'cross',    s: 2 },
  'tenement_building.png':  { x: 8,  y: 8,  v: 'cross',    s: 2 },
  'fire_escape.png':        { x: 8,  y: 10, v: 'cross',    s: 2 },
  'public_lava.png':        { x: 20, y: 3,  v: 'cross',    s: 2 },
  'hedge.png':              { x: 8,  y: 12, v: 'cross',    s: 2 },
  'western_building.png':   { x: 20, y: 5,  v: 'cross',    s: 2 },
  'sequoia_tree.png':       { x: 8,  y: 14, v: 'cross',    s: 2 },
  'foliage.png':            { x: 8,  y: 16, v: 'cross',    s: 2 },
  'space_connector.png':    { x: 8,  y: 18, v: 'cross',    s: 2 },
  'haunted_house.png':      { x: 8,  y: 20, v: 'cross',    s: 2 },
  'boney_block.png':        { x: 8,  y: 22, v: 'cross',    s: 2 },
  'theater_curtain.png':    { x: 8,  y: 30, v: 'cross',    s: 2 },
  'marquee_block.png':      { x: 24, y: 28, v: 'cross',    s: 2 },
  // ── Page 2: platforms ─────────────────────────────────────────────────────
  'rock_platform.png':      { x: 16, y: 16, v: 'platform', s: 2 },
  'wheat.png':              { x: 16, y: 1,  v: 'platform', s: 2 },
  'steel_table.png':        { x: 20, y: 1,  v: 'platform', s: 2 },
  'sugar_cane.png':         { x: 16, y: 2,  v: 'platform', s: 2 },
  'western_banner.png':     { x: 16, y: 6,  v: 'platform', s: 2 },
  'rustic_fence.png':       { x: 16, y: 7,  v: 'platform', s: 2 },
  'candy_cane_fence.png':   { x: 16, y: 23, v: 'platform', s: 2 },
  'couch.png':              { x: 20, y: 24, v: 'platform', s: 2 },
  'celtic_block.png':       { x: 24, y: 24, v: 'platform', s: 2 },
  // ── Page 2: vert ──────────────────────────────────────────────────────────
  'streetlamp.png':         { x: 16, y: 4,  v: 'vert',     s: 2 },
  'pillar.png':             { x: 16, y: 10, v: 'vert',     s: 2 },
  'climbing_vine.png':      { x: 22, y: 15, v: 'vert',     s: 2 },
  'festivus_pole.png':      { x: 24, y: 19, v: 'vert',     s: 2 },
  'giant_candle.png':       { x: 24, y: 20, v: 'vert',     s: 2 },
  'jellyfish.png':          { x: 16, y: 25, v: 'vert',     s: 2 },
  'churro_block.png':       { x: 24, y: 26, v: 'vert',     s: 2 },
  // ── Page 2: single ────────────────────────────────────────────────────────
  'hospital_wall.png':      { x: 23, y: 14, v: 'single',   s: 2 },

  // ── Page 3: blob ──────────────────────────────────────────────────────────
  'glowy_block.png':        { x: 0,  y: 8,  v: 'blob',     s: 3 },
  // ── Page 3: cross ─────────────────────────────────────────────────────────
  'mega_rock_speaker.png':  { x: 0,  y: 1,  v: 'cross',    s: 3 },
  'carnival_pipe.png':      { x: 8,  y: 10, v: 'cross',    s: 3 },
  // ── Page 3: platforms ─────────────────────────────────────────────────────
  'candy_cane_platform.png':{ x: 8,  y: 9,  v: 'platform', s: 3 },
  'icicles.png':            { x: 8,  y: 8,  v: 'platform', s: 3 },
  // ── Page 3: vert ──────────────────────────────────────────────────────────
  'rock_n_roll_wallpaper.png': { x: 3, y: 0, v: 'vert',    s: 3 },

  // ── Page 4: cross ─────────────────────────────────────────────────────────
  'air_duct.png':           { x: 0,  y: 4,  v: 'cross',    s: 4 },
  'texas_limestone.png':    { x: 0,  y: 6,  v: 'cross',    s: 4 },
  'fish_tank.png':          { x: 8,  y: 11, v: 'cross',    s: 4 },
  // ── Page 4: platforms ─────────────────────────────────────────────────────
  'sporty_goal.png':        { x: 0,  y: 9,  v: 'platform', s: 4 },
  'wrestling_ring.png':     { x: 10, y: 1,  v: 'platform', s: 4 },
  // ── Page 4: vert ──────────────────────────────────────────────────────────
  'stadium.png':            { x: 4,  y: 8,  v: 'vert',     s: 4 },
  'crowded_stadium.png':    { x: 4,  y: 9,  v: 'vert',     s: 4 },
  'basketball_hoop.png':    { x: 0,  y: 10, v: 'vert',     s: 4 },
  'flamingo.png':           { x: 0,  y: 8,  v: 'vert',     s: 4 },

  // ── Page 5: cross ─────────────────────────────────────────────────────────
  'gilded_frame.png':       { x: 0,  y: 12, v: 'cross',    s: 5 },
  // ── Page 5: platforms ─────────────────────────────────────────────────────
  'pink_marble_arch.png':   { x: 7,  y: 6,  v: 'platform', s: 5 },
  'potato_couch.png':       { x: 8,  y: 7,  v: 'platform', s: 5 },
  'rice.png':               { x: 11, y: 9,  v: 'platform', s: 5 },
  'festive_banner.png':     { x: 11, y: 14, v: 'platform', s: 5 },
  // ── Page 5: vert ──────────────────────────────────────────────────────────
  'red_crayon.png':         { x: 2,  y: 10, v: 'vert',     s: 5 },
  'yellow_crayon.png':      { x: 6,  y: 10, v: 'vert',     s: 5 },
  'green_crayon.png':       { x: 10, y: 10, v: 'vert',     s: 5 },
  'aqua_crayon.png':        { x: 2,  y: 11, v: 'vert',     s: 5 },
  'blue_crayon.png':        { x: 6,  y: 11, v: 'vert',     s: 5 },
  'purple_crayon.png':      { x: 10, y: 11, v: 'vert',     s: 5 },

  // ── Page 6: cross ─────────────────────────────────────────────────────────
  'cave_dirt.png':          { x: 0,  y: 0,  v: 'cross',    s: 6 },
  'dark_cave_background.png': { x: 8, y: 0, v: 'cross',    s: 6 },
  // ── Page 6: platforms ─────────────────────────────────────────────────────
  'cave_platform.png':      { x: 6,  y: 4,  v: 'platform', s: 6 },
  'dino_ribcage.png':       { x: 0,  y: 14, v: 'platform', s: 6 },
  // ── Page 6: vert ──────────────────────────────────────────────────────────
  'cave_column.png':        { x: 0,  y: 4,  v: 'vert',     s: 6 },
  'prehistoric_vines.png':  { x: 4,  y: 14, v: 'vert',     s: 6 },
  'prehistoric_candy_vines.png': { x: 8, y: 14, v: 'vert', s: 6 },

  // ── Page 7: cross ─────────────────────────────────────────────────────────
  'stone_pagoda.png':       { x: 8,  y: 0,  v: 'cross',    s: 7 },
  // ── Page 7: platforms ─────────────────────────────────────────────────────
  'grand_jade_platform.png':{ x: 0,  y: 1,  v: 'platform', s: 7 },
  'decorative_roof_dragon.png': { x: 4, y: 1, v: 'platform', s: 7 },
  'stone_pagoda_base.png':  { x: 0,  y: 2,  v: 'platform', s: 7 },
  'wooden_pagoda_roof.png': { x: 8,  y: 2,  v: 'platform', s: 7 },
  'party_bunting.png':      { x: 9,  y: 6,  v: 'platform', s: 7 },
  // ── Page 7: vert ──────────────────────────────────────────────────────────
  'bamboo.png':             { x: 0,  y: 10, v: 'vert',     s: 7 },
  // ── Page 7: single ────────────────────────────────────────────────────────
  'wooden_pagoda_wall.png': { x: 5,  y: 2,  v: 'single',   s: 7 },
  'paper_wall.png':         { x: 3,  y: 0,  v: 'single',   s: 7 },

  // ── Page 8: cross ─────────────────────────────────────────────────────────
  'ancient_block.png':      { x: 8,  y: 0,  v: 'cross',    s: 8 },
  // ── Page 8: platforms ─────────────────────────────────────────────────────
  'statue_mouth.png':       { x: 0,  y: 4,  v: 'platform', s: 8 },
  'team_bunting_grow.png':  { x: 4,  y: 8,  v: 'platform', s: 8 },
  'team_bunting_build.png': { x: 8,  y: 8,  v: 'platform', s: 8 },
  'team_bunting_punch.png': { x: 7,  y: 9,  v: 'platform', s: 8 },
  'leaves.png':             { x: 9,  y: 15, v: 'platform', s: 8 },
  // ── Page 8: vert ──────────────────────────────────────────────────────────
  'adventure_rope_piton.png': { x: 0, y: 0, v: 'vert',     s: 8 },
  'jungle_pillar.png':      { x: 4,  y: 4,  v: 'vert',     s: 8 },
  'waterfall.png':          { x: 0,  y: 13, v: 'vert',     s: 8 },
  // ── Page 8: single ────────────────────────────────────────────────────────
  'red_royal_wallpaper.png':     { x: 8,  y: 5,  v: 'single', s: 8 },
  'blue_royal_wallpaper.png':    { x: 9,  y: 5,  v: 'single', s: 8 },
  'amethyst_block.png':          { x: 14, y: 5,  v: 'single', s: 8 },
  'dark_green_wallpaper.png':    { x: 11, y: 9,  v: 'single', s: 8 },
  'dark_blue_wallpaper.png':     { x: 11, y: 10, v: 'single', s: 8 },
  'obsidian.png':                { x: 14, y: 11, v: 'single', s: 8 },
  'weather_machine_background.png': { x: 3, y: 6, v: 'single', s: 8 },

  // ── Page 9: cross ─────────────────────────────────────────────────────────
  'zen_garden.png':         { x: 0,  y: 1,  v: 'cross',    s: 9 },
  'celestial_frame.png':    { x: 4,  y: 5,  v: 'cross',    s: 9 },
  'gingerbread_house.png':  { x: 8,  y: 8,  v: 'cross',    s: 9 },
  'log_cabin.png':          { x: 0,  y: 8,  v: 'cross',    s: 9 },
  'snow_block.png':         { x: 4,  y: 10, v: 'cross',    s: 9 },
  // ── Page 9: platforms ─────────────────────────────────────────────────────
  'gingerbread_roof.png':   { x: 8,  y: 7,  v: 'platform', s: 9 },
  'log_cabin_roof.png':     { x: 0,  y: 7,  v: 'platform', s: 9 },
  'twinkling_lights.png':   { x: 0,  y: 10, v: 'platform', s: 9 },
  'a_row_of_winterfest_socks.png': { x: 12, y: 11, v: 'platform', s: 9 },
  // ── Page 9: single ────────────────────────────────────────────────────────
  'opal_block.png':              { x: 14, y: 4,  v: 'single',   s: 9 },
  'kaleidoscopic_wallpaper.png': { x: 4,  y: 4,  v: 'single',   s: 9 },
  'gingerbread_block.png':       { x: 13, y: 7,  v: 'single',   s: 9 },
  'smores_block.png':            { x: 12, y: 10, v: 'single',   s: 9 },
  'cherry_jelly_block.png':      { x: 6,  y: 12, v: 'single',   s: 9 },
  'blueberry_jelly_block.png':   { x: 8,  y: 12, v: 'single',   s: 9 },
  'orange_jelly_block.png':      { x: 12, y: 12, v: 'single',   s: 9 },
  'lime_jelly_block.png':        { x: 14, y: 12, v: 'single',   s: 9 },
  'lemon_jelly_block.png':       { x: 10, y: 12, v: 'single',   s: 9 },
  'white_chocolate_block.png':   { x: 8,  y: 13, v: 'single',   s: 9 },
  'chocolate_swirl_block.png':   { x: 9,  y: 13, v: 'single',   s: 9 },
  'chocolate_sprinkles_block.png': { x: 10, y: 13, v: 'single', s: 9 },
  'chocolate_orange_block.png':  { x: 7,  y: 13, v: 'single',   s: 9 },
  'chocolate_cherry_block.png':  { x: 6,  y: 13, v: 'single',   s: 9 },
  'sun_yellow_dancefloor.png':   { x: 11, y: 13, v: 'single',   s: 9 },
  'hot_pink_dancefloor.png':     { x: 12, y: 13, v: 'single',   s: 9 },
  'bodacious_blue_dancefloor.png': { x: 13, y: 13, v: 'single', s: 9 },
  'groovy_green_dancefloor.png': { x: 14, y: 13, v: 'single',   s: 9 },
  'raving_red_dancefloor.png':   { x: 15, y: 13, v: 'single',   s: 9 },

  // ── Wallpapers / single-frame backgrounds (page 1) ───────────────────────
  'flowery_wallpaper.png':       { x: 0,  y: 0,  v: 'single' },
  'stripey_wallpaper.png':       { x: 1,  y: 0,  v: 'single' },
  'brick_background.png':        { x: 13, y: 1,  v: 'single' },
  'checker_wallpaper.png':       { x: 13, y: 2,  v: 'single' },
  'magic_bacon_wallpaper.png':   { x: 20, y: 2,  v: 'single' },
  'blue_star_wallpaper.png':     { x: 31, y: 3,  v: 'single' },
  'grey_wallpaper.png':          { x: 23, y: 6,  v: 'single' },
  'red_wallpaper.png':           { x: 24, y: 6,  v: 'single' },
  'orange_wallpaper.png':        { x: 25, y: 6,  v: 'single' },
  'yellow_wallpaper.png':        { x: 26, y: 6,  v: 'single' },
  'green_wallpaper.png':         { x: 27, y: 6,  v: 'single' },
  'aqua_wallpaper.png':          { x: 28, y: 6,  v: 'single' },
  'blue_wallpaper.png':          { x: 29, y: 6,  v: 'single' },
  'purple_wallpaper.png':        { x: 30, y: 6,  v: 'single' },
  'lattice_background.png':      { x: 23, y: 7,  v: 'single' },
  // ── Wallpapers (page 2) ───────────────────────────────────────────────────
  'brown_wallpaper.png':         { x: 31, y: 9,  v: 'single', s: 2 },
  'white_wallpaper.png':         { x: 22, y: 11, v: 'single', s: 2 },
  'black_wallpaper.png':         { x: 23, y: 11, v: 'single', s: 2 },
  'evil_brick_background.png':   { x: 29, y: 16, v: 'single', s: 2 },
  // ── Wallpapers (page 3) ───────────────────────────────────────────────────
  'carnival_wallpaper.png':      { x: 5,  y: 7,  v: 'single', s: 3 },
  'creepy_wallpaper.png':        { x: 10, y: 3,  v: 'single', s: 3 },
  // ── Wallpapers (page 4) ───────────────────────────────────────────────────
  'pastel_pink_wallpaper.png':   { x: 0,  y: 0,  v: 'single', s: 4 },
  'pastel_orange_wallpaper.png': { x: 1,  y: 0,  v: 'single', s: 4 },
  'pastel_yellow_wallpaper.png': { x: 2,  y: 0,  v: 'single', s: 4 },
  'pastel_green_wallpaper.png':  { x: 3,  y: 0,  v: 'single', s: 4 },
  'pastel_aqua_wallpaper.png':   { x: 4,  y: 0,  v: 'single', s: 4 },
  'pastel_blue_wallpaper.png':   { x: 5,  y: 0,  v: 'single', s: 4 },
  'pastel_purple_wallpaper.png': { x: 6,  y: 0,  v: 'single', s: 4 },
  'viney_wallpaper.png':         { x: 1,  y: 2,  v: 'single', s: 4 },
  'dark_red_wallpaper.png':      { x: 15, y: 6,  v: 'single', s: 4 },
  'autumn_viney_wallpaper.png':  { x: 1,  y: 14, v: 'single', s: 4 },
}

// Map game tile IDs (from mapFormat.js) to autotile entries
export const TILE_ID_AUTOTILE = {
  1: AUTOTILE['dirt.png'],     // DIRT
  2: AUTOTILE['bedrock.png'],  // PLATFORM (stone)
  3: AUTOTILE['lava.png'],     // LAVA
}

function blobVariant({ n, e, s, w, nw, ne, se, sw }) {
  nw = nw && n && w; ne = ne && n && e; se = se && s && e; sw = sw && s && w

  if (nw&&n&&ne&&w&&e&&sw&&s&&se) return [0,0]
  if (n&&ne&&w&&e&&sw&&s&&se)     return [5,1]
  if (nw&&n&&w&&e&&sw&&s&&se)     return [6,1]
  if (nw&&n&&ne&&w&&e&&s&&se)     return [7,1]
  if (nw&&n&&ne&&w&&e&&sw&&s)     return [0,2]
  if (n&&w&&e&&sw&&s&&se)         return [1,2]
  if (nw&&n&&ne&&w&&e&&s)         return [2,2]
  if (n&&ne&&w&&e&&s&&se)         return [3,2]
  if (nw&&n&&w&&e&&sw&&s)         return [4,2]
  if (n&&ne&&w&&e&&sw&&s)         return [5,2]
  if (nw&&n&&w&&e&&s&&se)         return [6,2]
  if (nw&&n&&w&&e&&s)             return [7,2]
  if (n&&ne&&w&&e&&s)             return [0,3]
  if (n&&w&&e&&sw&&s)             return [1,3]
  if (n&&w&&e&&s&&se)             return [2,3]
  if (w&&e&&sw&&s&&se)            return [1,0]
  if (nw&&n&&ne&&w&&e)            return [2,0]
  if (n&&ne&&e&&s&&se)            return [3,0]
  if (nw&&n&&w&&sw&&s)            return [4,0]
  if (n&&ne&&e&&s)                return [0,4]
  if (n&&w&&e&&s)                 return [3,3]
  if (n&&e&&s&&se)                return [7,3]
  if (n&&w&&sw&&s)                return [2,4]
  if (nw&&n&&w&&s)                return [3,4]
  if (w&&e&&s&&se)                return [5,4]
  if (w&&e&&sw&&s)                return [6,4]
  if (n&&ne&&w&&e)                return [0,5]
  if (nw&&n&&w&&e)                return [1,5]
  if (n&&e&&s)                    return [1,4]
  if (n&&w&&s)                    return [4,4]
  if (w&&e&&s)                    return [7,4]
  if (n&&w&&e)                    return [2,5]
  if (e&&s&&se)                   return [5,0]
  if (w&&sw&&s)                   return [6,0]
  if (n&&ne&&e)                   return [7,0]
  if (nw&&n&&w)                   return [0,1]
  if (n&&s)                       return [1,1]
  if (n&&e)                       return [3,5]
  if (n&&w)                       return [4,5]
  if (e&&s)                       return [5,5]
  if (w&&s)                       return [6,5]
  if (w&&e)                       return [4,3]
  if (e)                          return [5,3]
  if (w)                          return [6,3]
  if (n)                          return [3,1]
  if (s)                          return [2,1]
  return [4,1]
}

// spread=3: horizontal platform — checks e/w only, 4 frames in row 0
function platformVariant({ e, w }) {
  if (e && w)  return [1, 0]  // middle
  if (w)       return [2, 0]  // right cap
  if (e)       return [0, 0]  // left cap
  return [3, 0]               // isolated
}

// spread=7: vertical — checks n/s only, 4 frames in row 0
function vertVariant({ n, s }) {
  if (n && s)  return [1, 0]  // middle
  if (n)       return [2, 0]  // bottom cap
  if (s)       return [0, 0]  // top cap
  return [3, 0]               // isolated
}

function crossVariant({ n, e, s, w }) {
  if (n&&w&&e&&s) return [0,0]
  if (w&&e&&s)    return [1,0]
  if (n&&w&&e)    return [2,0]
  if (n&&e&&s)    return [3,0]
  if (n&&w&&s)    return [4,0]
  if (e&&s)       return [5,0]
  if (w&&s)       return [6,0]
  if (n&&e)       return [7,0]
  if (n&&w)       return [0,1]
  if (n&&s)       return [1,1]
  if (w&&e)       return [5,1]
  if (e)          return [6,1]
  if (w)          return [7,1]
  if (n)          return [3,1]
  if (s)          return [2,1]
  return [4,1]
}

// Returns CSS background properties to show the correct frame from the tileset
// displayPx: rendered tile size in pixels
export function autotileCSS(entry, neighbors, displayPx) {
  const sheet = `/sprites/tiles_page${entry.s ?? 1}.png`
  const scale  = displayPx / TILE_PX
  const sheetPx = SHEET_SIZE * scale

  let ox = 0, oy = 0
  if      (entry.v === 'blob')     [ox, oy] = blobVariant(neighbors)
  else if (entry.v === 'cross')    [ox, oy] = crossVariant(neighbors)
  else if (entry.v === 'platform') [ox, oy] = platformVariant(neighbors)
  else if (entry.v === 'vert')     [ox, oy] = vertVariant(neighbors)
  // 'single': ox=0, oy=0 — just the tile at (x, y), no neighbor logic

  return {
    backgroundImage:    `url(${sheet})`,
    backgroundSize:     `${sheetPx}px ${sheetPx}px`,
    backgroundPosition: `${-((entry.x + ox) * displayPx)}px ${-((entry.y + oy) * displayPx)}px`,
    imageRendering:     'pixelated',
  }
}
