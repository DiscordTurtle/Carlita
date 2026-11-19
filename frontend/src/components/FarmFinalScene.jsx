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
const CRIS_H_TILES  = 1.1

const LETTER_DROP_COL    = TREE_COL + 0.1
const ANEMONITE_DROP_COL = TREE_COL + 0.55

const CRIS_MSG1 = "Of soricel, iti pregatisem un cadou asa de frumos, dar mickeymouseul de rape wizard mi-a furat samamnta :("
const CRIS_MSG2 = "Yeeeey Carlita, ai gasit-o!!!!"

export default function FarmFinalScene({ onMenu, onChatMsg, hasSeed = true }) {
  const handleDoor = () => { playSfx('/sounds/door-open.mp3', { volume: 0.9 }); onMenu?.() }
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

  const crisRef          = useRef(null)
  const treeOverlayRef   = useRef(null)
  const letterDropRef    = useRef(null)
  const anemDropRef      = useRef(null)
  const crisBubbleRef    = useRef(null)
  const crisBubbleSpanRef= useRef(null)
  // Refs shared with RAF so bubble text updates without re-render
  const crisBubbleOnRef  = useRef(false)
  const crisBubbleMsgRef = useRef('')

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

  // Entry dialog — Cristian speaks when Carlita arrives
  useEffect(() => {
    const id = setTimeout(() => {
      playSfx('/sounds/whisper.mp3', { volume: 1.0 })
      const ts = new Date().toTimeString().slice(0, 8)
      crisBubbleOnRef.current = true
      let i = 0
      const type = () => {
        i++
        crisBubbleMsgRef.current = CRIS_MSG1.slice(0, i)
        onChatMsg?.({ t: ts, msg: `[Cristian]: ${CRIS_MSG1.slice(0, i)}`, color: '#f0c060', icon: '#4a88b8', done: i >= CRIS_MSG1.length, commit: i >= CRIS_MSG1.length })
        if (i < CRIS_MSG1.length) setTimeout(type, 45)
        else setTimeout(() => { crisBubbleOnRef.current = false }, 4500)
      }
      type()
    }, 1500)
    return () => clearTimeout(id)
  }, [])

  // Camera-sync + item pickup RAF
  useEffect(() => {
    let raf
    function tick() {
      const cam    = window.__gCam
      const player = window.__gPlayer
      if (!cam?.dt) { raf = requestAnimationFrame(tick); return }
      const DT = cam.dt

      if (crisRef.current) {
        crisRef.current.style.left   = `${CRIS_COL * DT - cam.x}px`
        crisRef.current.style.bottom = `${window.innerHeight - GROUND_ROW * DT + cam.y}px`
        crisRef.current.style.top    = ''
        const img = crisRef.current.querySelector('img')
        if (img) img.style.height = `${CRIS_H_TILES * DT}px`
      }

      if (treeOverlayRef.current) {
        const ts = treeStateRef.current
        treeOverlayRef.current.style.display = (ts === 'spliced' || ts === 'growing') ? 'block' : 'none'
        treeOverlayRef.current.style.left  = `${TREE_COL * DT - cam.x}px`
        treeOverlayRef.current.style.top   = `${(TREE_ROW - 1) * DT - cam.y}px`
        treeOverlayRef.current.style.width  = `${DT}px`
        treeOverlayRef.current.style.height = `${2 * DT}px`
      }

      if (crisBubbleRef.current) {
        if (crisBubbleOnRef.current) {
          crisBubbleRef.current.style.display = 'block'
          crisBubbleRef.current.style.left = `${CRIS_COL * DT - cam.x + DT * 0.5}px`
          crisBubbleRef.current.style.top  = `${(GROUND_ROW - CRIS_H_TILES) * DT - cam.y - 80}px`
          if (crisBubbleSpanRef.current) crisBubbleSpanRef.current.textContent = crisBubbleMsgRef.current
        } else {
          crisBubbleRef.current.style.display = 'none'
        }
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

  function triggerMsg2() {
    playSfx('/sounds/whisper.mp3', { volume: 1.0 })
    const ts = new Date().toTimeString().slice(0, 8)
    crisBubbleOnRef.current = true
    let i = 0
    const type = () => {
      i++
      crisBubbleMsgRef.current = CRIS_MSG2.slice(0, i)
      onChatMsg?.({ t: ts, msg: `[Cristian]: ${CRIS_MSG2.slice(0, i)}`, color: '#f0c060', icon: '#4a88b8', done: i >= CRIS_MSG2.length, commit: i >= CRIS_MSG2.length })
      if (i < CRIS_MSG2.length) setTimeout(type, 45)
      else setTimeout(() => { crisBubbleOnRef.current = false }, 3500)
    }
    type()
  }

  function handleCustomInteraction(cPhysX, _cPhysY, px, py) {
    const nearTree = Math.abs(cPhysX - (TREE_COL * TILE + TILE / 2)) < TILE * 2.5
    const clickOnTree = px >= TREE_COL * TILE && px < (TREE_COL + 1) * TILE &&
                        py >= (TREE_ROW - 1) * TILE && py < (TREE_ROW + 1) * TILE
    if (!nearTree || !clickOnTree) return false

    const tool = selToolRef.current
    const ts   = treeStateRef.current

    if (ts === 'normal' && tool === 'seed') {
      playSfx('/sounds/tree-splice.mp3', { volume: 0.8 })
      treeStateRef.current = 'growing'
      setTreeState('growing')
      selToolRef.current = 'punch'
      setSelectedTool('punch')
      setSeedInHand(false)
      // Tree becomes punchable after 3 seconds
      setTimeout(() => {
        treeStateRef.current = 'spliced'
        setTreeState('spliced')
      }, 3000)
      // Cristian reacts after a beat
      setTimeout(triggerMsg2, 500)
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

    if ((ts === 'normal' || ts === 'growing') && tool === 'punch') {
      playSfx('/sounds/punch-miss.wav', { volume: 0.5 })
      return true
    }

    return false
  }

  const treeHoverName =
    treeState === 'spliced' ? 'Birthday Card Tree' :
    treeState === 'growing' ? 'Paper Tree (Creste...)' :
    treeState === 'broken'  ? 'Birthday Card Tree (Recoltat)' :
    'Paper Tree'

  const RoFlag = () => (
    <span style={{ display:'inline-flex', width:16, height:11, marginRight:4, verticalAlign:'middle', border:'1px solid rgba(0,0,0,0.4)', borderRadius:1, overflow:'hidden', flexShrink:0 }}>
      <span style={{ flex:1, background:'#002B7F' }}/><span style={{ flex:1, background:'#FCD116' }}/><span style={{ flex:1, background:'#CE1126' }}/>
    </span>
  )

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GridWorld
        scenePath="/scenes/Cristian_Farm.json"
        onMenu={handleDoor}
        onComplete={handleDoor}
        onChatMsg={onChatMsg}
        onCustomInteraction={handleCustomInteraction}
        hideActionMenu
        toolOverride={selectedTool}
        hoverNames={{ 'crystal_tree.png': treeHoverName }}
        hideTiles={treeState === 'broken' ? [`${TREE_ROW - 1},${TREE_COL}`, `${TREE_ROW},${TREE_COL}`] : []}
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

      {/* Speech bubble above Cristian — RAF-positioned via refs */}
      <div ref={crisBubbleRef} style={{ position:'fixed', display:'none', pointerEvents:'none', zIndex:30, textAlign:'center', transform:'translateX(-50%)' }}>
        <div style={{ background:'#fff', color:'#1a0828', border:'2px solid #aaa', borderRadius:8, padding:'7px 13px', fontSize:13, fontWeight:700, maxWidth:340, whiteSpace:'pre-wrap', boxShadow:'0 2px 8px rgba(0,0,0,0.35)', fontFamily:'"Century Gothic",sans-serif' }}>
          <span ref={crisBubbleSpanRef} />
        </div>
        <div style={{ position:'absolute', bottom:-10, left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'8px solid transparent', borderRight:'8px solid transparent', borderTop:'10px solid #aaa' }} />
        <div style={{ position:'absolute', bottom:-7, left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'7px solid transparent', borderRight:'7px solid transparent', borderTop:'9px solid #fff', zIndex:1 }} />
      </div>

      {/* Tree overlay: golden tint + letter crown, visible when growing or spliced */}
      <div ref={treeOverlayRef} style={{ position: 'fixed', pointerEvents: 'none', zIndex: 20, display: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,210,60,0.35)', borderRadius: 3, border: '1px solid rgba(255,220,0,0.4)' }} />
        <div style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)', filter: 'drop-shadow(0 0 6px rgba(255,240,150,.9))' }}>
          <img src="/sprites/letter.webp" alt="" draggable={false}
            style={{ width: 28, imageRendering: 'pixelated', display: 'block',
                     filter: 'sepia(0.5) saturate(2.5) hue-rotate(-20deg) brightness(1.3)' }} />
        </div>
      </div>

      {/* Dropped letter on ground */}
      <div ref={letterDropRef} style={{ position: 'fixed', pointerEvents: 'none', zIndex: 22, display: 'none', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ filter: 'drop-shadow(0 0 8px #FFF3C4)' }}>
          <img src="/sprites/letter.webp" alt="" draggable={false}
            style={{ width: 26, imageRendering: 'pixelated', display: 'block',
                     filter: 'sepia(0.5) saturate(2.5) hue-rotate(-20deg) brightness(1.3)' }} />
        </div>
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
