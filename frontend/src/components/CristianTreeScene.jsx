import React, { useEffect, useRef, useState } from 'react'
import GridWorld from './GridWorld.jsx'

const WIZARD_SPR   = '/sprites/blocks/all/legendary_wizard.png'
const CRISTIAN_SPR = '/sprites/cristian.png'
const WIZARD_MSG   = "Hahaha, n-o să-ți mai vezi iubitul niciodată! 😈 Vino în P4rkour dacă îndreznești!"
const CRISTIAN_MSG = "Heyyy șoricel drag!! 🎉 La mulți ani!! Sunt atât de fericit că ești aici!! ♥"

const STEPS = [
  { key: 'world',           ms: 5000  },
  { key: 'cristian_dialog', ms: 4500  },
  { key: 'battle',          ms: 60000 },
  { key: 'wizard_move',     ms: 2200  },
  { key: 'steal',           ms: 1500  },
  { key: 'notification',    ms: 3500  },
  { key: 'leave',           ms: 2000  },
]

// Tile-space constants (DT-independent, converted in RAF using window.__gCam.dt)
const GROUND_ROW    = 26
const CRIS_COL      = 43   // one tile left of weather machine (col 44)
const CRIS_H_TILES  = 1.3  // Cristian = slightly taller than the 1-tile player
const WIZARD_H_TILES = 3   // Wizard = 3 tiles tall

// Wizard animation in tile-col/row space
const WIZ_START_COL = -8
const WIZ_START_ROW = -4
const WIZ_END_COL   = 42   // lands beside Cristian
const WIZ_END_ROW   = GROUND_ROW - WIZARD_H_TILES

