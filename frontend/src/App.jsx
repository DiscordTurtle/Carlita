import React, { useEffect, useRef, useState } from 'react'
import TitleScreen from './components/TitleScreen.jsx'
import GameScene from './components/GameScene.jsx'

export default function App() {
  const [started, setStarted] = useState(false)
  const audioRef = useRef(null)

  // Single <audio> element shared across screens — swap src on transition.
  useEffect(() => {
    const a = new Audio('/sounds/about_theme.mp3')
    a.loop = true
    a.volume = 0.35
    audioRef.current = a
    // Try autoplay (many browsers will block until user gesture; that's fine —
    // the PLAY button click counts as the gesture and re-triggers play below).
    a.play().catch(() => {})
    return () => { a.pause(); a.src = '' }
  }, [])

  function handlePlay() {
    const a = audioRef.current
    if (a) {
      a.pause()
      a.src = '/sounds/theme.mp3'
      a.loop = true
      a.volume = 0.35
      a.play().catch(() => {})
    }
    setStarted(true)
  }

  // Ensure the title song actually starts on the user's first click,
  // in case autoplay was blocked.
  function handleFirstInteraction() {
    const a = audioRef.current
    if (a && a.paused && !started) a.play().catch(() => {})
  }

  return (
    <div className="relative w-full h-full" onClick={handleFirstInteraction}>
      {!started && <TitleScreen onPlay={handlePlay} />}
      {started  && <GameScene />}
    </div>
  )
}
