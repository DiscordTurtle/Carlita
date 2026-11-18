import React, { useEffect, useRef, useState } from 'react'
import GridWorld from './GridWorld.jsx'
import Fireworks from './Fireworks.jsx'
import LetterModal from './LetterModal.jsx'
import ActionMenu from './ActionMenu.jsx'
import { playSfx } from '../useAudio.js'

const TILE          = 32
const TREE_COL      = 50   // crystal_tree in Cristian_Farm.json
const TREE_ROW      = 25
const CRIS_COL      = 51   // 1 tile right of tree, facing left
const GROUND_ROW    = 26   // first solid dirt row
const CRIS_H_TILES  = 1.3

const CRIS_MSG = "Heyyy! Mă bucur că ai venit! 🎉 Cadoul tău e în copac — poți planta sămânța? La mulți ani, suarec!! ♥"

export default function FarmFinalScene({ onMenu, onChatMsg, hasSeed = true }) {
  // 'walk'=has seed, 'punch'=planted seed, 'done'=letter opened
  const [stage,          setStage]          = useState(hasSeed ? 'walk' : 'punch')
  const [showFireworks,  setShowFireworks]  = useState(false)
  const [showLetterModal,setShowLetterModal]= useState(false)
  const [crisChars,      setCrisChars]      = useState(0)

  const stageRef   = useRef(hasSeed ? 'walk' : 'punch')
  const crisRef    = useRef(null)
  const bubbleRef  = useRef(null)
  const doneRef    = useRef(false)
  const crisCharsRef        = useRef(0)
  const crisMsgTsRef        = useRef(null)
  const crisWhisperSoundedRef = useRef(false)

  useEffect(() => { stageRef.current = stage }, [stage])
  useEffect(() => { crisCharsRef.current = crisChars }, [crisChars])

  // Cristian dialog typewriter — starts 1s after mount
  useEffect(() => {
    if (crisChars >= CRIS_MSG.length) return
    const delay = crisChars === 0 ? 1000 : 45
    const id = setTimeout(() => {
      if (crisChars === 0 && !crisWhisperSoundedRef.current) {
        crisWhisperSoundedRef.current = true
        playSfx('/sounds/whisper.mp3', { volume: 1.0 })
      }
      setCrisChars(n => n + 1)
    }, delay)
    return () => clearTimeout(id)
  }, [crisChars])

  // Report Cristian dialog live to persistent chat bar
  useEffect(() => {
    if (crisChars === 0) return
    if (!crisMsgTsRef.current) crisMsgTsRef.current = new Date().toTimeString().slice(0, 8)
    const done = crisChars >= CRIS_MSG.length
    onChatMsg?.({ t: crisMsgTsRef.current, msg: `[Cristian]: ${CRIS_MSG.slice(0, crisChars)}`, color: '#f0c060', icon: '#4a88b8', done, commit: done })
  }, [crisChars])

  // Keep Cristian synced to the camera; anchor bottom of div to GROUND_ROW so
  // the name label above the sprite doesn't push him into the ground
  useEffect(() => {
    let raf
    function tick() {
      const cam = window.__gCam
      if (!cam?.dt) { raf = requestAnimationFrame(tick); return }
      const DT = cam.dt
      if (crisRef.current) {
        crisRef.current.style.left   = `${CRIS_COL * DT - cam.x}px`
        crisRef.current.style.top    = 'auto'
        crisRef.current.style.bottom = `${window.innerHeight - GROUND_ROW * DT + cam.y}px`
        const img = crisRef.current.querySelector('img')
        if (img) img.style.height = `${CRIS_H_TILES * DT}px`
      }
      if (bubbleRef.current) {
        const show = crisCharsRef.current > 0 && crisCharsRef.current < CRIS_MSG.length + 20
        bubbleRef.current.style.display = show ? 'block' : 'none'
        if (show) {
          bubbleRef.current.style.left = `${CRIS_COL * DT + DT / 2 - cam.x}px`
          bubbleRef.current.style.top  = `${(GROUND_ROW - CRIS_H_TILES) * DT - cam.y - 20}px`
          const textEl = bubbleRef.current.querySelector('.bubble-text')
          if (textEl) textEl.textContent = CRIS_MSG.slice(0, crisCharsRef.current)
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  function handleCustomInteraction(cPhysX, cPhysY) {
    const nearTree = Math.abs(cPhysX - (TREE_COL * TILE + TILE / 2)) < TILE * 2.5
    if (!nearTree) return false

    if (stageRef.current === 'walk') {
      setStage('punch')
      stageRef.current = 'punch'
      playSfx('/sounds/tree-splice.mp3', { volume: 0.8 })
      return true
    }
    if (stageRef.current === 'punch' && !doneRef.current) {
      doneRef.current = true
      setStage('done')
      stageRef.current = 'done'
      playSfx('/sounds/tree-harvest.wav', { volume: 0.8 })
      setTimeout(() => {
        playSfx('/sounds/achievement.wav', { volume: 0.7 })
        setShowFireworks(true)
        playSfx('/sounds/firework.wav',  { volume: 0.7 })
        setTimeout(() => playSfx('/sounds/firework2.wav', { volume: 0.7 }), 350)
        setTimeout(() => playSfx('/sounds/firework.wav',  { volume: 0.6 }), 750)
        setTimeout(() => setShowLetterModal(true), 900)
      }, 400)
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
      />

      {/* Speech bubble — camera-synced via RAF */}
      <div ref={bubbleRef} style={{ position: 'fixed', display: 'none', pointerEvents: 'none', zIndex: 26, transform: 'translateX(-50%) translateY(-100%)', background: '#fff', color: '#1a0828', border: '2px solid #aaa', borderRadius: 8, padding: '7px 13px', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,0,0,0.35)', fontFamily: '"Century Gothic",sans-serif' }}>
        <span className="bubble-text"></span>
        <div style={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '10px solid #aaa' }} />
        <div style={{ position: 'absolute', bottom: -7, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '9px solid #fff' }} />
      </div>

      {/* Cristian — camera-synced via RAF, bottom-anchored so name label doesn't push into ground */}
      <div ref={crisRef} style={{ position: 'fixed', display: 'block', pointerEvents: 'none', zIndex: 25, textAlign: 'center' }}>
        <div style={{ marginBottom: 2, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RoFlag />
          <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', textShadow: '-1px 0 #000,1px 0 #000,0 -1px #000,0 1px #000', fontFamily: '"Century Gothic",sans-serif' }}>Cristian</span>
        </div>
        <img src="/sprites/cristian.png" alt="Cristian"
          style={{ width: 'auto', imageRendering: 'pixelated', filter: 'drop-shadow(-2px 2px 0 rgba(0,0,0,0.5))', display: 'block', transform: 'scaleX(-1)' }} />
      </div>

      {showFireworks && <Fireworks count={22} />}
      {showLetterModal && (
        <LetterModal onClose={() => { setShowFireworks(false); setShowLetterModal(false) }} />
      )}

      <ActionMenu
        selected={stage === 'walk' ? 'seed' : 'punch'}
        onSelect={() => {}}
        hasSeed={stage === 'walk'}
        hasLetter={false}
      />
    </div>
  )
}