export default function CristianTreeScene({ onComplete, onMenu, firstVisit = true, onCinematicEnd, onChatMsg }) {
  const [cinematicDone, setCinematicDone] = useState(!firstVisit)
  const [step,          setStep]          = useState(0)
  const [msgChars,      setMsgChars]      = useState(0)
  const [crisChars,     setCrisChars]     = useState(0)
  const onCinematicEndRef = useRef(onCinematicEnd)
  const crisDialogTsRef   = useRef(null)
  const wizNotifTsRef     = useRef(null)
  useEffect(() => { onCinematicEndRef.current = onCinematicEnd }, [onCinematicEnd])

  // Refs for direct DOM positioning (bypasses React for 60fps camera sync)
  const crisRef   = useRef(null)
  const bubbleRef = useRef(null)
  const wizRef    = useRef(null)

  // Wizard animated position in tile space (col, row) — updated by JS lerp
  const wizPosRef      = useRef({ col: WIZ_START_COL, row: WIZ_START_ROW })
  const wizTrailRefs   = useRef([])
  const wizTrailPos    = useRef([])
  const rafFrameRef    = useRef(0)
  const explodeRef     = useRef(null)
  const explodeShownRef = useRef(false)
  const crisCharsRef   = useRef(0)

  const phase = step < STEPS.length ? STEPS[step].key : 'done'
  const phaseRef = useRef(phase)
  useEffect(() => { phaseRef.current = phase }, [phase])
  useEffect(() => { crisCharsRef.current = crisChars }, [crisChars])

  // Step timer
  useEffect(() => {
    if (cinematicDone) return
    if (step >= STEPS.length) { setCinematicDone(true); onCinematicEndRef.current?.(); return }
    if (phase === 'battle') return
    const t = setTimeout(() => setStep(s => s + 1), STEPS[step].ms)
    return () => clearTimeout(t)
  }, [step, phase, cinematicDone])

  // Cristian message typing
  useEffect(() => {
    if (phase !== 'cristian_dialog') { setCrisChars(0); return }
    if (crisChars >= CRISTIAN_MSG.length) return
    const delay = crisChars === 0 ? 400 : 45
    const t = setTimeout(() => setCrisChars(n => n + 1), delay)
    return () => clearTimeout(t)
  }, [phase, crisChars])

  // Wizard JS lerp animation in tile-space
  useEffect(() => {
    if (phase !== 'wizard_move') {
      // Keep final position during steal so wizard stays visible at landing spot
      if (phase !== 'steal') wizPosRef.current = { col: WIZ_START_COL, row: WIZ_START_ROW }
      return
    }
    const DURATION = 1600
    const startTime = performance.now()
    let raf
    function animate(now) {
      const t = Math.min((now - startTime) / DURATION, 1)
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      wizPosRef.current = {
        col: WIZ_START_COL + (WIZ_END_COL - WIZ_START_COL) * ease,
        row: WIZ_START_ROW + (WIZ_END_ROW - WIZ_START_ROW) * ease,
      }
      if (t < 1) raf = requestAnimationFrame(animate)
    }
    const tid = setTimeout(() => { raf = requestAnimationFrame(animate) }, 80)
    return () => { clearTimeout(tid); cancelAnimationFrame(raf) }
  }, [phase])

  // Wizard whisper typing — keep alive through leave so chatbox shows full message
  useEffect(() => {
    if (phase !== 'notification' && phase !== 'leave') { setMsgChars(0); return }
    if (msgChars >= WIZARD_MSG.length) return
    const t = setTimeout(() => setMsgChars(n => n + 1), 40)
    return () => clearTimeout(t)
  }, [phase, msgChars])

  // Report Cristian's dialog live to the persistent chat bar
  useEffect(() => {
    if (phase === 'cristian_dialog') {
      if (!crisDialogTsRef.current) crisDialogTsRef.current = new Date().toTimeString().slice(0, 8)
      if (crisChars === 0) return
      onChatMsg?.({
        t: crisDialogTsRef.current, msg: `[Cristian]: ${CRISTIAN_MSG.slice(0, crisChars)}`,
        color: '#f0c060', icon: '#4a88b8',
        done: crisChars >= CRISTIAN_MSG.length, commit: true,
      })
    } else if (crisDialogTsRef.current) {
      onChatMsg?.({ t: crisDialogTsRef.current, msg: `[Cristian]: ${CRISTIAN_MSG.slice(0, crisChars)}`, color: '#f0c060', icon: '#4a88b8', done: true, commit: crisChars >= CRISTIAN_MSG.length })
      crisDialogTsRef.current = null
    }
  }, [phase, crisChars])

  // Report wizard's PM live to the persistent chat bar (transient — phase 2 whisper commits it on worldselect)
  useEffect(() => {
    if (phase === 'notification' || phase === 'leave') {
      if (!wizNotifTsRef.current) wizNotifTsRef.current = new Date().toTimeString().slice(0, 8)
      if (msgChars === 0) return
      onChatMsg?.({
        t: wizNotifTsRef.current, msg: `** from (EvilWizard) in [WIZARDWORLD] ** : ${WIZARD_MSG.slice(0, msgChars)}`,
        color: '#ff9090', icon: '#c060ff',
        done: msgChars >= WIZARD_MSG.length, commit: false,
      })
    } else if (wizNotifTsRef.current) {
      onChatMsg?.({ done: true, commit: false })
      wizNotifTsRef.current = null
    }
  }, [phase, msgChars])

  // RAF: positions characters using DT from window.__gCam (handles any tileScale)
  useEffect(() => {
    if (cinematicDone) return
    let raf
    function tick() {
      const cam = window.__gCam
      if (!cam || !cam.dt) { raf = requestAnimationFrame(tick); return }
      const DT = cam.dt
      const p = phaseRef.current

      const crisDX = CRIS_COL * DT
      const crisDY = (GROUND_ROW - CRIS_H_TILES) * DT
      const crisDispH = CRIS_H_TILES * DT

      // Cristian
      if (crisRef.current) {
        const show = p !== 'steal' && p !== 'notification' && p !== 'leave' && p !== 'done'
        crisRef.current.style.display = show ? 'block' : 'none'
        if (show) {
          crisRef.current.style.left = `${crisDX - cam.x}px`
          crisRef.current.style.top  = `${crisDY - cam.y}px`
          const img = crisRef.current.querySelector('img')
          if (img) img.style.height = `${crisDispH}px`
        }
      }

      // Speech bubble
      if (bubbleRef.current) {
        const show = p === 'cristian_dialog'
        bubbleRef.current.style.display = show ? 'block' : 'none'
        if (show) {
          bubbleRef.current.style.left = `${crisDX + DT / 2 - cam.x}px`
          bubbleRef.current.style.top  = `${crisDY - cam.y}px`
          bubbleRef.current.querySelector('span')
          // Update text
          const textEl = bubbleRef.current.querySelector('.bubble-text')
          if (textEl) textEl.textContent = CRISTIAN_MSG.slice(0, crisCharsRef.current)
        }
      }

      // Wizard + trail
      rafFrameRef.current++
      const wizShow = p === 'wizard_move' || p === 'steal'
      if (wizRef.current) {
        wizRef.current.style.display = wizShow ? 'block' : 'none'
        if (wizShow) {
          const wiz = wizPosRef.current
          wizRef.current.style.left = `${wiz.col * DT - cam.x}px`
          wizRef.current.style.top  = `${wiz.row * DT - cam.y}px`
          wizRef.current.style.opacity = p === 'steal' ? '0' : '1'
          const img = wizRef.current.querySelector('img')
          if (img) img.style.height = `${WIZARD_H_TILES * DT}px`
        }
      }
      // Sample trail every 4 frames during wizard_move
      if (p === 'wizard_move' && rafFrameRef.current % 4 === 0) {
        wizTrailPos.current.push({ ...wizPosRef.current })
        if (wizTrailPos.current.length > 5) wizTrailPos.current.shift()
      } else if (!wizShow) {
        wizTrailPos.current = []
      }
      // Render trail ghosts (oldest → most transparent)
      for (let i = 0; i < 5; i++) {
        const el = wizTrailRefs.current[i]
        if (!el) continue
        const entry = wizTrailPos.current[i]
        if (!entry || !wizShow) { el.style.display = 'none'; continue }
        el.style.display = 'block'
        el.style.opacity = p === 'steal' ? '0' : ((i + 1) / 7).toFixed(2)
        el.style.left = `${entry.col * DT - cam.x}px`
        el.style.top  = `${entry.row * DT - cam.y}px`
        const img = el.querySelector('img')
        if (img) img.style.height = `${WIZARD_H_TILES * DT}px`
      }

      // Explosion when wizard steals Cristian
      if (p === 'steal') {
        if (!explodeShownRef.current && explodeRef.current) {
          explodeShownRef.current = true
          const wiz = wizPosRef.current
          explodeRef.current.style.left = `${wiz.col * DT + WIZARD_H_TILES * DT * 0.4 - cam.x}px`
          explodeRef.current.style.top  = `${wiz.row * DT + WIZARD_H_TILES * DT * 0.5 - cam.y}px`
          explodeRef.current.style.display = 'block'
        }
      } else {
        explodeShownRef.current = false
        if (explodeRef.current) explodeRef.current.style.display = 'none'
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [cinematicDone])

  const chars = !cinematicDone ? (
    <>
      {/* Cristian — positioned by RAF */}
      <div ref={crisRef} style={{ position: 'fixed', display: 'none', pointerEvents: 'none', zIndex: 25, textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: '#f0c060', marginBottom: 2, fontWeight: 700, whiteSpace: 'nowrap', textShadow: '1px 1px 0 #000,-1px 1px 0 #000', fontFamily: '"Century Gothic",sans-serif' }}>Cristian</div>
        <img src={CRISTIAN_SPR} alt="Cristian" style={{ width: 'auto', imageRendering: 'pixelated', filter: 'drop-shadow(-2px 2px 0 rgba(0,0,0,0.5))', display: 'block' }} />
      </div>

      {/* Speech bubble */}
      <div ref={bubbleRef} style={{ position: 'fixed', display: 'none', pointerEvents: 'none', zIndex: 26, transform: 'translateX(-50%) translateY(-100%)', background: '#fff', color: '#1a0828', border: '2px solid #aaa', borderRadius: 8, padding: '7px 13px', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,0,0,0.35)', fontFamily: '"Century Gothic",sans-serif' }}>
        <span className="bubble-text"></span>
        <div style={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '10px solid #aaa' }} />
        <div style={{ position: 'absolute', bottom: -7, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '9px solid #fff' }} />
      </div>

      {/* Wizard explosion on steal */}
      <div ref={explodeRef} style={{ position: 'fixed', display: 'none', pointerEvents: 'none', zIndex: 30 }}>
        {/* Shockwave — fastest, outermost */}
        <div style={{ position: 'absolute', width: 1600, height: 1600, marginLeft: -800, marginTop: -800, borderRadius: '50%', border: '8px solid rgba(255,255,255,0.7)', animation: 'wizShockwave 0.6s ease-out both' }} />
        {/* Core burst */}
        <div style={{ position: 'absolute', width: 900, height: 900, marginLeft: -450, marginTop: -450, borderRadius: '50%', background: 'radial-gradient(circle, #fff 0%, #fff 8%, #e8b0ff 20%, #a030f0 50%, transparent 72%)', animation: 'wizExplode 0.9s cubic-bezier(0.05,0.8,0.5,1) both' }} />
        {/* Inner bright flash */}
        <div style={{ position: 'absolute', width: 400, height: 400, marginLeft: -200, marginTop: -200, borderRadius: '50%', background: 'radial-gradient(circle, #fff 0%, rgba(255,255,255,0.6) 50%, transparent 100%)', animation: 'wizExplode 0.45s ease-out both' }} />
        {/* Ring 1 */}
        <div style={{ position: 'absolute', width: 1200, height: 1200, marginLeft: -600, marginTop: -600, borderRadius: '50%', border: '12px solid rgba(192,70,255,0.95)', animation: 'wizRing 1.0s ease-out 0.08s both' }} />
        {/* Ring 2 */}
        <div style={{ position: 'absolute', width: 750, height: 750, marginLeft: -375, marginTop: -375, borderRadius: '50%', border: '7px solid rgba(255,220,255,0.9)', animation: 'wizRing 0.75s ease-out 0.18s both' }} />
      </div>

      {/* Wizard trail ghosts */}
      {[0,1,2,3,4].map(i => (
        <div key={i} ref={el => wizTrailRefs.current[i] = el} style={{ position: 'fixed', display: 'none', pointerEvents: 'none', zIndex: 24, transition: 'opacity 0.8s ease-out' }}>
          <img src={WIZARD_SPR} alt="" style={{ width: 'auto', imageRendering: 'pixelated', filter: 'hue-rotate(180deg) brightness(1.4) blur(1px)', display: 'block' }} />
        </div>
      ))}

      {/* Wizard — positioned by RAF */}
      <div ref={wizRef} style={{ position: 'fixed', display: 'none', pointerEvents: 'none', zIndex: 25, textAlign: 'center', transition: 'opacity 0.8s ease-out' }}>
        <div style={{ fontSize: 11, color: '#c090ff', marginBottom: 2, fontWeight: 700, whiteSpace: 'nowrap', textShadow: '1px 1px 0 #000,-1px 1px 0 #000', fontFamily: '"Century Gothic",sans-serif' }}>EvilWizard</div>
        <img src={WIZARD_SPR} alt="Wizard" style={{ width: 'auto', imageRendering: 'pixelated', filter: 'drop-shadow(-2px 2px 0 rgba(0,0,0,0.5))', display: 'block' }} />
      </div>
    </>
  ) : null

  const screenOverlay = !cinematicDone && phase !== 'done' ? (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, pointerEvents: phase === 'world' || phase === 'cristian_dialog' ? 'none' : 'all' }}>
      {phase === 'battle' && (
        <video
          key="battle-video"
          src="/videos/evil_wizard_battle.mp4"
          autoPlay playsInline
          onEnded={() => setStep(s => s + 1)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
      {phase === 'steal' && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.4)', animation: 'stealFlash 0.6s ease-out forwards', pointerEvents: 'none' }} />
      )}
      {phase === 'leave' && (
        <div style={{ position: 'absolute', bottom: 100, left: '50%', animation: 'fadeInUp 0.5s ease-out', background: 'rgba(0,0,0,0.75)', color: '#c0d8ff', fontSize: 15, fontWeight: 700, padding: '8px 20px', borderRadius: 4, whiteSpace: 'nowrap' }}>
          Cristian a dispărut...
        </div>
      )}
    </div>
  ) : null

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GridWorld
        scenePath="/scenes/Cristian_Tree.json"
        onComplete={onComplete}
        onMenu={onMenu}
      />
      {chars}
      {screenOverlay}
    </div>
  )
}
