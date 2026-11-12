import React, { useEffect, useRef, useState } from 'react'
import TitleScreen from './components/TitleScreen.jsx'
import GameScene from './components/GameScene.jsx'
import WorldSelector from './components/WorldSelector.jsx'
import GridWorld from './components/GridWorld.jsx'
import { PARKOUR_MAP, SPAWN } from './maps/parkourMap.js'
import { getMasterVolume, subscribeToMasterVolume } from './useAudio.js'

// Screens: 'title' → 'worldselect' → 'parkour' → 'game'
const SPLIT_DURATION_MS = 3300

export default function App() {
  const [screen,   setScreen]   = useState('title')
  const [splitting, setSplitting] = useState(false)
  const audioRef = useRef(null)

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
      {screen === 'game'        && <GameScene />}
      {screen === 'parkour'     && <GridWorld map={PARKOUR_MAP} spawn={SPAWN} onComplete={() => setScreen('game')} />}
      {screen === 'worldselect' && <WorldSelector onBack={() => setScreen('title')} onEnter={() => setScreen('parkour')} />}
      {titleVisible && <TitleScreen onPlay={handlePlay} splitting={splitting} />}
    </div>
  )
}
