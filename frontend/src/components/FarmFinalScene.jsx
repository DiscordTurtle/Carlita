import React, { useEffect, useRef, useState } from 'react'
import GridWorld from './GridWorld.jsx'
import Fireworks from './Fireworks.jsx'
import LetterModal from './LetterModal.jsx'
import ActionMenu from './ActionMenu.jsx'
import { playSfx } from '../useAudio.js'

const TILE          = 32
const TREE_COL      = 50
const TREE_ROW      = 25
const CRIS_COL      = 51
const GROUND_ROW    = 26
const CRIS_H_TILES  = 1.3

const LETTER_DROP_COL    = TREE_COL - 0.6
const ANEMONITE_DROP_COL = TREE_COL + 0.9

export default function FarmFinalScene({ onMenu, onChatMsg, hasSeed = true }) {
  const [treeState,         setTreeState]         = useState('normal')
  const [selectedTool,      setSelectedTool]      = useState(hasSeed ? 'seed' : 'punch')
  const [seedInHand,        setSeedInHand]        = useState(hasSeed)
  const [hasLetter,         setHasLetter]         = useState(false)
  const [hasAnemonite,      setHasAnemonite]      = useState(false)
  const [letterOnGround,    setLetterOnGround]    = useState(false)
  const [anemoniteOnGround, setAnemoniteOnGround] = useState(false)
  const [showFireworks,     setShowFireworks]     = useState(false)
  const [showLetterModal,   setShowLetterModal]   = useState(false)

  const treeStateRef        = useRef('normal')
  const selToolRef          = useRef(hasSeed ? 'seed' : 'punch')
  const doneRef             = useRef(false)
  const letterOnGroundRef   = useRef(false)
  const anemoniteOnGroundRef= useRef(false)

  const crisRef        = useRef(null)
  const treeOverlayRef = useRef(null)
  const letterDropRef  = useRef(null)
  const anemDropRef    = useRef(null)

  // Trigger ending once both items are picked up
  useEffect(() => {
    if (!hasLetter || !hasAnemonite || showFireworks || showLetterModal) return
    playSfx('/sounds/achievement.wav', { volume: 0.7 })
    setShowFireworks(true)
    playSfx('/sounds/firework.wav',  { volume: 0.7 })
    setTimeout(() => playSfx('/sounds/firework2.wav', { volume: 0.7 }), 350)
    setTimeout(() => playSfx('/sounds/firework.wav',  { volume: 0.6 }), 750)
    setTimeout(() => setShowLetterModal(true), 900)
  }, [hasLetter, hasAnemonite])

  // Camera-sync + item pickup RAF
  useEffect(() => {
    let raf
    function tick() {
      const cam    = window.__gCam
      const player = window.__gPlayer
      if (!cam?.dt) { raf = requestAnimationFrame(tick); return }
      const DT = cam.dt

      if (crisRef.current) {
        crisRef.current.style.left = `${CRIS_COL * DT - cam.x}px`
        crisRef.current.style.top  = `${(GROUND_ROW - CRIS_H_TILES) * DT - cam.y}px`
        const img = crisRef.current.querySelector('img')
        if (img) img.style.height = `${CRIS_H_TILES * DT}px`
      }

      if (treeOverlayRef.current) {
        const ts = treeStateRef.current
        treeOverlayRef.current.style.display = ts === 'spliced' ? 'block' : 'none'
        treeOverlayRef.current.style.left  = `${TREE_COL * DT - cam.x}px`
        treeOverlayRef.current.style.top   = `${(TREE_ROW - 1) * DT - cam.y}px`
        treeOverlayRef.current.style.width  = `${DT}px`
        treeOverlayRef.current.style.height = `${2 * DT}px`
      }

      if (letterDropRef.current) {
        letterDropRef.current.style.display = letterOnGroundRef.current ? 'flex' : 'none'
        letterDropRef.current.style.left = `${LETTER_DROP_COL * DT - cam.x}px`
        letterDropRef.current.style.top  = `${(TREE_ROW - 1) * DT - cam.y}px`
      }
      if (anemDropRef.current) {
        anemDropRef.current.style.display = anemoniteOnGroundRef.current ? 'flex' : 'none'
        anemDropRef.current.style.left = `${ANEMONITE_DROP_COL * DT - cam.x}px`
        anemDropRef.current.style.top  = `${(TREE_ROW - 1) * DT - cam.y}px`
      }

      if (player) {
        const pCX = player.x + 10   // PLAYER_W / 2 = 20/2
        const pFY = player.y + 28   // PLAYER_H

        if (letterOnGroundRef.current &&
            Math.abs(pCX - LETTER_DROP_COL    * TILE) < TILE * 2 &&
            Math.abs(pFY - TREE_ROW * TILE) < TILE * 2) {
          letterOnGroundRef.current = false
          setLetterOnGround(false)
          setHasLetter(true)
          playSfx('/sounds/seed-pickup.mp3', { volume: 0.9 })
        }

        if (anemoniteOnGroundRef.current &&
            Math.abs(pCX - ANEMONITE_DROP_COL * TILE) < TILE * 2 &&
            Math.abs(pFY - TREE_ROW * TILE) < TILE * 2) {
          anemoniteOnGroundRef.current = false
          setAnemoniteOnGround(false)
          setHasAnemonite(true)
          playSfx('/sounds/seed-pickup.mp3', { volume: 0.9 })
        }
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  function handleCustomInteraction(cPhysX) {
    const nearTree = Math.abs(cPhysX - (TREE_COL * TILE + TILE / 2)) < TILE * 2.5
    if (!nearTree) return false

    const tool = selToolRef.current
    const ts   = treeStateRef.current

    if (ts === 'normal' && tool === 'seed') {
      playSfx('/sounds/tree-splice.mp3', { volume: 0.8 })
      treeStateRef.current = 'spliced'
      setTreeState('spliced')
      selToolRef.current = 'punch'
      setSelectedTool('punch')
      setSeedInHand(false)
      return true
    }

    if (ts === 'spliced' && tool === 'punch' && !doneRef.current) {
      doneRef.current = true
      playSfx('/sounds/tree-harvest.wav', { volume: 0.8 })
      treeStateRef.current = 'broken'
      setTreeState('broken')
      letterOnGroundRef.current    = true
      anemoniteOnGroundRef.current = true
      setLetterOnGround(true)
      setAnemoniteOnGround(true)
      return true
    }

    if (ts === 'normal' && tool === 'punch') {
      // Tree not spliced yet — consume the action
      playSfx('/sounds/punch-miss.wav', { volume: 0.5 })
      return true
    }

    return false
  }

  const RoFlag = () => (
    <span style={{ display:'inline-flex', width:16, height:11, marginRight:4, verticalAlign:'middle', border:'1px solid rgba(0,0,0,0.4)', borderRadius:1, overflow:'hidden', flexShrink:0 }}>
      <span style={{ flex:1, background:'#002B7F' }}/><span style={{ flex:1, background:'#FCD116' }}/><span style={{ flex:1, background:'#CE1126' }}/>
    </span>
  )

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GridWorld
        scenePath="/scenes/Cristian_Farm.json"
        onMenu={onMenu}
        onComplete={onMenu}
        onChatMsg={onChatMsg}
        onCustomInteraction={handleCustomInteraction}
        hideActionMenu
      />

      {/* Cristian */}
      <div ref={crisRef} style={{ position: 'fixed', display: 'block', pointerEvents: 'none', zIndex: 25, textAlign: 'center' }}>
        <div style={{ marginBottom: 2, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RoFlag />
          <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', textShadow: '-1px 0 #000,1px 0 #000,0 -1px #000,0 1px #000', fontFamily: '"Century Gothic",sans-serif' }}>Cristian</span>
        </div>
        <img src="/sprites/cristian.png" alt="Cristian"
          style={{ width: 'auto', imageRendering: 'pixelated', filter: 'drop-shadow(-2px 2px 0 rgba(0,0,0,0.5))', display: 'block', transform: 'scaleX(-1)' }} />
      </div>

      {/* Tree overlay: golden tint + letter crown, visible only when spliced */}
      <div ref={treeOverlayRef} style={{ position: 'fixed', pointerEvents: 'none', zIndex: 20, display: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,210,60,0.35)', borderRadius: 3, border: '1px solid rgba(255,220,0,0.4)' }} />
        <div style={{ position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)', filter: 'drop-shadow(0 0 6px rgba(255,240,150,.9))' }}>
          <img src="/sprites/letter.webp" alt="" draggable={false}
            style={{ width: 28, imageRendering: 'pixelated', display: 'block' }} />
        </div>
      </div>

      {/* Dropped letter on ground */}
      <div ref={letterDropRef} style={{ position: 'fixed', pointerEvents: 'none', zIndex: 22, display: 'none', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ filter: 'drop-shadow(0 0 8px #FFF3C4)' }}>
          <img src="/sprites/letter.webp" alt="" draggable={false}
            style={{ width: 26, imageRendering: 'pixelated', display: 'block' }} />
        </div>
        <div style={{ fontSize: 8, color: '#fff', fontWeight: 700, textShadow: '0 0 3px #000,0 0 3px #000' }}>RIDICĂ</div>
      </div>

      {/* Dropped anemonite on ground */}
      <div ref={anemDropRef} style={{ position: 'fixed', pointerEvents: 'none', zIndex: 22, display: 'none', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ filter: 'drop-shadow(0 0 6px rgba(200,230,255,.9))' }}>
          <img src="/sprites/blocks/all/anemone.png" alt="" draggable={false}
            style={{ width: 26, imageRendering: 'pixelated', display: 'block',
                     filter: 'grayscale(0.5) brightness(1.4)' }} />
        </div>
        <div style={{ fontSize: 8, color: '#fff', fontWeight: 700, textShadow: '0 0 3px #000,0 0 3px #000' }}>RIDICĂ</div>
      </div>

      {showFireworks && <Fireworks count={22} />}
      {showLetterModal && (
        <LetterModal onClose={() => { setShowFireworks(false); setShowLetterModal(false) }} />
      )}

      <ActionMenu
        selected={selectedTool}
        onSelect={id => { selToolRef.current = id; setSelectedTool(id) }}
        hasSeed={seedInHand}
        hasLetter={hasLetter}
        hasAnemonite={hasAnemonite}
      />
    </div>
  )
}
