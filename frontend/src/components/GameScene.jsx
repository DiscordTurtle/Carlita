import React, { useEffect, useMemo, useRef, useState } from 'react'
import Character from './Character.jsx'
import Tree from './Tree.jsx'
import Seed from './Seed.jsx'
import DroppedLetter from './DroppedLetter.jsx'
import Fireworks from './Fireworks.jsx'
import SpeechBubble from './SpeechBubble.jsx'
import LetterModal from './LetterModal.jsx'
import ActionMenu from './ActionMenu.jsx'
import GameMenu from './GameMenu.jsx'
import { playSfx, setMasterVolume as setAudioMasterVolume } from '../useAudio.js'

const WORLD = {
  groundY:   120,
  walkSpeed: 4.2,
  jumpVel:   13,   // initial upward velocity (px/frame)
  gravity:   0.6,  // px/frame^2
  maxJump:   220
}

// Layout positions are computed from window width so the scene actually spans
// the screen instead of clumping on the left.
function computeLayout(w) {
  return {
    width:         w,
    carlitaStartX: Math.round(w * 0.10),
    treeX:         Math.round(w * 0.50),
    cristianX:     Math.round(w * 0.90),
    minX:          60,
    maxX:          w - 60
  }
}

const STAGE = {
  WALK_TO_TREE:   'walk_to_tree',   // initial; Carlita has the seed
  PUNCH:          'punch',          // seed planted; tree shows the letter
  COLLECT_LETTER: 'collect_letter', // tree punched; letter dropped in world
  HAS_LETTER:     'has_letter',     // letter is in inventory; not yet opened
  LETTER_OPEN:    'letter_open'     // modal open with fireworks
}

// Display names for the tree at each stage. Shown in a tooltip when Carlita
// is standing close to it.
const TREE_NAME = {
  [STAGE.WALK_TO_TREE]: 'Wishing Tree',
  [STAGE.PUNCH]:        'Love Letter Tree',
  [STAGE.COLLECT_LETTER]: null,    // tree is broken at this point
  [STAGE.HAS_LETTER]:     null,
  [STAGE.LETTER_OPEN]:    null
}

