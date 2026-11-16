import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AUTOTILE, autotileCSS } from '../autotile.js'
import { getMasterVolume, playSfx, setMasterVolume as setAudioVolume, subscribeToMasterVolume } from '../useAudio.js'
import GameMenu from './GameMenu.jsx'

const TILE     = 32   // physics world unit
const PLAYER_W = 20
const PLAYER_H = 28   // < TILE so player fits through 1-tile gaps
const SPRITE_H = 56   // visual height of the character sprite
const WALK          = 4
const JUMP_VEL_MIN  = 6    // keyup cut — ~1 block (32px)
const JUMP_VEL_MAX  = 10.3 // press vel  — ~3 blocks (96px)
const GRAVITY       = 0.55
const MAX_FALL      = 20
const MAX_HP        = 5
const IFRAMES       = 90   // ~1.5 s invincibility after lava hit
const LAVA_KBX      = 7
const LAVA_KBY      = 12
const DEATH_FRAMES  = 36   // 0.6 s — soul rise + fade

const DEFAULT_SCALE = () => window.innerWidth / (15 * TILE)
const MIN_SCALE     = 0.8
const MAX_SCALE     = 3.0

// All these block movement from all sides
const SOLID = new Set([
  'hedge.png', 'balloon_jammer.png', 'punch_jammer.png', 'zombie_jammer.png',
  'world_lock.png', 'bedrock.png',
  'dirt.png', 'rock.png', 'coral.png', 'small_lock.png',
  'venus_guytrap.png', 'hanging_guytrap.png', 'death_spikes.png',
  'lava.png',   // solid but causes damage + propulsion on contact
])
const PLATFORM  = new Set(['wooden_platform.png'])
const INSTAKILL = new Set(['venus_guytrap.png', 'hanging_guytrap.png', 'death_spikes.png'])
const LAVA_SET  = new Set(['lava.png'])

const SIGN_SET  = new Set(['sign.png', 'crappy_sign.png'])
const CHECKPOINT = 'checkpoint.png'
const ORB_TILE   = 'great_legendary_orb.png'
const DOOR_TILE  = 'main_door.png'

const SIGN_BY_COL = {
  2:  'Bun venit! Ajunge pana la orb... daca poti. 😏',
  5:  'Spikes = moarte instantanee! ☠️',
  8:  'Flytraps musca. Tare. 🌿',
  11: 'Lava arde! 5 lovituri si gata. 🔥',
  14: 'Atinge checkpoint-urile — iti salveaza viata! ✨',
}
const GENERIC_SIGNS = [
  'Watch your step! 👀', 'One tile at a time...', 'Look before you leap! 🦘',
  'Almost there... maybe.', 'Believe in yourself! 💪',
]

const ORB_MSG =
  'Felicitări, Carlita! 🏆\n\n' +
  'Ai reușit parcursul și ai câștigat Sămânța Legendară!\n' +
  'Acum vino la mine — am nevoie de ajutor\n' +
  'cu înmulțit un copac magic. Adu-ți sămânța! 🌱\n\n' +
  '— Cristian'

const BASE_URL = '/sprites/blocks/all/'

function getFg(grid, r, c) {
  if (r < 0 || r >= grid.length || c < 0 || c >= (grid[0]?.length ?? 0)) return null
  return grid[r][c]?.fg ?? null
}

function nbrs(grid, r, c, layer, name) {
  const get = (dr, dc) => grid[r+dr]?.[c+dc]?.[layer] === name
  return { n:get(-1,0), ne:get(-1,1), e:get(0,1), se:get(1,1), s:get(1,0), sw:get(1,-1), w:get(0,-1), nw:get(-1,-1) }
}

function tileStyle(name, n, size) {
  const at = AUTOTILE[name]
  return at
    ? autotileCSS(at, n, size)
    : { background: `url(${BASE_URL+name}) center/calc(100% + 2px) calc(100% + 2px) no-repeat`, imageRendering: 'pixelated' }
}

