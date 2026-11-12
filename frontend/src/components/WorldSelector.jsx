import React, { useEffect, useRef, useState } from 'react'

const MESSAGE   = "Heyyy! La multi ani!! Vino sa vezi ce parkour am facut pentru tine!"
const FAKE_WORLDS = ['GROW', 'BDAY23', 'PARTY', 'TEST', 'LOVE', 'CRISTIAN', 'CARLITA', 'FLOWERS']
const REAL = 'P4rkour'

function timestamp() {
  const d = new Date()
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
}

export default function WorldSelector({ onBack, onEnter }) {
  const [msgChars,    setMsgChars]    = useState(0)
  const [parkourSize, setParkourSize] = useState(1)
  const [pulse,       setPulse]       = useState(false)
  const [selected,    setSelected]    = useState(REAL)
  const [ts]                          = useState(timestamp)
  const bounceTimer = useRef(null)

  useEffect(() => {
    if (msgChars >= MESSAGE.length) return
    // small delay before message starts typing
    const delay = msgChars === 0 ? 900 : 35
    const id = setTimeout(() => setMsgChars(n => n + 1), delay)
    return () => clearTimeout(id)
  }, [msgChars])

  function clickFake(name) {
    setSelected(name)
    setParkourSize(s => Math.min(s + 0.18, 2.4))
    setPulse(true)
    clearTimeout(bounceTimer.current)
    bounceTimer.current = setTimeout(() => { setPulse(false); setSelected(REAL) }, 800)
  }

  const realScale = `scale(${parkourSize + (pulse ? 0.1 : 0)})`

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: 'linear-gradient(180deg,#0b1826 0%,#0e1f36 55%,#091420 100%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: '"Century Gothic",CenturyGothic,Geneva,sans-serif',
      overflow: 'hidden',
    }}>

      {/* subtle BG tile texture */}
      <div aria-hidden style={{ position:'absolute', inset:0, opacity:0.06, pointerEvents:'none' }}>
        {Array.from({length:7}).map((_,r) => Array.from({length:12}).map((_,c) => (
          <div key={`${r}-${c}`} style={{
            position:'absolute', left:`${c*8.5}%`, top:`${15+r*11}%`,
            width:40, height:40,
            background:['#3a7aaa','#2a5a88','#4a9abf','#1a4a70'][(r*3+c)%4],
            border:'1px solid rgba(255,255,255,0.08)',
          }}/>
        )))}
      </div>

      {/* ── Log box (top-left bordered panel like inspo) ── */}
      <div style={{ padding:'14px 16px 0' }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(8,16,30,0.88)',
          border: '2px solid #3a6080',
          borderRadius: 4,
          padding: '8px 12px',
          fontSize: 13,
          lineHeight: 1.7,
          color: '#c8dff0',
          minWidth: 320,
          maxWidth: '55%',
        }}>
          <div style={{color:'#f0c040'}}>Canceled logon.</div>
          <div>Getting server address...</div>
          <div>Located server, connecting to 127.0.0.1:17000</div>
          <div>Logging on...</div>
        </div>
      </div>

      {/* ── Whisper bar — appears once message starts typing ── */}
      {msgChars > 0 && (
        <div style={{
          marginTop: 10,
          background: '#0d2e2e',
          borderTop: '1px solid #1a5050',
          borderBottom: '1px solid #1a5050',
          padding: '6px 14px',
          fontSize: 13,
          display: 'flex', alignItems: 'baseline', gap: 6,
          flexWrap: 'wrap',
          color: '#e0f0f0',
          lineHeight: 1.5,
        }}>
          {/* icon + timestamp */}
          <span style={{ color:'#60c8c8', flexShrink:0, fontFamily:'monospace' }}>
            [◉][{ts}]
          </span>
          {/* from header */}
          <span style={{ color:'#d8eeee', flexShrink:0 }}>
            ** from (Cristian) in [{REAL}] ** :
          </span>
          {/* message text types in */}
          <span style={{ color:'#f0a040' }}>
            {MESSAGE.slice(0, msgChars)}
            {msgChars < MESSAGE.length && <span style={{opacity:0.5}}>|</span>}
          </span>
        </div>
      )}

      {/* ── World Name ── */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'center',
        gap:14, padding:'26px 24px 20px',
        fontSize:22, fontWeight:700, color:'#e8f4ff',
      }}>
        <span>World Name:</span>
        <div style={{
          background:'#c8dff0', border:'2px solid #8ab8d8', borderRadius:4,
          color:'#0a1a2a', fontWeight:700, fontSize:22,
          padding:'7px 20px', minWidth:160, textAlign:'center',
          letterSpacing:'0.04em',
        }}>
          {selected}
        </div>
      </div>

      {/* ── World cards on ground strip ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'flex-end', overflow:'hidden' }}>

        {/* cards row — pills sit above the ground */}
        <div style={{
          display:'flex', alignItems:'flex-end', gap:8,
          padding:'0 20px 10px',
          overflowX:'auto', overflowY:'visible',
          scrollbarWidth:'none',
        }}>
          {FAKE_WORLDS.map(name => {
            const active = selected === name
            return (
              <button key={name} onClick={() => clickFake(name)} style={{
                flexShrink: 0,
                background: active
                  ? 'linear-gradient(180deg,#9050e0,#5020a0)'
                  : 'linear-gradient(180deg,#6040a8,#3a2070)',
                border: `2px solid ${active ? '#a070e0' : '#5040a0'}`,
                borderRadius:5, color: active ? '#e0c8ff':'#b098d8',
                fontFamily:'inherit', fontWeight:700, fontSize:12,
                padding:'5px 14px', cursor:'pointer', whiteSpace:'nowrap',
                boxShadow:'0 2px 0 #1a1040',
                transition:'transform 0.15s',
              }}>
                {name}
              </button>
            )
          })}

          {/* P4rkour — always glowing, grows when others clicked */}
          <button
            onClick={() => setSelected(REAL)}
            style={{
              flexShrink: 0,
              transform: realScale,
              transformOrigin: 'bottom center',
              transition: 'transform 0.3s cubic-bezier(.34,1.56,.64,1)',
              background: 'linear-gradient(180deg,#b060ff,#7030c0)',
              border: '2px solid #d090ff',
              borderRadius: 5,
              color: '#f8e8ff',
              fontFamily: 'inherit', fontWeight:700, fontSize:14,
              padding:'5px 16px', cursor:'pointer', whiteSpace:'nowrap',
              boxShadow:'0 0 16px rgba(180,80,255,0.65), 0 3px 0 #3a0080',
              letterSpacing:'0.03em',
            }}
          >
            {REAL}
          </button>
        </div>

        {/* Ground strip — striped dirt blocks like inspo */}
        <div style={{ height:52, display:'flex', borderTop:'2px solid #2a1808', flexShrink:0 }}>
          {Array.from({length:40}).map((_,i) => (
            <div key={i} style={{
              flex:1,
              background: i%2===0 ? '#3d2010':'#452614',
              borderRight:'1px solid #2a1408',
              backgroundImage:'repeating-linear-gradient(135deg,rgba(0,0,0,0.08) 0px,rgba(0,0,0,0.08) 3px,transparent 3px,transparent 8px)',
            }}/>
          ))}
        </div>
      </div>

      {/* ── Buttons ── */}
      <div style={{
        display:'grid', gridTemplateColumns:'1fr 1fr', gap:10,
        padding:'10px 14px 14px',
        background:'rgba(4,10,20,0.85)',
        borderTop:'2px solid #1a3448',
      }}>
        {[
          { label:'Back',        cb: onBack,              lo:'#637282', hi:'#7a8e9e', sh:'#1a2a38' },
          { label:'Enter World', cb:()=>onEnter(REAL),    lo:'#5a7080', hi:'#7aaabf', sh:'#0a1a28' },
        ].map(({label,cb,lo,hi,sh}) => (
          <button key={label} onClick={cb}
            onMouseDown={e  => e.currentTarget.style.transform='translateY(3px)'}
            onMouseUp={e    => e.currentTarget.style.transform=''}
            onMouseLeave={e => e.currentTarget.style.transform=''}
            style={{
              background:`linear-gradient(180deg,${hi},${lo})`,
              border:`3px solid ${hi}`,
              borderRadius:8, color:'#f0f8ff',
              fontFamily:'inherit', fontWeight:700, fontSize:24,
              padding:'14px 0', cursor:'pointer',
              boxShadow:`0 5px 0 ${sh},0 8px 24px rgba(0,0,0,0.5)`,
              letterSpacing:'0.02em',
              transition:'transform 0.06s',
              textShadow:'0 2px 4px rgba(0,0,0,0.6)',
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
