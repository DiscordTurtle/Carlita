import React, { useCallback, useEffect, useRef, useState } from 'react'
import { TILE_DEF, TILES } from '../maps/mapFormat.js'
import { playSfx } from '../useAudio.js'

const TILE     = 40   // px per tile
const PLAYER_W = 20   // hitbox width
const PLAYER_H = 48   // hitbox height
const WALK     = 4    // px/frame
const JUMP_VEL = 13   // px/frame initial upward speed
const GRAVITY  = 0.6  // px/frame² downward acceleration
const MAX_FALL = 32   // terminal velocity (prevents tunneling through thin tiles)

function getTile(map, col, row) {
  if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) return 1
  return map[row][col]
}

const isSolid    = id => TILE_DEF[id]?.solid === true
const isPlatform = id => TILE_DEF[id]?.solid === 'top'

export default function GridWorld({ map: initialMap, spawn, onComplete, onMenu }) {
  const ROWS = initialMap.length
  const COLS = initialMap[0].length

  const spawnPx = spawn.col * TILE
  const spawnPy = spawn.row * TILE - PLAYER_H  // feet at top of spawn tile

  const [map,     setMap]     = useState(() => initialMap.map(r => [...r]))
  const [hasSeed, setHasSeed] = useState(false)
  const [,        setTick]    = useState(0)  // pure re-render trigger

  // Physics refs — mutated every frame, not React state
  const pxRef      = useRef(spawnPx)
  const pyRef      = useRef(spawnPy)
  const vyRef      = useRef(0)
  const prevPyRef  = useRef(spawnPy)
  const groundedRef = useRef(true)
  const hasSeedRef = useRef(false)
  const mapRef     = useRef(map)
  const facingRef  = useRef('right')
  const walkingRef = useRef(false)
  const keys       = useRef({ left: false, right: false })
  const doneRef    = useRef(false)  // prevent calling onComplete twice

  useEffect(() => { mapRef.current = map }, [map])

  const respawn = useCallback(() => {
    pxRef.current      = spawnPx
    pyRef.current      = spawnPy
    vyRef.current      = 0
    groundedRef.current = false
    playSfx('/sounds/blip.wav', { volume: 0.6 })
  }, [spawnPx, spawnPy])

  // Keyboard
  useEffect(() => {
    const isLeft  = e => e.code === 'ArrowLeft'  || e.key === 'a' || e.key === 'A'
    const isRight = e => e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D'
    const isJump  = e => e.code === 'Space'      || e.key === ' '

    const down = e => {
      if (isLeft(e))  { keys.current.left  = true; e.preventDefault() }
      if (isRight(e)) { keys.current.right = true; e.preventDefault() }
      if (isJump(e) && !e.repeat && groundedRef.current) {
        e.preventDefault()
        vyRef.current = -JUMP_VEL
        groundedRef.current = false
        playSfx('/sounds/jump.wav', { volume: 0.7 })
      }
      if (e.key === 'Escape') { e.preventDefault(); onMenu?.() }
    }
    const up   = e => {
      if (isLeft(e))  keys.current.left  = false
      if (isRight(e)) keys.current.right = false
    }
    const blur = () => { keys.current.left = false; keys.current.right = false }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup',   up)
    window.addEventListener('blur',    blur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup',   up)
      window.removeEventListener('blur',    blur)
    }
  }, [onMenu])

  // Game loop
  useEffect(() => {
    let raf
    const loop = () => {
      if (doneRef.current) return

      const m   = mapRef.current
      let npx   = pxRef.current
      let npy   = pyRef.current

      // — Horizontal movement —
      let dx = 0
      if (keys.current.left)  dx = -WALK
      if (keys.current.right) dx =  WALK
      if (dx !== 0) {
        facingRef.current  = dx < 0 ? 'left' : 'right'
        walkingRef.current = groundedRef.current
        npx = Math.max(0, Math.min(COLS * TILE - PLAYER_W, npx + dx))
        // X collision: check leading edge at 3 heights
        const edgeX = dx > 0 ? npx + PLAYER_W : npx
        for (const cy of [npy + 2, npy + PLAYER_H / 2, npy + PLAYER_H - 2]) {
          if (isSolid(getTile(m, Math.floor(edgeX / TILE), Math.floor(cy / TILE)))) {
            npx = dx > 0
              ? Math.floor(edgeX / TILE) * TILE - PLAYER_W
              : (Math.floor(edgeX / TILE) + 1) * TILE
            break
          }
        }
      } else {
        walkingRef.current = false
      }

      // — Vertical movement —
      prevPyRef.current = npy
      vyRef.current = Math.min(vyRef.current + GRAVITY, MAX_FALL)
      npy += vyRef.current
      groundedRef.current = false

      if (vyRef.current >= 0) {
        // Falling: check bottom corners
        const bottomY   = npy + PLAYER_H
        const prevBottom = prevPyRef.current + PLAYER_H
        for (const cx of [npx + 2, npx + PLAYER_W - 2]) {
          const col      = Math.floor(cx      / TILE)
          const row      = Math.floor(bottomY / TILE)
          const id       = getTile(m, col, row)
          const tileTop  = row * TILE
          if (isSolid(id) || (isPlatform(id) && prevBottom <= tileTop)) {
            npy = tileTop - PLAYER_H
            vyRef.current      = 0
            groundedRef.current = true
            break
          }
        }
      } else {
        // Rising: check top corners (platforms passable from below)
        const topY = npy
        for (const cx of [npx + 2, npx + PLAYER_W - 2]) {
          if (isSolid(getTile(m, Math.floor(cx / TILE), Math.floor(topY / TILE)))) {
            npy = (Math.floor(topY / TILE) + 1) * TILE
            vyRef.current = 0
            break
          }
        }
      }

      // Fell below map → respawn
      if (npy + PLAYER_H > ROWS * TILE) { respawn(); setTick(t => t + 1); raf = requestAnimationFrame(loop); return }

      pxRef.current = npx
      pyRef.current = npy

      // — Special tile overlap scan —
      const topRow  = Math.max(0,       Math.floor(npy / TILE))
      const botRow  = Math.min(ROWS - 1, Math.floor((npy + PLAYER_H) / TILE))
      const leftCol = Math.max(0,       Math.floor(npx / TILE))
      const rightCol = Math.min(COLS - 1, Math.floor((npx + PLAYER_W - 1) / TILE))

      let shouldRespawn = false, reachedDoor = false, pickedSeed = false
      for (let r = topRow; r <= botRow; r++) {
        for (let c = leftCol; c <= rightCol; c++) {
          const id  = getTile(m, c, r)
          const def = TILE_DEF[id] || {}
          if (def.lethal)              shouldRespawn = true
          if (def.special === 'door')  reachedDoor   = true
          if (def.special === 'seed' && !hasSeedRef.current) pickedSeed = true
        }
      }

      if (shouldRespawn) { respawn(); setTick(t => t + 1); raf = requestAnimationFrame(loop); return }

      if (pickedSeed) {
        hasSeedRef.current = true
        // Remove seed from map immediately so next frame doesn't re-trigger
        const newMap = mapRef.current.map(r => [...r])
        for (let r = topRow; r <= botRow; r++)
          for (let c = leftCol; c <= rightCol; c++)
            if (newMap[r]?.[c] === TILES.SEED) newMap[r][c] = TILES.AIR
        mapRef.current = newMap
        setMap(newMap)
        setHasSeed(true)
        playSfx('/sounds/achievement.wav', { volume: 0.7 })
      }

      if (reachedDoor && !doneRef.current) {
        doneRef.current = true
        onComplete?.({ hasSeed: hasSeedRef.current })
        return
      }

      setTick(t => t + 1)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [respawn, onComplete, COLS, ROWS])

  // Render
  const viewW = window.innerWidth
  const viewH = window.innerHeight
  const camX  = Math.max(0, Math.min(pxRef.current + PLAYER_W / 2 - viewW / 2, COLS * TILE - viewW))
  const camY  = Math.max(0, Math.min(pyRef.current + PLAYER_H / 2 - viewH / 2, ROWS * TILE - viewH))

  const startCol = Math.max(0,       Math.floor(camX / TILE))
  const endCol   = Math.min(COLS - 1, Math.ceil((camX + viewW) / TILE))
  const startRow = Math.max(0,       Math.floor(camY / TILE))
  const endRow   = Math.min(ROWS - 1, Math.ceil((camY + viewH) / TILE))

  const tileEls = []
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const id = map[r][c]
      if (id === 0) continue
      const def = TILE_DEF[id] || TILE_DEF[0]
      const anim =
        id === TILES.DOOR ? 'gwDoorPulse 1.5s ease-in-out infinite' :
        id === TILES.SEED ? 'gwSeedBob 1.2s ease-in-out infinite' : undefined
      tileEls.push(
        <div
          key={`${r}-${c}`}
          style={{
            position: 'absolute',
            left: c * TILE, top: r * TILE,
            width: TILE, height: TILE,
            boxSizing: 'border-box',
            imageRendering: 'pixelated',
            animation: anim,
            ...(def.sprite
              ? { backgroundImage: `url(${def.sprite})`, backgroundSize: '100% 100%' }
              : { background: def.color, border: `1px solid ${def.border || '#000'}` }
            ),
          }}
        />
      )
    }
  }

  const flip = facingRef.current === 'left' ? -1 : 1

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: '#1a0d2e' }}>
      <style>{`
        @keyframes gwDoorPulse {
          0%,100% { filter: brightness(1)   drop-shadow(0 0  6px #ffd700); }
          50%     { filter: brightness(1.6) drop-shadow(0 0 14px #ffd700); }
        }
        @keyframes gwSeedBob {
          0%,100% { transform: translateY(0);    }
          50%     { transform: translateY(-5px); }
        }
      `}</style>

      {/* World (camera offset via transform) */}
      <div style={{ position: 'absolute', top: 0, left: 0, transform: `translate(${-camX}px,${-camY}px)`, willChange: 'transform' }}>
        {tileEls}

        {/* Player */}
        <div
          style={{
            position: 'absolute',
            left: pxRef.current,
            top:  pyRef.current - 12,  // -12 so sprite extends slightly above hitbox top
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          <div style={{ marginBottom: 4, textAlign: 'center', whiteSpace: 'nowrap' }}>
            <span className="legend-name" style={{ fontSize: 13 }}>Carlita of Legend</span>
          </div>
          <img
            src="/sprites/carlita.png"
            alt="Carlita"
            draggable={false}
            className="pixel"
            style={{
              height: PLAYER_H + 12,
              width: 'auto',
              transform: `scaleX(${flip})`,
              transformOrigin: 'center bottom',
              display: 'block',
            }}
          />
        </div>
      </div>

      {/* HUD */}
      {hasSeed && (
        <div style={{
          position: 'fixed', top: 16, left: 16,
          background: 'rgba(0,0,0,0.65)', color: '#90ee90',
          padding: '6px 14px', borderRadius: 8, fontSize: 14, fontWeight: 'bold', zIndex: 100
        }}>
          Seed collected!
        </div>
      )}

      {/* Controls hint */}
      <div style={{
        position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.5)', color: '#ccc',
        padding: '4px 12px', borderRadius: 6, fontSize: 12, zIndex: 100, pointerEvents: 'none'
      }}>
        Arrow keys / A D — move &nbsp;|&nbsp; Space — jump &nbsp;|&nbsp; ESC — menu
      </div>
    </div>
  )
}
