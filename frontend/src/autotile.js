// Autotiling system ported from growtopia-world-planner (mfatihrabbani, MIT)
// blobVariant = spread 2 (8-neighbor), crossVariant = spread 5 (4-neighbor)
// getNeighbors returns { n,ne,e,se,s,sw,w,nw } where true = same-type tile present

const SHEET_SIZE = 1024  // tiles_page1.png is 1024×1024
const TILE_PX    = 32    // each tile slot is 32×32 in the sheet

// Frame offsets for each known autotile group: { textureX, textureY, variant }
export const AUTOTILE = {
  // name → matches sprite filenames in /sprites/blocks/all/
  'dirt.png':               { x: 8,  y: 20, v: 'blob' },
  'bedrock.png':            { x: 0,  y: 26, v: 'blob' },
  'stone_wall.png':         { x: 16, y: 20, v: 'blob' },
  'lava_rock.png':          { x: 24, y: 20, v: 'blob' },
  'wooden_background.png':  { x: 0,  y: 20, v: 'blob' },
  'bricks.png':             { x: 8,  y: 26, v: 'blob' },
  'rock_background.png':    { x: 16, y: 26, v: 'blob' },
  'cave_background.png':    { x: 24, y: 26, v: 'blob' },
  'sand.png':               { x: 8,  y: 14, v: 'blob' },
  'lava.png':               { x: 4,  y: 6,  v: 'cross' },
  'ice.png':                { x: 0,  y: 16, v: 'cross' },
  'grimstone.png':          { x: 8,  y: 12, v: 'cross' },
}

// Map game tile IDs (from mapFormat.js) to autotile entries
export const TILE_ID_AUTOTILE = {
  1: AUTOTILE['dirt.png'],     // DIRT
  2: AUTOTILE['bedrock.png'],  // PLATFORM (stone)
  3: AUTOTILE['lava.png'],     // LAVA
}

function blobVariant({ n, e, s, w, nw, ne, se, sw }) {
  // Diagonal gating: corner only counts if both orthogonal neighbours are present
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
  return [4,1]  // isolated
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
  return [4,1]  // isolated
}

// Returns CSS background properties to show the correct frame from tiles_page1.png
// displayPx: rendered tile size in pixels (can differ from TILE_PX)
export function autotileCSS(entry, neighbors, displayPx) {
  const [ox, oy] = entry.v === 'blob' ? blobVariant(neighbors) : crossVariant(neighbors)
  const scale    = displayPx / TILE_PX
  const sheetPx  = SHEET_SIZE * scale
  const px       = -((entry.x + ox) * displayPx)
  const py       = -((entry.y + oy) * displayPx)
  return {
    backgroundImage:    'url(/sprites/tiles_page1.png)',
    backgroundSize:     `${sheetPx}px ${sheetPx}px`,
    backgroundPosition: `${px}px ${py}px`,
    imageRendering:     'pixelated',
  }
}
