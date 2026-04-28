import React, { useEffect, useRef, useState } from 'react'
import Character from './Character.jsx'
import Tree from './Tree.jsx'
import Sign from './Sign.jsx'
import Seed from './Seed.jsx'
import DroppedLetter from './DroppedLetter.jsx'
import Fireworks from './Fireworks.jsx'
import SpeechBubble from './SpeechBubble.jsx'
import LetterModal from './LetterModal.jsx'
import ActionMenu from './ActionMenu.jsx'
import { playSfx } from '../useAudio.js'

const WORLD = {
  carlitaStartX: 180,
  cristianX:     920,
  treeX:         560,
  groundY:       120,
  walkSpeed:     3.6,
  minX:          80,
  maxX:          1080,
  jumpVel:       12,   // initial upward velocity (px/frame)
  gravity:       0.55, // px/frame^2
  maxJump:       180   // sanity cap
}

const STAGE = {
  WALK_TO_TREE:   'walk_to_tree',
  PLANT:          'plant',
  PUNCH:          'punch',
  COLLECT_LETTER: 'collect_letter',
  LETTER_OPEN:    'letter_open'
}

export default function GameScene() {
  const [carlitaX, setCarlitaX] = useState(WORLD.carlitaStartX)
  const [carlitaY, setCarlitaY] = useState(0)        // height above ground
  const [facing,   setFacing]   = useState('right')
  const [walking,  setWalking]  = useState(false)
  const [hasSeed,  setHasSeed]  = useState(true)
  const [stage,    setStage]    = useState(STAGE.WALK_TO_TREE)
  const [showLetterModal, setShowLetterModal] = useState(false)
  const [showFireworks,   setShowFireworks]   = useState(false)
  const [showLove,        setShowLove]        = useState(false)
  const [punchSwing,      setPunchSwing]      = useState(false)
  const [selectedSlot,    setSelectedSlot]    = useState('seed')

  // refs for game loop
  const keys      = useRef({ left: false, right: false })
  const vy        = useRef(0)
  const yRef      = useRef(0)
  const xRef      = useRef(WORLD.carlitaStartX)
  const stageRef  = useRef(stage)
  const seedRef   = useRef(hasSeed)
  const slotRef   = useRef(selectedSlot)
  const lastStep  = useRef(0)

  useEffect(() => { stageRef.current = stage }, [stage])
  useEffect(() => { seedRef.current  = hasSeed }, [hasSeed])
  useEffect(() => { slotRef.current  = selectedSlot }, [selectedSlot])

  // keep the seed slot from being "selected" once spent
  useEffect(() => {
    if (!hasSeed && selectedSlot === 'seed') setSelectedSlot('punch')
  }, [hasSeed, selectedSlot])

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
      playSfx('/sounds/blip.wav', { volume: 0.45, rate: 1.4 })
    }
  }

  // ---------- Game loop ----------
  useEffect(() => {
    let raf
    const tick = () => {
      // horizontal
      let nx = xRef.current
      let moved = false
      if (keys.current.left)  { nx -= WORLD.walkSpeed; setFacing('left');  moved = true }
      if (keys.current.right) { nx += WORLD.walkSpeed; setFacing('right'); moved = true }
      nx = Math.max(WORLD.minX, Math.min(WORLD.maxX, nx))
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
      setShowLove(Math.abs(nx - WORLD.cristianX) < 50)

      // stage progression: walking over the dropped letter
      if (stageRef.current === STAGE.COLLECT_LETTER &&
          Math.abs(nx - WORLD.treeX) < 50) {
        triggerLetter()
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
    return Math.abs(xRef.current - WORLD.treeX) < 90
  }

  // ---------- Click to act ----------
  function handleWorldClick() {
    const slot = slotRef.current
    if (slot === 'seed') {
      tryPlant()
    } else if (slot === 'punch') {
      tryPunch()
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
    playSfx('/sounds/achievement.wav', { volume: 0.7 })
  }

  function tryPunch() {
    // play swing animation regardless, but only progress if conditions met
    setPunchSwing(true)
    setTimeout(() => setPunchSwing(false), 220)
    playSfx('/sounds/punch.wav', { volume: 0.8 })

    if (stageRef.current === STAGE.PUNCH && nearTree()) {
      setStage(STAGE.COLLECT_LETTER)
    }
  }

  function triggerLetter() {
    if (stageRef.current === STAGE.LETTER_OPEN) return
    setStage(STAGE.LETTER_OPEN)
    setShowFireworks(true)
    playSfx('/sounds/firework.wav',  { volume: 0.7 })
    setTimeout(() => playSfx('/sounds/firework2.wav', { volume: 0.7 }), 350)
    setTimeout(() => playSfx('/sounds/firework.wav',  { volume: 0.6 }), 750)
    setTimeout(() => setShowLetterModal(true), 900)
  }

  // ---------- Hint banner ----------
  const hint =
    stage === STAGE.WALK_TO_TREE
      ? 'Walk to the tree → select the SEED → click on the world to plant'
    : stage === STAGE.PUNCH
      ? 'Now select the FIST → click to punch the tree'
    : stage === STAGE.COLLECT_LETTER
      ? 'Walk over the letter ♥'
    : '♥'

  const treeStage =
    stage === STAGE.WALK_TO_TREE ? 'tree' :
    stage === STAGE.PUNCH        ? 'letter-tree' :
                                   'punched'

  const showLetterDrop = stage === STAGE.COLLECT_LETTER || stage === STAGE.LETTER_OPEN

  return (
    <div
      className="absolute inset-0 overflow-hidden cursor-crosshair"
      onClick={handleWorldClick}
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/sprites/bg-sunny.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          imageRendering: 'pixelated',
          filter: 'saturate(1.05) brightness(1.05) hue-rotate(-8deg)'
        }}
      />
      {/* sunflower-yellow tint */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'linear-gradient(180deg, rgba(255,243,196,.35), rgba(247,201,72,.25) 60%, rgba(222,145,29,.35))' }} />

      {/* Sun */}
      <img src="/sprites/sun.png" alt=""
           className="absolute pixel animate-sun-glow"
           style={{ top: 24, right: 36, width: 130 }} />

      {/* World */}
      <div className="absolute inset-0">
        {/* ground strip */}
        <div className="dirt-tile absolute left-0 right-0 bottom-0" style={{ height: WORLD.groundY }} />

        {/* Signs */}
        {stage === STAGE.WALK_TO_TREE && (
          <Sign x={WORLD.carlitaStartX + 60} y={WORLD.groundY + 110}>
            {'Walk to the tree →\nSelect the seed and click'}
          </Sign>
        )}
        {stage === STAGE.PUNCH && (
          <Sign x={WORLD.treeX} y={WORLD.groundY + 230}>
            {'Switch to the FIST\nthen click the world'}
          </Sign>
        )}
        {stage === STAGE.COLLECT_LETTER && (
          <Sign x={WORLD.treeX} y={WORLD.groundY + 230}>
            {'Walk over the letter ♥'}
          </Sign>
        )}

        {/* Tree */}
        <Tree x={WORLD.treeX} stage={treeStage} />

        {/* Dropped letter */}
        {showLetterDrop && <DroppedLetter x={WORLD.treeX} />}

        {/* Cristian (right, facing left, idle) */}
        <Character
          src="/sprites/cristian.png"
          name="Cristian"
          flag="❤"
          x={WORLD.cristianX}
          facing="left"
          walking={false}
        />

        {/* Carlita (controlled, can jump) */}
        <Character
          src="/sprites/carlita.png"
          name="Carlita"
          flag="❤"
          x={carlitaX}
          y={carlitaY}
          facing={facing}
          walking={walking}
          punching={punchSwing && slotRef.current === 'punch'}
          holding={hasSeed && selectedSlot === 'seed' ? <Seed size={26} /> : null}
        />

        {/* Te iubesc speech bubble */}
        {showLove && <SpeechBubble x={WORLD.cristianX} text="Te iubesc ♥" />}
      </div>

      {/* HUD: hint banner */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 gt-panel px-4 py-2 max-w-[520px] text-center">
        <div className="text-[#3A1F0C] text-sm font-bold whitespace-pre-line">
          {hint}
        </div>
      </div>

      {/* Action menu (Growtopia-style hotbar) */}
      <ActionMenu
        selected={selectedSlot}
        onSelect={setSelectedSlot}
        hasSeed={hasSeed}
      />

      {/* Controls overlay */}
      <div className="absolute bottom-3 right-3 z-50 gt-panel px-3 py-2 text-[#3A1F0C] text-xs font-bold">
        ← →  walk  ·  SPACE  jump  ·  click  use
      </div>

      {/* Fireworks layer */}
      {showFireworks && <Fireworks count={22} />}

      {/* Letter modal */}
      {showLetterModal && (
        <LetterModal onClose={() => { setShowFireworks(false); setShowLetterModal(false) }} />
      )}
    </div>
  )
}
