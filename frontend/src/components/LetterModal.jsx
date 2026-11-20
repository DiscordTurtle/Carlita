import React, { useEffect, useRef, useState } from 'react'
import { LETTER_LINES, ENDING_IMAGE } from '../letter.js'
import { playSfx } from '../useAudio.js'

export default function LetterModal({ onClose, errorMode = false }) {
  const [shown,       setShown]       = useState(0)
  const [showImage,   setShowImage]   = useState(false)
  const [imgFailed,   setImgFailed]   = useState(false)
  const [glitching,   setGlitching]   = useState(false)
  const [cristianMsg, setCristianMsg] = useState(false)
  const timer = useRef(null)

  // reveal next line
  const reveal = () => {
    if (errorMode) return
    if (shown < LETTER_LINES.length) {
      setShown(s => s + 1)
      playSfx('/sounds/dialog-open.wav', { volume: 0.5 })
    } else if (!showImage) {
      setShowImage(true)
      playSfx('/sounds/achievement.wav', { volume: 0.6 })
    }
  }

  // auto-advance lines (skip in error mode), then glitch after photo appears
  useEffect(() => {
    if (errorMode) { playSfx('/sounds/dialog-open.wav', { volume: 0.7 }); return }
    playSfx('/sounds/dialog-open.wav', { volume: 0.7 })
    timer.current = setInterval(() => {
      setShown(s => {
        if (s < LETTER_LINES.length) {
          playSfx('/sounds/blip.wav', { volume: 0.35 })
          return s + 1
        }
        clearInterval(timer.current)
        setShowImage(true)
        return s
      })
    }, 1500)
    return () => clearInterval(timer.current)
  }, [errorMode])

  // start glitch 4s after photo appears
  useEffect(() => {
    if (!showImage) return
    const t1 = setTimeout(() => setGlitching(true), 4000)
    const t2 = setTimeout(() => setCristianMsg(true), 6000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [showImage])

  if (errorMode) {
    return (
      <div
        className="absolute inset-0 z-[200] flex items-center justify-center"
        style={{ background: 'radial-gradient(circle at center, rgba(0,0,0,.55), rgba(0,0,0,.85))' }}
      >
        <div className="gt-panel w-[min(640px,92vw)] p-6 md:p-8" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 24 }}>♥</span>
              <h2 className="text-2xl font-black text-[#3A1F0C]">A Letter for Carlita</h2>
            </div>
            <button
              className="text-[#3A1F0C] font-black opacity-70 hover:opacity-100"
              onClick={() => { playSfx('/sounds/dialog-close.wav'); onClose() }}
              aria-label="Close"
            >✕</button>
          </div>
          <div className="space-y-3 min-h-[120px] flex items-center justify-center">
            <p className="text-[#3A1F0C] text-2xl font-black">Eroare :(</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="absolute inset-0 z-[200] flex items-center justify-center"
      style={{ background: 'radial-gradient(circle at center, rgba(0,0,0,.55), rgba(0,0,0,.85))' }}
      onClick={reveal}
    >
      <div
        className="gt-panel w-[min(640px,92vw)] p-6 md:p-8"
        style={{ animation: glitching ? 'letterGlitch 0.4s infinite' : 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 24 }}>♥</span>
            <h2 className="text-2xl font-black text-[#3A1F0C]">A Letter for Carlita</h2>
          </div>
          <button
            className="text-[#3A1F0C] font-black opacity-70 hover:opacity-100"
            onClick={() => { playSfx('/sounds/dialog-close.wav'); onClose() }}
            aria-label="Close"
          >✕</button>
        </div>

        <div className="space-y-3 min-h-[220px]">
          {LETTER_LINES.slice(0, shown).map((line, i) => (
            <p key={i} className="text-[#3A1F0C] text-lg md:text-xl font-semibold animate-fade-up">
              {line}
            </p>
          ))}
          {shown < LETTER_LINES.length && (
            <div className="text-[#5A3416]/60 text-xs italic mt-2">click to continue…</div>
          )}
        </div>

        {showImage && (
          <div className="mt-6 animate-fade-up">
            <div className="relative mx-auto rounded-xl overflow-hidden border-4 border-[#5A3416] shadow-xl"
                 style={{ width: '100%', maxWidth: 420, aspectRatio: '4 / 3', background: '#FFF3C4' }}>
              {!imgFailed && (
                <img
                  src={ENDING_IMAGE}
                  alt="Carlita & Cristian"
                  className="w-full h-full object-cover"
                  onError={() => setImgFailed(true)}
                />
              )}
              {imgFailed && (
                <div className="absolute inset-0 flex items-center justify-center text-[#5A3416] font-bold text-center px-4">
                  <span className="bg-[#FFFBEA]/80 px-3 py-2 rounded">Drop your photo at <code>public/us.jpg</code></span>
                </div>
              )}
            </div>
            <div className="text-center mt-4 text-[#3A1F0C] font-bold">La mulți ani, Carlita! ♥</div>
          </div>
        )}
      </div>

      {/* Cristian's "I had bugs" dialogue over glitched letter */}
      {cristianMsg && (
        <div
          style={{ position:'absolute', bottom:'12%', left:'50%', transform:'translateX(-50%)', background:'rgba(10,20,40,0.95)', border:'2px solid #5080b0', borderRadius:8, padding:'14px 22px', maxWidth:400, textAlign:'center', zIndex:10 }}
          onClick={(e) => { e.stopPropagation(); playSfx('/sounds/dialog-close.wav'); onClose() }}
        >
          <div style={{ fontSize:13, color:'#80aacc', marginBottom:6 }}>Cristian of Legend</div>
          <div style={{ fontSize:16, color:'#e8f4ff', lineHeight:1.6 }}>
            Ce naiba?! Ah... știam că aveam bug-uri, bine că am o copie! 📜
          </div>
          <div style={{ fontSize:11, color:'#608090', marginTop:8 }}>click to close</div>
        </div>
      )}
    </div>
  )
}
