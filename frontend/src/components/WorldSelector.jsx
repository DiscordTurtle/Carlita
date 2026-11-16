import React, { useEffect, useRef, useState } from 'react'
import { AUTOTILE, autotileCSS } from '../AUTOTILE.js'

const BASE_URL = '/sprites/blocks/all/'
// neighbors preset: fully surrounded — gives connected/solid appearance for bg fills
const ALL_N = { n:true,s:true,e:true,w:true,nw:true,ne:true,se:true,sw:true }

function tileCss(name, displayPx) {
  const at = AUTOTILE[name]
  if (at) return autotileCSS(at, ALL_N, displayPx)
  return { background:`url(${BASE_URL}${name}) center/calc(100% + 2px) calc(100% + 2px) no-repeat`, imageRendering:'pixelated' }
}

// Phase config: which world is highlighted, what message types in
const PHASES = {
  1: {
    realWorld: 'CRISTIAN_FARM',
    myWorlds:  ['CRISTIAN_FARM', 'BDAY23', 'FLOWERS'],
    msgSender: 'Cristian',
    msgWorld:  'CRISTIAN_FARM',
    msgText:   "Heyyy! La multi ani!! Vino să mă vizitezi în CRISTIAN_FARM! 🌳",
    msgColor:  '#f0c060',
  },
  2: {
    realWorld: 'P4rkour',
    myWorlds:  ['P4rkour', 'CRISTIAN_FARM', 'BDAY23'],
    msgSender: 'EvilWizard',
    msgWorld:  'WIZARDWORLD',
    msgText:   "Hahaha, n-o să-ți mai vezi iubitul niciodată! 😈 Vino în P4rkour dacă îndreznești!",
    msgColor:  '#ff8888',
  },
  3: {
    realWorld: 'CRISTIAN_FARM',
    myWorlds:  ['CRISTIAN_FARM', 'P4rkour', 'BDAY23'],
    msgSender: 'Cristian',
    msgWorld:  'CRISTIAN_FARM',
    msgText:   "Vino să te întâlnești cu mine în CRISTIAN_FARM! Voiam să-ți arăt ceva special ♥",
    msgColor:  '#f0c060',
  },
}

const TOP_WORLDS    = ['START', 'BFN', 'GROW', 'FARM', 'BFNLOL']
const RECENT_WORLDS = ['CRISTIAN_FARM', 'BDAY23', 'P4rkour', 'FLOWERS', 'PARTY', 'TEST', 'LOVE', 'START']

function SceneBG({ grid }) {
  if (!grid?.length) return null
  const cols  = grid[0].length
  const tileW = window.innerWidth / cols
  const rows  = grid.length

  return (
    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:rows * tileW, pointerEvents:'none', opacity:0.7, filter:'saturate(0.2) brightness(0.55)' }}>
      {grid.map((row, r) =>
        row.map((cell, c) => {
          if (!cell.fg && !cell.bg) return null
          const W = Math.ceil(tileW)
          return (
            <div key={`${r}-${c}`} style={{ position:'absolute', left:Math.round(c*tileW), top:Math.round(r*tileW), width:W, height:W }}>
              {cell.bg && <div style={{ position:'absolute', inset:0, opacity:0.45, ...tileCss(cell.bg, tileW) }} />}
              {cell.fg && <div style={{ position:'absolute', inset:0, ...tileCss(cell.fg, tileW) }} />}
            </div>
          )
        })
      )}
    </div>
  )
}

function WorldPill({ name, variant = 'recent', onClick, glow = false }) {
  const styles = {
    my:     { background:'#1a6630', border:'2px solid #2a9948', color:'#80ffaa' },
    top:    { background:'#8b1fa8', border:'2px solid #cc44e0', color:'#f0c0ff' },
    recent: { background:'rgba(20,36,52,0.9)', border:'2px solid #3a5570', color:'#a8c8e8' },
  }
  const s = styles[variant] || styles.recent
  return (
    <button onClick={onClick} style={{
      ...s,
      flexShrink:0,
      borderRadius:4,
      fontFamily:'inherit', fontWeight:700, fontSize:13,
      padding:'5px 14px', cursor: onClick ? 'pointer' : 'default',
      whiteSpace:'nowrap',
      boxShadow: glow ? `0 0 12px ${s.border}, 0 2px 0 rgba(0,0,0,0.6)` : '0 2px 0 rgba(0,0,0,0.6)',
      outline: glow ? `2px solid ${s.border}` : 'none',
      outlineOffset: 2,
      transition:'transform 0.1s, box-shadow 0.1s',
    }}>
      {name}
    </button>
  )
}

