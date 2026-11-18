import React, { useEffect, useRef, useState } from 'react'
import TitleScreen from './components/TitleScreen.jsx'
import GameScene from './components/GameScene.jsx'
import WorldSelector from './components/WorldSelector.jsx'
import GridWorld from './components/GridWorld.jsx'
import CristianTreeScene from './components/CristianTreeScene.jsx'
import { getMasterVolume, playSfx, subscribeToMasterVolume } from './useAudio.js'

// Screens: 'title' → 'worldselect' → 'cristiantree' → 'worldselect' → 'parkour' (pick seed) → 'worldselect' → 'game'
const SPLIT_DURATION_MS = 3300

const BASE_LOG = [
  { t:'07:24:58', msg:'Where would you like to go? (59,342 online)' },
  { t:'07:41:23', msg:'Where would you like to go? (61,861 online)' },
  { t:'07:41:28', msg:'Logging on ...' },
  { t:'07:43:48', msg:'Where would you like to go? (61,004 online)' },
  { t:'07:48:17', msg:"You haven't set a home world yet!" },
]

const PHASE_WHISPERS = {
  1: { sender: 'Cristian',   world: 'CRISTIAN_FARM', text: "Heyyy! La multi ani!!! Ti-am pregatit cadoul de ziua ta, suarec! Te astept aici!",                        color: '#f0c060', icon: '#4a88b8' },
  2: { sender: 'XxRapeWizardxX', world: 'P4rkour',       text: "Hahaha, n-o să-ți mai vezi iubitul niciodată! 😈 Sunt de negăsit!!! MUAAHAHAHAAHAH!", color: '#ff9090', icon: '#c060ff',
       followUp: { sender: 'XxRapeWizardxX', world: 'JAMMED', text: "WTF, am uitat să activez Jammerul de ultima oară când am ținut drop game!... TOT NU MĂ VEI GĂSI NICIODATĂ!", color: '#ff9090', icon: '#c060ff' } },
  3: { sender: 'Cristian',   world: 'CRISTIAN_FARM', text: "Mersi onkey drag ca m-ai salvat! Dar am o alta problema :(. Poti veni te rog la mine?", color: '#f0c060', icon: '#4a88b8' },
}