export default function GridWorld({ onComplete, onMenu, scenePath = '/scenes/Parkour.json', worldLayerRef }) {
  const [loading,      setLoading]      = useState(true)
  const [scene,        setScene]        = useState(null)
  const [hp,           setHp]           = useState(MAX_HP)
  const [litChecks,    setLitChecks]    = useState(() => new Set())
  const [hasOrb,       setHasOrb]       = useState(false)
  const [showOrbMsg,   setShowOrbMsg]   = useState(false)
  const [signText,     setSignText]     = useState(null)
  const [removed,      setRemoved]      = useState(() => new Set())
  const [menuOpen,     setMenuOpen]     = useState(false)
  const [masterVolume, setMasterVolume] = useState(getMasterVolume)
  const [tileScale,    setTileScale]    = useState(DEFAULT_SCALE)
  const [,             setTick]         = useState(0)

  useEffect(() => setAudioVolume(masterVolume), [masterVolume])
  useEffect(() => subscribeToMasterVolume(v => setMasterVolume(v)), [])

  const outerRef = useRef(null)
  const camRef   = useRef({ x: 0, y: 0 })

  // sync external world-layer overlay to our exact camera transform every frame
  // camRef is written during render (below); useLayoutEffect fires after render
  useLayoutEffect(() => {
    if (worldLayerRef?.current)
      worldLayerRef.current.style.transform = `translate(${-camRef.current.x}px,${-camRef.current.y}px)`
  })

  // Zoom via scroll
  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    const handler = e => {
      e.preventDefault()
      setTileScale(prev => Math.max(window.innerWidth / (31 * TILE), Math.min(window.innerWidth / (7 * TILE), prev - e.deltaY * 0.002)))
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  })

  // Derived from scene — set once after load
  const spawnRef    = useRef({ px: 0, py: 0 })
  const curSpawnRef = useRef(null)
  const signsRef    = useRef([])
  const orbRef      = useRef(null)

  // Physics refs (mutated every frame)
  const pxRef        = useRef(0)
  const pyRef        = useRef(0)
  const vyRef        = useRef(0)
  const vxRef        = useRef(0)
  const prevPyRef    = useRef(0)
  const groundedRef  = useRef(false)
  const facingRef    = useRef('right')
  const ifrRef       = useRef(0)
  const hpRef        = useRef(MAX_HP)
  const hasOrbRef    = useRef(false)
  const removedRef   = useRef(new Set())
  const litRef       = useRef(new Set())
  const keys          = useRef({ left: false, right: false })
  const airJumpsRef   = useRef(0)
  const dyingRef      = useRef(false)
  const deathFrameRef = useRef(0)
  const doneRef       = useRef(false)

  const [dying,        setDying]        = useState(false)
  const [deathAnimKey, setDeathAnimKey] = useState(0)

  // Load scene
  useEffect(() => {
    fetch(scenePath)
      .then(r => r.json())
      .then(data => {
        const grid = data.grid
        const ROWS = grid.length, COLS = grid[0]?.length ?? 0
        let spawn = { px: TILE, py: TILE * 2 }
        const signs = []
        let orbPos = null

        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            const fg = grid[r][c]?.fg
            if (!fg) continue
            if (fg === DOOR_TILE && !spawn._found) {
              // Spawn standing on first solid floor below the door
              let floorRow = r + 1
              while (floorRow < ROWS && !SOLID.has(grid[floorRow]?.[c]?.fg) && !PLATFORM.has(grid[floorRow]?.[c]?.fg)) floorRow++
              spawn = { px: c * TILE + (TILE - PLAYER_W) / 2, py: floorRow * TILE - PLAYER_H, _found: true }
            }
            if (SIGN_SET.has(fg)) {
              const text = SIGN_BY_COL[c] ?? GENERIC_SIGNS[(r * 7 + c * 13) % GENERIC_SIGNS.length]
              signs.push({ r, c, text })
            }
            if (fg === ORB_TILE) orbPos = { r, c }
          }
        }

        spawnRef.current  = spawn
        signsRef.current  = signs
        orbRef.current    = orbPos
        pxRef.current     = spawn.px
        pyRef.current     = spawn.py

        setScene(data)
        setLoading(false)
      })
  }, [])

  const respawn = useCallback(() => {
    const sp = curSpawnRef.current ?? spawnRef.current
    pxRef.current   = sp.px
    pyRef.current   = sp.py
    vyRef.current   = 0
    vxRef.current   = 0
    groundedRef.current = false
    ifrRef.current  = 0
    hpRef.current   = MAX_HP
    setHp(MAX_HP)
    playSfx('/sounds/blip.wav', { volume: 0.6 })
  }, [])

  // Keyboard
  useEffect(() => {
    if (loading) return
    const isLeft  = e => e.code === 'ArrowLeft'  || e.key === 'a' || e.key === 'A'
    const isRight = e => e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D'
    const isJump  = e => e.code === 'Space'      || e.key === ' '
    const isPunch = e => e.key === 'e' || e.key === 'E'

    const down = e => {
      if (isLeft(e))  { keys.current.left  = true;  e.preventDefault() }
      if (isRight(e)) { keys.current.right = true;  e.preventDefault() }
      if (isJump(e) && !e.repeat) {
        e.preventDefault()
        if (groundedRef.current) {
          vyRef.current       = -JUMP_VEL_MAX
          groundedRef.current = false
          airJumpsRef.current = 0
          playSfx('/sounds/jump.wav', { volume: 0.7 })
        } else if (!dyingRef.current && airJumpsRef.current < 1) {
          vyRef.current = -JUMP_VEL_MAX
          airJumpsRef.current++
          playSfx('/sounds/jump.wav', { volume: 0.5 })
        }
      }
      if (isPunch(e) && !e.repeat) tryPunchOrb()
      if (e.key === 'Escape') { e.preventDefault(); setMenuOpen(true) }
    }
    const up   = e => {
      if (isLeft(e))  keys.current.left  = false
      if (isRight(e)) keys.current.right = false
      if (isJump(e) && vyRef.current < -JUMP_VEL_MIN) vyRef.current = -JUMP_VEL_MIN
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
  }, [loading])

  function tryPunchOrb() {
    if (hasOrbRef.current) return
    const orb = orbRef.current
    if (!orb || removedRef.current.has(`${orb.r},${orb.c}`)) return
    const px = pxRef.current + PLAYER_W / 2
    const py = pyRef.current + PLAYER_H / 2
    const dist = Math.hypot(px - (orb.c * TILE + TILE / 2), py - (orb.r * TILE + TILE / 2))
    if (dist < TILE * 2.5) {
      removedRef.current = new Set([...removedRef.current, `${orb.r},${orb.c}`])
      setRemoved(new Set(removedRef.current))
      hasOrbRef.current = true
      setHasOrb(true)
      setShowOrbMsg(true)
      playSfx('/sounds/achievement.wav', { volume: 0.9 })
    }
  }

  function triggerDeath() {
    if (dyingRef.current) return
    dyingRef.current      = true
    deathFrameRef.current = DEATH_FRAMES
    hpRef.current         = 0
    vyRef.current         = 0  // freeze vertical movement
    setHp(0)
    setDying(true)
    setDeathAnimKey(k => k + 1)
    playSfx('/sounds/punch-hit.wav', { volume: 0.9 })
  }

  function applyLavaDamage() {
    if (ifrRef.current > 0) return false
    const newHp = hpRef.current - 1
    hpRef.current  = newHp
    ifrRef.current = IFRAMES
    setHp(newHp)
    playSfx('/sounds/punch-hit.wav', { volume: 0.6 })
    return newHp <= 0
  }

  // Game loop
  useEffect(() => {
    if (!scene) return
    const grid = scene.grid
    const ROWS = grid.length
    const COLS = grid[0]?.length ?? 0

    let raf
    const loop = () => {
      if (doneRef.current) return

      // — Death animation (player frozen; soul + shrink handled via CSS) —
      if (dyingRef.current) {
        deathFrameRef.current--
        if (deathFrameRef.current <= 0) {
          dyingRef.current = false
          setDying(false)
          respawn()
        }
        setTick(t => t + 1); raf = requestAnimationFrame(loop); return
      }

      if (ifrRef.current > 0) ifrRef.current--

      let npx = pxRef.current
      let npy = pyRef.current

      // — Horizontal —
      const keysDx = keys.current.left ? -WALK : keys.current.right ? WALK : 0
      vxRef.current *= 0.82
      if (Math.abs(vxRef.current) < 0.1) vxRef.current = 0
      const dx = keysDx + vxRef.current
      if (keysDx !== 0) facingRef.current = keysDx < 0 ? 'left' : 'right'

      if (dx !== 0) {
        npx = Math.max(0, Math.min(COLS * TILE - PLAYER_W, npx + dx))
        const edgeX = dx > 0 ? npx + PLAYER_W : npx
        for (const cy of [npy + 2, npy + PLAYER_H / 2, npy + PLAYER_H - 2]) {
          const name = getFg(grid, Math.floor(cy / TILE), Math.floor(edgeX / TILE))
          if (!SOLID.has(name)) continue
          if (INSTAKILL.has(name)) {
            triggerDeath(); setTick(t => t+1); raf = requestAnimationFrame(loop); return
          }
          if (LAVA_SET.has(name)) {
            // Lava wall: push back + damage
            const died = applyLavaDamage()
            vxRef.current = dx > 0 ? -LAVA_KBX : LAVA_KBX
            vyRef.current = -4
            if (died) { triggerDeath(); setTick(t => t+1); raf = requestAnimationFrame(loop); return }
            // Don't block movement — knockback carries them away
          } else {
            npx = dx > 0
              ? Math.floor(edgeX / TILE) * TILE - PLAYER_W
              : (Math.floor(edgeX / TILE) + 1) * TILE
            vxRef.current = 0
          }
          break
        }
      }

      // — Vertical —
      prevPyRef.current = npy
      vyRef.current = Math.min(vyRef.current + GRAVITY, MAX_FALL)
      npy += vyRef.current
      groundedRef.current = false

      if (vyRef.current >= 0) {
        const bottomY    = npy + PLAYER_H
        const prevBottom = prevPyRef.current + PLAYER_H
        for (const cx of [npx + 2, npx + PLAYER_W - 2]) {
          const col  = Math.floor(cx / TILE)
          const row  = Math.floor(bottomY / TILE)
          const name = getFg(grid, row, col)
          const tTop = row * TILE
          if (!SOLID.has(name) && !(PLATFORM.has(name) && prevBottom <= tTop)) continue
          if (INSTAKILL.has(name)) {
            triggerDeath(); setTick(t => t+1); raf = requestAnimationFrame(loop); return
          }
          if (LAVA_SET.has(name)) {
            // Land on lava: bounce up + damage
            const died = applyLavaDamage()
            const kbDir = (npx + PLAYER_W / 2) < (col * TILE + TILE / 2) ? -1 : 1
            vxRef.current = kbDir * LAVA_KBX
            vyRef.current = -LAVA_KBY
            groundedRef.current = false
            if (died) { triggerDeath(); setTick(t => t+1); raf = requestAnimationFrame(loop); return }
          } else {
            npy = tTop - PLAYER_H
            vyRef.current = 0
            groundedRef.current = true
            airJumpsRef.current = 0
          }
          break
        }
      } else {
        const topY = npy
        for (const cx of [npx + 2, npx + PLAYER_W - 2]) {
          const name = getFg(grid, Math.floor(topY / TILE), Math.floor(cx / TILE))
          if (!SOLID.has(name) || INSTAKILL.has(name) || LAVA_SET.has(name)) continue
          // Clamp position to ceiling but let vy drain naturally — player "hugs" ceiling
          npy = (Math.floor(topY / TILE) + 1) * TILE
          break
        }
      }

      if (npy + PLAYER_H > ROWS * TILE) {
        triggerDeath(); setTick(t => t+1); raf = requestAnimationFrame(loop); return
      }

      pxRef.current = npx
      pyRef.current = npy

      // — Overlap scan: checkpoints only (lava is solid, handled above) —
      const tr = Math.max(0,       Math.floor(npy / TILE))
      const br = Math.min(ROWS-1,  Math.floor((npy + PLAYER_H) / TILE))
      const lc = Math.max(0,       Math.floor(npx / TILE))
      const rc = Math.min(COLS-1,  Math.floor((npx + PLAYER_W - 1) / TILE))

      for (let r = tr; r <= br; r++) {
        for (let c = lc; c <= rc; c++) {
          const key  = `${r},${c}`
          if (removedRef.current.has(key)) continue
          const name = getFg(grid, r, c)
          if (name === CHECKPOINT && !litRef.current.has(key)) {
            litRef.current = new Set([...litRef.current, key])
            curSpawnRef.current = { px: c * TILE + (TILE - PLAYER_W) / 2, py: r * TILE - PLAYER_H }
            setLitChecks(new Set(litRef.current))
            playSfx('/sounds/achievement.wav', { volume: 0.5 })
          }
        }
      }

      // Sign tooltip
      let nearMsg = null
      for (const s of signsRef.current) {
        if (npx + PLAYER_W > s.c * TILE && npx < (s.c + 1) * TILE) { nearMsg = s.text; break }
      }
      setSignText(nearMsg)

      setTick(t => t + 1)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [scene, respawn])

  // ---- Render ----
  if (loading) return (
    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'#1a0d2e', color:'#ccc', fontSize:20 }}>
      Se încarcă parcursul…
    </div>
  )

  const grid  = scene.grid
  const ROWS  = grid.length
  const COLS  = grid[0]?.length ?? 0
  const DT    = TILE * tileScale   // display tile size
  const viewW = window.innerWidth
  const viewH = window.innerHeight

  // Camera in display space
  const dispPX = pxRef.current * tileScale
  const dispPY = pyRef.current * tileScale
  const dispPW = PLAYER_W * tileScale
  const dispPH = PLAYER_H * tileScale
  const camX   = Math.max(0, Math.min(dispPX + dispPW/2 - viewW/2, COLS*DT - viewW))
  const camY   = Math.max(0, Math.min(dispPY + dispPH/2 - viewH/2, ROWS*DT - viewH))
  camRef.current = { x: camX, y: camY }
  window.__gCam = { x: camX, y: camY, dt: DT }

  const sc = Math.max(0,       Math.floor(camX / DT))
  const ec = Math.min(COLS-1,  Math.ceil((camX + viewW) / DT))
  const sr = Math.max(0,       Math.floor(camY / DT))
  const er = Math.min(ROWS-1,  Math.ceil((camY + viewH) / DT))

  const tileEls = []
  for (let r = sr; r <= er; r++) {
    for (let c = sc; c <= ec; c++) {
      const cell = grid[r][c]
      if (!cell) continue
      const { fg, bg } = cell

      if (bg) tileEls.push(
        <div key={`b${r}-${c}`} style={{ position:'absolute', left:c*DT, top:r*DT, width:DT, height:DT, ...tileStyle(bg, nbrs(grid,r,c,'bg',bg), DT) }} />
      )
      if (fg && !removedRef.current.has(`${r},${c}`)) {
        const isLit  = fg === CHECKPOINT && litRef.current.has(`${r},${c}`)
        const isSeed = fg.endsWith('_seed.png')
        tileEls.push(
          <div key={`f${r}-${c}`} style={{
            position:'absolute', left:c*DT, top:r*DT, width:DT, height:DT,
            filter: isLit ? 'brightness(2) drop-shadow(0 0 8px #ffff44)' : undefined,
          }}>
            {isSeed
              ? <div style={{ position:'absolute', left:'25%', top:'25%', width:'50%', height:'50%', animation:'seedBob 2s ease-in-out infinite', boxShadow:'-2px 2px 0 rgba(0,0,0,0.5)', ...tileStyle(fg, nbrs(grid,r,c,'fg',fg), DT * 0.5) }} />
              : <div style={{ position:'absolute', inset:0, ...tileStyle(fg, nbrs(grid,r,c,'fg',fg), DT) }} />
            }
          </div>
        )
      }
    }
  }

  // Red flash on lava hit (flash red when in iframes)
  const lavHit = ifrRef.current > 0 && ifrRef.current % 6 < 3
  const flip   = facingRef.current === 'left' ? -1 : 1
  const spriteDispH = DT

  // Sign tooltip in screen space
  let signEl = null
  if (signText) {
    const px = pxRef.current
    for (const s of signsRef.current) {
      if (px + PLAYER_W > s.c * TILE && px < (s.c + 1) * TILE) {
        signEl = (
          <div style={{
            position:'fixed',
            left: s.c * DT - camX + DT / 2,
            top:  s.r * DT - camY - 48,
            transform:'translateX(-50%)',
            background:'#223a42', color:'#fff', border:'2px solid #aee2f7',
            padding:'6px 14px', borderRadius:4, fontSize:18, fontWeight:'bold',
            whiteSpace:'nowrap', zIndex:50, pointerEvents:'none',
            boxShadow:'0 2px 8px rgba(0,0,0,0.5)',
            textShadow:'1px 1px 0 #000, -1px 1px 0 #000',
          }}>
            {signText}
          </div>
        )
        break
      }
    }
  }

  return (
    <div ref={outerRef} style={{ position:'absolute', inset:0, overflow:'hidden' }}>
      {/* Sky */}
      <div style={{ position:'absolute', inset:0, backgroundImage:`url(/weather/${scene.weather}.png)`, backgroundSize:'cover', backgroundPosition:'center', imageRendering:'pixelated' }} />

      {/* World */}
      <div style={{ position:'absolute', top:0, left:0, transform:`translate(${-camX}px,${-camY}px)`, willChange:'transform' }}>
        {tileEls}

        {/* Name label — hidden while dying */}
        {!dying && (
          <div style={{
            position:'absolute',
            left: dispPX + dispPW / 2,
            top:  dispPY + dispPH - spriteDispH - 20,
            transform:'translateX(-50%)',
            whiteSpace:'nowrap', pointerEvents:'none', zIndex:21,
          }}>
            <span className="legend-name" style={{ fontSize: 12 }}>Carlita of Legend</span>
          </div>
        )}

        {/* Sprite — bottom anchored to hitbox bottom */}
        <div style={{
          position:'absolute',
          left: dispPX + dispPW / 2,
          top:  dispPY + dispPH,
          transform:`translateX(-50%) translateY(-100%) scaleX(${flip})`,
          transformOrigin:'bottom center',
          pointerEvents:'none', zIndex:20,
        }}>
          {/* Relative wrapper so soul can overlay the sprite */}
          <div style={{ position:'relative', display:'inline-block' }}>
            <img
              src="/sprites/carlita.png"
              alt="Carlita"
              draggable={false}
              className="pixel"
              style={{
                height: spriteDispH, width:'auto', maxWidth:'none', display:'block',
                filter: dying ? 'drop-shadow(-2px 2px 0 rgba(0,0,0,0.5))' : (lavHit ? 'brightness(3) sepia(1) saturate(20) hue-rotate(315deg)' : 'drop-shadow(-2px 2px 0 rgba(0,0,0,0.5))'),
                animation: dying ? 'playerDie 0.6s ease-in forwards' : undefined,
              }}
            />
            {/* Soul — white ghost that rises and fades on death */}
            {dying && (
              <img
                key={deathAnimKey}
                src="/sprites/carlita.png"
                draggable={false}
                className="pixel"
                style={{
                  position:'absolute', top:0, left:0,
                  height: spriteDispH, width:'auto', maxWidth:'none', display:'block',
                  filter: 'brightness(8) saturate(0) blur(1px)',
                  animation: 'soulRise 0.6s ease-out forwards',
                  pointerEvents:'none',
                }}
              />
            )}
          </div>
        </div>
        {/* Wizard NPC — stands at col 58, ground row 14 */}
        <div style={{ position:'absolute', left: 58*DT + DT/2, top: 14*DT - spriteDispH - 20, transform:'translateX(-50%)', whiteSpace:'nowrap', pointerEvents:'none', zIndex:21 }}>
          <span style={{ fontSize: 11, color: '#c090ff', fontWeight: 700, textShadow: '1px 1px 0 #000,-1px 1px 0 #000', fontFamily: '"Century Gothic",sans-serif' }}>XxRapeWizardxX</span>
        </div>
        <div style={{ position:'absolute', left: 58*DT + DT/2, top: 14*DT, transform:'translateX(-50%) translateY(-100%) scaleX(-1)', pointerEvents:'none', zIndex:20 }}>
          <img src="/sprites/blocks/all/legendary_wizard.png" alt="" className="pixel" style={{ height: spriteDispH, width:'auto', maxWidth:'none', display:'block', filter:'drop-shadow(-2px 2px 0 rgba(0,0,0,0.5))' }} />
        </div>
      </div>

      {signEl}

      {/* Orb in inventory */}
      {hasOrb && (
        <div style={{ position:'fixed', top:16, right:16, background:'rgba(0,0,0,0.7)', color:'#ffd700', padding:'5px 12px', borderRadius:8, fontSize:13, fontWeight:'bold', zIndex:100, border:'1px solid #ffd700' }}>
          🌱 Sămânța Legendară
        </div>
      )}

      {/* Orb message */}
      {showOrbMsg && (
        <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.7)', zIndex:200 }}>
          <div style={{ background:'#13132a', border:'2px solid #ffd700', borderRadius:10, padding:'28px 36px', maxWidth:420, textAlign:'center', boxShadow:'0 0 48px rgba(255,215,0,0.25)' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🏆</div>
            <div style={{ color:'#ffe', fontSize:15, lineHeight:1.75, whiteSpace:'pre-line', marginBottom:22 }}>
              {ORB_MSG}
            </div>
            <button
              onClick={() => { setShowOrbMsg(false); onComplete?.() }}
              style={{ padding:'10px 28px', fontSize:15, fontWeight:'bold', cursor:'pointer', background:'#ffd700', color:'#1a0d2e', border:'none', borderRadius:6 }}
            >
              Continuă →
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ position:'fixed', bottom:16, left:'50%', transform:'translateX(-50%)', background:'rgba(0,0,0,0.5)', color:'#ccc', padding:'4px 12px', borderRadius:6, fontSize:12, zIndex:100, pointerEvents:'none' }}>
        ← → / A D — mișcare &nbsp;|&nbsp; Space — sărit &nbsp;|&nbsp; E — lovit &nbsp;|&nbsp; Scroll — zoom &nbsp;|&nbsp; ESC — meniu
      </div>

      <GameMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        masterVolume={masterVolume}
        setMasterVolume={setMasterVolume}
        onExit={onMenu}
        onRespawn={respawn}
      />
    </div>
  )
}