export default function WorldSelector({ onBack, onEnterWorld, phase = 1 }) {
  const pd = PHASES[phase] || PHASES[1]

  const [scene,    setScene]    = useState(null)
  const [selected, setSelected] = useState(pd.realWorld)

  // Reset selected when phase changes
  const prevPhase = useRef(phase)
  useEffect(() => {
    if (prevPhase.current !== phase) {
      prevPhase.current = phase
      setSelected(PHASES[phase]?.realWorld ?? selected)
    }
  }, [phase])

  // Load world scene for background
  useEffect(() => {
    fetch('/scenes/world-picker.json').then(r => r.json()).then(d => setScene(d.grid)).catch(() => {})
  }, [])

  function enter() {
    onEnterWorld?.(selected)
  }

  return (
    <div style={{
      position:'absolute', inset:0, overflow:'hidden',
      background:'linear-gradient(180deg,#0a2838 0%,#0d3245 60%,#0f3648 100%)',
      fontFamily:'"Century Gothic",CenturyGothic,Geneva,sans-serif',
      display:'flex', flexDirection:'column',
    }}>
      {/* Rendered world scene */}
      <SceneBG grid={scene} />
      {/* Tint overlay targeting #0C2D3B */}
      <div style={{ position:'absolute', inset:0, background:'rgba(10,40,58,0.82)', pointerEvents:'none' }} />

      {/* ── World Name ── */}
      <div style={{ position:'relative', zIndex:10, padding:'10px 14px 4px' }}>
        <div style={{ color:'#c0d8f0', fontSize:13, textAlign:'center', marginBottom:8 }}>
          Hit Enter or click 'Enter World' to enter this world!
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ color:'#e0f0ff', fontSize:20, fontWeight:700, flexShrink:0 }}>World Name:</span>
          <div style={{ flex:1, background:'rgba(16,32,58,0.88)', border:'2px solid #3a6090', borderRadius:3, padding:'8px 16px', fontSize:20, fontWeight:700, color:'#e8f4ff', letterSpacing:'0.04em' }}>
            {selected}
          </div>
        </div>
      </div>

      {/* ── World lists ── */}
      <div style={{ position:'relative', zIndex:10, flex:1, padding:'6px 14px 0', display:'flex', flexDirection:'column', gap:10, minHeight:0, overflow:'hidden' }}>
        <div>
          <div style={{ color:'#8ab4d0', fontSize:12.5, fontWeight:700, marginBottom:5 }}>Top Worlds:</div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {TOP_WORLDS.map(w => <WorldPill key={w} name={w} variant="top" onClick={() => setSelected(w)} />)}
          </div>
        </div>
        <div>
          <div style={{ color:'#8ab4d0', fontSize:12.5, fontWeight:700, marginBottom:5 }}>My Worlds:</div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {pd.myWorlds.map(w => (
              <WorldPill key={w} name={w} variant="my" glow={w === pd.realWorld && selected === w} onClick={() => setSelected(w)} />
            ))}
          </div>
        </div>
        <div>
          <div style={{ color:'#8ab4d0', fontSize:12.5, fontWeight:700, marginBottom:5 }}>Recently Visited Worlds:</div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {RECENT_WORLDS.map(w => <WorldPill key={w} name={w} variant="recent" onClick={() => setSelected(w)} />)}
          </div>
        </div>
      </div>

      {/* ── Bottom buttons ── */}
      <div style={{ position:'relative', zIndex:10, display:'grid', gridTemplateColumns:'1fr 2fr', gap:8, padding:'10px 10px 12px', background:'rgba(2,8,18,0.88)', borderTop:'2px solid #1a4060', flexShrink:0 }}>
        <Btn onClick={onBack}>Back</Btn>
        <Btn onClick={enter}>Enter World</Btn>
      </div>
    </div>
  )
}

function Btn({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      onMouseDown={e  => e.currentTarget.style.transform='translateY(3px)'}
      onMouseUp={e    => e.currentTarget.style.transform=''}
      onMouseLeave={e => e.currentTarget.style.transform=''}
      style={{ background:'linear-gradient(180deg,#3a5468,#243444)', border:'3px solid #4a7090', borderRadius:6, color:'#d0e8ff', fontFamily:'"Century Gothic",sans-serif', fontWeight:900, fontSize:26, padding:'18px 0', cursor:'pointer', boxShadow:'0 5px 0 #080f1c', transition:'transform 0.06s' }}
    >
      {children}
    </button>
  )
}
