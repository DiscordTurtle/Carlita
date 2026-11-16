import React, { useEffect, useRef, useState } from 'react'
import TitleScreen from './components/TitleScreen.jsx'
import GameScene from './components/GameScene.jsx'
import WorldSelector from './components/WorldSelector.jsx'
import GridWorld from './components/GridWorld.jsx'
import CristianTreeScene from './components/CristianTreeScene.jsx'
import { getMasterVolume, subscribeToMasterVolume } from './useAudio.js'

// Screens: 'title' → 'worldselect' → 'cristiantree' → 'worldselect' → 'parkour' → 'worldselect' → 'game'
const SPLIT_DURATION_MS = 3300

export default function App() {
  const [screen,           setScreen]           = useState('title')
  const [splitting,        setSplitting]        = useState(false)
  const [worldPhase,       setWorldPhase]       = useState(1)
  const [hasSeed,          setHasSeed]          = useState(false)
  const [extraLog,         setExtraLog]         = useState([])
  const [farmVisited,      setFarmVisited]      = useState(false)
  const audioRef = useRef(null)

  function addLog(entry) {
    setExtraLog(prev => [...prev, entry])
  }

  // Route by world name so clicking any pill + Enter World goes to the right screen
  function enterWorld(worldName) {
    if (worldName === 'CRISTIAN_FARM') {
      if (worldPhase === 3) setScreen('game')
      else { setScreen('cristiantree') }
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

  return (
    <div className="relative w-full h-full" onClick={handleFirstInteraction}>
      {screen === 'game'          && <GameScene fromParkour={hasSeed} />}
      {screen === 'parkour'       && <GridWorld onComplete={() => { setHasSeed(true); setWorldPhase(3); addLog({ t: new Date().toTimeString().slice(0,8), msg: 'You have left P4rkour.', color: '#80c8a0' }); setScreen('worldselect') }} onMenu={() => setScreen('worldselect')} />}
      {screen === 'cristiantree'  && (
        <CristianTreeScene
          firstVisit={!farmVisited}
          onCinematicEnd={() => { setFarmVisited(true); setWorldPhase(2); addLog({ t: new Date().toTimeString().slice(0,8), msg: 'Cristian a dispărut din CRISTIAN_FARM!', color: '#ff8888' }) }}
          onMenu={() => setScreen('worldselect')}
          onComplete={() => setScreen('worldselect')}
        />
      )}
      {screen === 'worldselect'   && (
        <WorldSelector
          phase={worldPhase}
          extraLog={extraLog}
          onBack={() => setScreen('title')}
          onEnterWorld={enterWorld}
        />
      )}
      {titleVisible && <TitleScreen onPlay={handlePlay} splitting={splitting} />}
    </div>
  )
}