export default function App() {
  const [screen,           setScreen]           = useState('title')
  const [splitting,        setSplitting]        = useState(false)
  const [worldPhase,       setWorldPhase]       = useState(1)
  const [hasSeed,          setHasSeed]          = useState(false)
  const [wizardKilled,     setWizardKilled]     = useState(false)
  const [extraLog,         setExtraLog]         = useState([])
  const [farmVisited,      setFarmVisited]      = useState(false)
  const [chatH,            setChatH]            = useState(0)
  const [typingChars,      setTypingChars]      = useState(0)
  const [liveChat,         setLiveChat]         = useState(null)
  const [whisperCommitted, setWhisperCommitted] = useState(false)
  const [fuChars,          setFuChars]          = useState(0)
  const chatTypingTsRef    = useRef(null)
  const whisperDoneRef     = useRef(false)
  const skipPhase2Ref      = useRef(false)
  const fuTsRef            = useRef(null)
  const fuDoneRef          = useRef(false)
  const chatLogRef         = useRef(null)
  const chatDragStartY     = useRef(0)
  const chatDragStartH     = useRef(0)
  const audioRef = useRef(null)

  function addLog(entry) {
    setExtraLog(prev => [...prev, entry])
  }

  // Called by CristianTreeScene for live-typed player/PM messages
  function onChatMsg({ t, msg, color, icon, done, commit = true }) {
    if (done) {
      if (msg && commit) addLog({ t, msg, color })
      setLiveChat(null)
    } else {
      setLiveChat({ t, msg, color, icon })
    }
  }

  // Start typing the phase whisper when worldPhase changes
  useEffect(() => {
    chatTypingTsRef.current = new Date().toTimeString().slice(0, 8)
    fuTsRef.current = null
    fuDoneRef.current = false
    setFuChars(0)
    setChatH(h => Math.max(h, 62))
    if (skipPhase2Ref.current && worldPhase === 2) {
      // Wizard message already typed + committed live in CristianTreeScene; skip re-type
      skipPhase2Ref.current = false
      whisperDoneRef.current = true
      setTypingChars(0)
      setWhisperCommitted(false)
      setTimeout(() => setWhisperCommitted(true), 200)
    } else {
      whisperDoneRef.current = false
      setTypingChars(0)
      setWhisperCommitted(false)
    }
  }, [worldPhase])

  // Typewriter effect for phase whisper
  const pw = PHASE_WHISPERS[worldPhase]
  const fullWhisper = pw ? `[${chatTypingTsRef.current || '00:00:00'}] ** from (${pw.sender}) in [${pw.world}] ** : ${pw.text}` : ''
  useEffect(() => {
    if (whisperDoneRef.current || typingChars >= fullWhisper.length) return
    const delay = typingChars === 0 ? 900 : 35
    const id = setTimeout(() => {
      setTypingChars(n => {
        if (n === 0) playSfx('/sounds/whisper.mp3')
        return n + 1
      })
    }, delay)
    return () => clearTimeout(id)
  }, [typingChars, fullWhisper.length])

  // Commit whisper to extraLog when it finishes typing (so it persists across phase changes)
  useEffect(() => {
    if (whisperDoneRef.current || typingChars === 0 || !pw || typingChars < fullWhisper.length) return
    whisperDoneRef.current = true
    addLog({ t: chatTypingTsRef.current || '00:00:00', msg: `** from (${pw.sender}) in [${pw.world}] ** : ${pw.text}`, color: pw.color })
    setWhisperCommitted(true)
  }, [typingChars])

  // Start follow-up message after first whisper commits
  const fu = pw?.followUp
  useEffect(() => {
    if (!whisperCommitted || !fu || fuDoneRef.current) return
    const id = setTimeout(() => { fuTsRef.current = new Date().toTimeString().slice(0, 8); setFuChars(1) }, 1200)
    return () => clearTimeout(id)
  }, [whisperCommitted])

  const fullFu = fu ? `[${fuTsRef.current || '00:00:00'}] ** from (${fu.sender}) in [${fu.world}] ** : ${fu.text}` : ''
  useEffect(() => {
    if (!fu || fuDoneRef.current || fuChars === 0 || fuChars >= fullFu.length) return
    const id = setTimeout(() => setFuChars(n => n + 1), 35)
    return () => clearTimeout(id)
  }, [fuChars, fullFu.length])

  useEffect(() => {
    if (!fu || fuDoneRef.current || fuChars === 0 || fuChars < fullFu.length) return
    fuDoneRef.current = true
    addLog({ t: fuTsRef.current || '00:00:00', msg: `** from (${fu.sender}) in [${fu.world}] ** : ${fu.text}`, color: fu.color })
  }, [fuChars])

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatLogRef.current) chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight
  }, [extraLog.length, typingChars, fuChars, liveChat?.msg])

  function handleChatDragStart(e) {
    chatDragStartY.current = e.clientY
    chatDragStartH.current = chatH
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function handleChatDragMove(e) {
    if (!e.buttons) return
    setChatH(Math.max(0, Math.min(300, chatDragStartH.current + (e.clientY - chatDragStartY.current))))
  }

  // Route by world name so clicking any pill + Enter World goes to the right screen
  function enterWorld(worldName) {
    if (worldName === 'CRISTIAN_FARM') {
      setScreen(wizardKilled ? 'game' : 'cristiantree')
    } else if (worldName === 'P4rkour') {
      setScreen('parkour')
    }
    // other worlds: no-op for now
  }

  useEffect(() => {
    const a = new Audio('/sounds/about_theme.mp3')
    a.loop = true
    a.volume = 0.35 * getMasterVolume()
    audioRef.current = a
    a.play().catch(() => {})

    const updateVolume = () => { if (a) a.volume = 0.35 * getMasterVolume() }
    updateVolume()
    const unsubscribe = subscribeToMasterVolume(updateVolume)
    return () => { unsubscribe(); a.pause(); a.src = '' }
  }, [])

  function handlePlay() {
    if (splitting || screen !== 'title') return
    const a = audioRef.current
    if (a) {
      a.pause()
      a.src = '/sounds/theme.mp3'
      a.loop = true
      a.volume = 0.35 * getMasterVolume()
      a.play().catch(() => {})
    }
    setScreen('worldselect')   // mount behind the split so it's revealed, not swapped in
    setSplitting(true)
    setTimeout(() => setSplitting(false), SPLIT_DURATION_MS)
  }

  function handleFirstInteraction() {
    const a = audioRef.current
    if (a && a.paused && screen === 'title' && !splitting) a.play().catch(() => {})
  }

  const titleVisible = screen === 'title' || splitting  // stays up during split regardless of screen

  const persistentChat = !titleVisible && (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, pointerEvents: 'none' }}>
      {chatH > 0 && (
        <div ref={chatLogRef} style={{ height: chatH, overflowY: 'auto', background: 'rgba(2,10,22,0.93)', borderBottom: '2px solid #1a5878', padding: '5px 10px', fontSize: 12.5, lineHeight: 1.8, color: '#9ac0de', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          {[...BASE_LOG, ...extraLog].map(({ t, msg, color }, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ color: '#4a88b8', fontSize: 14, flexShrink: 0 }}>ⓘ</span>
              <span style={{ color: color || undefined }}>[{t}] {msg}</span>
            </div>
          ))}
          {typingChars > 0 && pw && typingChars < fullWhisper.length && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <span style={{ color: pw.icon, fontSize: 14, flexShrink: 0 }}>ⓘ</span>
              <span style={{ color: pw.color }}>
                {fullWhisper.slice(0, typingChars)}
                <span style={{ opacity: 0.4 }}>|</span>
              </span>
            </div>
          )}
          {fuChars > 0 && fu && fuChars < fullFu.length && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <span style={{ color: fu.icon, fontSize: 14, flexShrink: 0 }}>ⓘ</span>
              <span style={{ color: fu.color }}>
                {fullFu.slice(0, fuChars)}
                <span style={{ opacity: 0.4 }}>|</span>
              </span>
            </div>
          )}
          {liveChat && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <span style={{ color: liveChat.icon, fontSize: 14, flexShrink: 0 }}>ⓘ</span>
              <span style={{ color: liveChat.color }}>
                [{liveChat.t}] {liveChat.msg}
                <span style={{ opacity: 0.4 }}>|</span>
              </span>
            </div>
          )}
        </div>
      )}
      <div
        onPointerDown={handleChatDragStart}
        onPointerMove={handleChatDragMove}
        style={{ height: 18, background: 'rgba(2,10,22,0.85)', borderBottom: '2px solid #1a5878', cursor: screen === 'worldselect' ? 'default' : 'ns-resize', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: screen === 'worldselect' ? 'none' : 'all', userSelect: 'none' }}
      >
        <div style={{ width: 36, height: 3, background: 'rgba(74,136,184,0.6)', borderRadius: 99 }} />
      </div>
    </div>
  )

  return (
    <div className="relative w-full h-full" onClick={handleFirstInteraction}>
      {screen === 'game'          && <GameScene fromParkour={hasSeed} />}
      {screen === 'parkour'       && <GridWorld
          onComplete={() => { setWorldPhase(3); addLog({ t: new Date().toTimeString().slice(0,8), msg: 'You have left P4rkour.', color: '#80c8a0' }); setScreen('worldselect') }}
          onSeedPickup={() => { setHasSeed(true); setWizardKilled(true); addLog({ t: new Date().toTimeString().slice(0,8), msg: 'You picked up: Love Seed.', color: '#80ee80' }) }}
          onMenu={() => setScreen('worldselect')}
          onChatMsg={onChatMsg}
        />}
      {screen === 'cristiantree'  && (
        <CristianTreeScene
          firstVisit={!farmVisited}
          worldPhase={worldPhase}
          onCinematicEnd={() => { setFarmVisited(true); skipPhase2Ref.current = true; setWorldPhase(2) }}
          onMenu={() => setScreen('worldselect')}
          onComplete={() => setScreen(worldPhase === 3 ? 'game' : 'worldselect')}
          onChatMsg={onChatMsg}
        />
      )}
      {screen === 'worldselect'   && (
        <WorldSelector
          phase={worldPhase}
          chatBarH={chatH + 18}
          onBack={() => setScreen('title')}
          onEnterWorld={enterWorld}
        />
      )}
      {titleVisible && <TitleScreen onPlay={handlePlay} splitting={splitting} />}
      {persistentChat}
    </div>
  )
}
