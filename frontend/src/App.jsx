import React, { useEffect, useRef, useState } from 'react'
import TitleScreen from './components/TitleScreen.jsx'
import GameScene from './components/GameScene.jsx'

const SPLIT_DURATION_MS = 1100  // matches .split-half transition in index.css

export default function App() {
  const [splitting, setSplitting] = useState(false)  // split transition in progress
  const [started,   setStarted]   = useState(false)  // game scene fully revealed
  const audioRef = useRef(null)

  useEffect(() => {
    const a = new Audio('/sounds/about_theme.mp3')
    a.loop = true
    a.volume = 0.35
    audioRef.current = a
    a.play().catch(() => {})
    return () => { a.pause(); a.src = '' }
  }, [])

  function handlePlay() {
    if (splitting || started) return
    // Music swap on the same gesture so browsers allow it.
    const a = audioRef.current
    if (a) {
      a.pause()
      a.src = '/sounds/theme.mp3'
      a.loop = true
      a.volume = 0.35
      a.play().catch(() => {})
    }
    // Mount GameScene behind, then start the split slide.
    setSplitting(true)
    // Once the slide finishes, drop the title screen entirely.
    setTimeout(() => setStarted(true), SPLIT_DURATION_MS)
  }

  function handleFirstInteraction() {
    const a = audioRef.current
    if (a && a.paused && !started && !splitting) a.play().catch(() => {})
  }

  // GameScene mounts as soon as the split begins so the slide reveals it
  // gradually instead of swapping in only at the end.
  const gameMounted = started || splitting
  // Title stays mounted until the split fully completes.
  const titleVisible = !started

  return (
    <div className="relative w-full h-full" onClick={handleFirstInteraction}>
      {gameMounted  && <GameScene />}
      {titleVisible && <TitleScreen onPlay={handlePlay} splitting={splitting} />}
    </div>
  )
}