export default function GameScene() {
  const [layout, setLayout] = useState(() =>
    computeLayout(typeof window !== 'undefined' ? window.innerWidth : 1280))

  // Clouds drifting continuously across the sky. Each one has a random
  // direction (left or right) and a random speed. Negative animation-delays
  // distribute their phases so they're already spread across the viewport
  // on the very first frame.
  const clouds = useMemo(() => {
    const count = 12
    return Array.from({ length: count }).map((_, i) => {
      // Speed: 22s (fast) to 95s (slow), well distributed
      const duration = 22 + ((i * 19) % 73)
      // Half go right (normal), half go left (reverse)
      const direction = i % 2 === 0 ? 'normal' : 'reverse'
      const delay = -(duration * ((i * 17) % 100) / 100)
      return {
        id: i,
        topPct:  4 + (i * 7 + (i % 3) * 5) % 50,   // top half of sky
        width:   110 + ((i * 53) % 5) * 40,        // 110 / 150 / 190 / 230 / 270
        opacity: 0.5 + ((i * 13) % 50) / 100,
        duration,
        direction,
        delay
      }
    })
  }, [])

  const [carlitaX, setCarlitaX] = useState(layout.carlitaStartX)
  const [carlitaY, setCarlitaY] = useState(0)        // height above ground
  const [facing,   setFacing]   = useState('right')
  const [walking,  setWalking]  = useState(false)
  const [hasSeed,    setHasSeed]    = useState(true)
  const [hasLetter,  setHasLetter]  = useState(false)
  const [stage,      setStage]      = useState(STAGE.WALK_TO_TREE)
  const [showLetterModal, setShowLetterModal] = useState(false)
  const [showFireworks,   setShowFireworks]   = useState(false)
  const [showLove,        setShowLove]        = useState(false)
  const [punchSwing,      setPunchSwing]      = useState(false)
  const [punchOffset,     setPunchOffset]     = useState(0)
  const [masterVolume,    setMasterVolume]    = useState(1)
  const [selectedSlot,    setSelectedSlot]    = useState('seed')
  const [showTreeName,    setShowTreeName]    = useState(false)
  const [menuOpen,        setMenuOpen]        = useState(false)

  // refs for game loop
  const keys       = useRef({ left: false, right: false })
  const vy         = useRef(0)
  const yRef       = useRef(0)
  const xRef       = useRef(layout.carlitaStartX)
  const stageRef   = useRef(stage)
  const seedRef    = useRef(hasSeed)
  const slotRef    = useRef(selectedSlot)
  const lastStep   = useRef(0)
  const layoutRef  = useRef(layout)
  const punchRaf   = useRef(null)

  useEffect(() => { stageRef.current  = stage }, [stage])
  useEffect(() => { seedRef.current   = hasSeed }, [hasSeed])
  useEffect(() => { slotRef.current   = selectedSlot }, [selectedSlot])
  useEffect(() => { layoutRef.current = layout }, [layout])
  useEffect(() => { setAudioMasterVolume(masterVolume) }, [masterVolume])

  // Resize handler — recompute layout (and clamp Carlita) on viewport changes.
  useEffect(() => {
    const onResize = () => {
      const next = computeLayout(window.innerWidth)
      setLayout(next)
      const clamped = Math.max(next.minX, Math.min(next.maxX, xRef.current))
      xRef.current = clamped
      setCarlitaX(clamped)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // ESC to open menu (only when menu is closed)
  useEffect(() => {
    if (menuOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setMenuOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  // Drop selection back to "punch" when whatever is selected goes away.
  useEffect(() => {
    if (selectedSlot === 'seed'   && !hasSeed)   setSelectedSlot('punch')
    if (selectedSlot === 'letter' && !hasLetter) setSelectedSlot('punch')
  }, [hasSeed, hasLetter, selectedSlot])

  // ---------- Keyboard ----------
  useEffect(() => {
    const isLeft  = (e) => e.code === 'ArrowLeft'  || e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A'
    const isRight = (e) => e.code === 'ArrowRight' || e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D'
    const isJump  = (e) => e.code === 'Space'      || e.key === ' '          || e.key === 'Spacebar'

    const down = (e) => {
      if (isLeft(e))  { keys.current.left  = true;  e.preventDefault() }
      if (isRight(e)) { keys.current.right = true;  e.preventDefault() }
      if (isJump(e))  { e.preventDefault(); if (!e.repeat) tryJump() }
    }
    const up = (e) => {
      if (isLeft(e))  keys.current.left  = false
      if (isRight(e)) keys.current.right = false
    }
    const releaseAll = () => { keys.current.left = false; keys.current.right = false }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup',   up)
    window.addEventListener('blur',    releaseAll)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup',   up)
      window.removeEventListener('blur',    releaseAll)
    }
  }, [])

  function tryJump() {
    if (yRef.current <= 0.001) {
      vy.current = WORLD.jumpVel
      playSfx('/sounds/jump.wav', { volume: 0.7 })
    }
  }

  // ---------- Game loop ----------
  useEffect(() => {
    let raf
    const tick = () => {
      const L = layoutRef.current
      // horizontal
      let nx = xRef.current
      let moved = false
      if (keys.current.left)  { nx -= WORLD.walkSpeed; setFacing('left');  moved = true }
      if (keys.current.right) { nx += WORLD.walkSpeed; setFacing('right'); moved = true }
      nx = Math.max(L.minX, Math.min(L.maxX, nx))
      xRef.current = nx
      setCarlitaX(nx)

      // vertical (gravity + jump)
      let ny = yRef.current + vy.current
      vy.current -= WORLD.gravity
      if (ny < 0) { ny = 0; vy.current = 0 }
      if (ny > WORLD.maxJump) { ny = WORLD.maxJump; vy.current = 0 }
      yRef.current = ny
      setCarlitaY(ny)

      // collision: walking onto Cristian → "Te iubesc"
      setShowLove(Math.abs(nx - L.cristianX) < 60)

      // proximity: show the tree's name tag while Carlita stands near it
      setShowTreeName(Math.abs(nx - L.treeX) < 110)

      // stage progression: walking over the dropped letter picks it up into
      // the inventory. The modal opens later, when she selects it.
      if (stageRef.current === STAGE.COLLECT_LETTER &&
          Math.abs(nx - L.treeX) < 60) {
        pickUpLetter()
      }

      // step sounds (only when grounded + moving)
      if (moved && ny <= 0.5 && performance.now() - lastStep.current > 260) {
        playSfx('/sounds/step.wav', { volume: 0.18, rate: 1.3 + Math.random() * 0.2 })
        lastStep.current = performance.now()
      }
      // walking flag — only on the ground
      setWalking(moved && ny <= 0.5)

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  function nearTree() {
    return Math.abs(xRef.current - layoutRef.current.treeX) < 110
  }
  function nearCristian() {
    return Math.abs(xRef.current - layoutRef.current.cristianX) < 90
  }

  // ---------- Click to act ----------
  function handleWorldClick() {
    const slot = slotRef.current
    if (slot === 'seed') {
      tryPlant()
    } else if (slot === 'punch') {
      tryPunch()
    } else if (slot === 'letter') {
      openLetter()
    }
  }

  function tryPlant() {
    if (stageRef.current !== STAGE.WALK_TO_TREE) {
      playSfx('/sounds/blip.wav', { volume: 0.4 })
      return
    }
    if (!seedRef.current || !nearTree()) {
      playSfx('/sounds/blip.wav', { volume: 0.4 })
      return
    }
    setHasSeed(false)
    setStage(STAGE.PUNCH)
    playSfx('/sounds/tree-splice.mp3', { volume: 0.8 })
  }

  function animatePunchOffset(targetX) {
    if (punchRaf.current) cancelAnimationFrame(punchRaf.current)

    const startX = xRef.current
    const distance = Math.min(70, Math.abs(targetX - startX))
    const direction = targetX >= startX ? 1 : -1
    const startTime = performance.now()
    const duration = 220

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const offset = direction * Math.round(distance * eased)
      setPunchOffset(offset)

      if (progress < 1) {
        punchRaf.current = requestAnimationFrame(tick)
      } else {
        setPunchOffset(0)
        punchRaf.current = null
      }
    }

    punchRaf.current = requestAnimationFrame(tick)
  }

  function tryPunch() {
    const targetX = nearCristian()
      ? layoutRef.current.cristianX
      : (nearTree() && stageRef.current === STAGE.PUNCH ? layoutRef.current.treeX : null)

    // play swing animation regardless, but only progress if conditions met
    setPunchSwing(true)
    setTimeout(() => setPunchSwing(false), 220)

    if (targetX !== null) {
      setFacing(targetX < xRef.current ? 'left' : 'right')
      animatePunchOffset(targetX)
    } else {
      setPunchOffset(0)
    }

    // Pick the punch SFX based on what (if anything) Carlita is hitting:
    //   - Cristian within range          → punch-hit
    //   - the Love Letter tree (STAGE.PUNCH) → tree-harvest (the "break" sfx)
    //   - anything else (incl. the Wishing Tree, which shouldn't break)
    //                                    → punch-miss
    if (nearCristian()) {
      playSfx('/sounds/punch-hit.wav', { volume: 0.8 })
    } else if (nearTree() && stageRef.current === STAGE.PUNCH) {
      playSfx('/sounds/tree-harvest.wav', { volume: 0.8 })
    } else {
      playSfx('/sounds/punch-miss.wav', { volume: 0.8 })
    }

    if (stageRef.current === STAGE.PUNCH && nearTree()) {
      setStage(STAGE.COLLECT_LETTER)
    }
  }

  // Walk-over pickup: stash the letter in the inventory; nothing visual yet.
  function pickUpLetter() {
    if (stageRef.current !== STAGE.COLLECT_LETTER) return
    setStage(STAGE.HAS_LETTER)
    setHasLetter(true)
    setSelectedSlot('letter')   // auto-highlight the new item, like Growtopia
    playSfx('/sounds/achievement.wav', { volume: 0.7 })
  }

  // Selecting/clicking the letter slot from the inventory plays the fireworks
  // and opens the letter modal — the original "walked-over" experience.
  function openLetter() {
    if (stageRef.current === STAGE.LETTER_OPEN) return
    setStage(STAGE.LETTER_OPEN)
    setShowFireworks(true)
    playSfx('/sounds/firework.wav',  { volume: 0.7 })
    setTimeout(() => playSfx('/sounds/firework2.wav', { volume: 0.7 }), 350)
    setTimeout(() => playSfx('/sounds/firework.wav',  { volume: 0.6 }), 750)
    setTimeout(() => setShowLetterModal(true), 900)
  }

  // Selecting an inventory slot just picks it; the actual "use" happens when
  // Carlita clicks the world while holding the item.
  function handleSelectSlot(id) {
    setSelectedSlot(id)
  }

  const treeStage =
    stage === STAGE.WALK_TO_TREE ? 'tree' :
    stage === STAGE.PUNCH        ? 'letter-tree' :
                                   'punched'

  // Dropped letter is only visible while it's lying on the ground. Once
  // Carlita picks it up (HAS_LETTER) the world copy disappears.
  const showLetterDrop = stage === STAGE.COLLECT_LETTER

  const treeName = TREE_NAME[stage]

  return (
    <div
      className="absolute inset-0 overflow-hidden cursor-crosshair"
      onClick={handleWorldClick}
    >
      {/* Background — empty mountains/sky, sun & clouds added on top */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/sprites/bg-empty.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          imageRendering: 'pixelated'
        }}
      />
      {/* sunflower-yellow tint */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'linear-gradient(180deg, rgba(255,243,196,.30), rgba(247,201,72,.18) 60%, rgba(222,145,29,.28))' }} />

      {/* Sun — top-right corner, behind the clouds */}
      <img src="/sprites/sun.png" alt=""
           draggable={false}
           className="absolute pixel animate-sun-glow"
           style={{ top: 24, right: 36, width: 200, zIndex: 1 }} />

      {/* Drifting clouds — in front of the sun, flying continuously L/R at varied speeds */}
      {clouds.map(c => (
        <img
          key={c.id}
          src="/sprites/clouds.png"
          alt=""
          draggable={false}
          className="absolute pixel pointer-events-none"
          style={{
            top:    `${c.topPct}%`,
            left:   0,
            width:  c.width,
            opacity: c.opacity,
            animation: `cloudFly ${c.duration}s linear ${c.delay}s infinite ${c.direction}`,
            zIndex: 2
          }}
        />
      ))}

      {/* Menu button — top right corner */}
      <button
        onClick={() => setMenuOpen(true)}
        className="fixed top-4 right-4 z-40 transition-all hover:scale-110 active:scale-95"
        style={{
          width: 36,
          height: 32,
          background: '#e8f4f8',
          border: '2px solid #7cc4e8',
          borderRadius: '3px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          padding: 0,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          overflow: 'hidden',
          position: 'fixed'
        }}
        title="Menu (ESC)"
      >
        {/* Folded corner effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderTop: '8px solid #d0e8f2',
          borderRight: '0px solid transparent',
          borderBottom: '0px solid transparent'
        }} />
        
        {/* Three horizontal lines */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          gap: '3px',
          padding: '2px 1px 0px 1px',
          width: '100%',
          height: '100%'
        }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <div style={{
                width: '4px',
                height: '2px',
                background: '#5fa8d3',
                borderRadius: '0.5px',
                flexShrink: 0
              }} />
              <div style={{
                width: '20px',
                height: '2px',
                background: '#5fa8d3',
                borderRadius: '0.5px'
              }} />
            </div>
          ))}
        </div>
      </button>

      {/* World */}
      <div className="absolute inset-0">
        {/* ground strip */}
        <div className="dirt-tile absolute left-0 right-0 bottom-0" style={{ height: WORLD.groundY }} />

        {/* Tree */}
        <Tree x={layout.treeX} stage={treeStage} />

        {/* Tree name tooltip — appears when Carlita stands near it */}
        {treeName && showTreeName && (
          <TreeNameTag x={layout.treeX} name={treeName} />
        )}

        {/* Dropped letter */}
        {showLetterDrop && <DroppedLetter x={layout.treeX} />}

        {/* Cristian (right, facing left, idle) */}
        <Character
          src="/sprites/cristian.png"
          name="Cristian of Legend"
x={layout.cristianX}
          facing="left"
          walking={false}
        />

        {/* Carlita (controlled, can jump) */}
        <Character
          src="/sprites/carlita.png"
          name="Carlita of Legend"
x={carlitaX}
          y={carlitaY}
          facing={facing}
          walking={walking}
          punching={punchSwing && slotRef.current === 'punch'}
          punchOffset={punchOffset}
          holding={hasSeed && selectedSlot === 'seed' ? <Seed size={26} /> : null}
        />

        {/* Te iubesc speech bubble */}
        {showLove && <SpeechBubble x={layout.cristianX} text="Te iubesc ♥" />}
      </div>

      {/* Action menu (Growtopia-style hotbar) */}
      <ActionMenu
        selected={selectedSlot}
        onSelect={handleSelectSlot}
        hasSeed={hasSeed}
        hasLetter={hasLetter}
      />

      {/* Fireworks layer */}
      {showFireworks && <Fireworks count={22} />}

      {/* Letter modal */}
      {showLetterModal && (
        <LetterModal onClose={() => { setShowFireworks(false); setShowLetterModal(false) }} />
      )}

      {/* Menu */}
      <GameMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        masterVolume={masterVolume}
        setMasterVolume={setMasterVolume}
      />
    </div>
  )
}

// Floating tooltip above the tree showing its current name.
// Outer wrapper owns the absolute positioning + centering; the inner
// wrapper plays the pop animation. They're separated so the pop's
// `transform: scale(...)` keyframes can't override `translateX(-50%)`.
function TreeNameTag({ x, name }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x,
        bottom: 280,
        transform: 'translateX(-50%)',
        zIndex: 25
      }}
    >
      <div className="animate-pop">
        <div
          className="px-3 py-1 rounded text-white text-sm font-extrabold tracking-wide whitespace-nowrap"
          style={{
            background: '#223a42',
            border: '2px solid #aee2f7',
            boxShadow: '0 3px 0 rgba(0,0,0,.45), 0 6px 12px rgba(0,0,0,.3)',
            textShadow: '1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000'
          }}
        >
          {name}
        </div>
      </div>
    </div>
  )
}
