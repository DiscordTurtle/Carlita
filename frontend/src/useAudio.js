import { useEffect, useRef } from 'react'

const cache = new Map()
function getAudio(src, volume = 0.7) {
  let a = cache.get(src)
  if (!a) {
    a = new Audio(src)
    a.volume = volume
    cache.set(src, a)
  }
  return a
}

export function playSfx(src, { volume = 0.7, rate = 1 } = {}) {
  try {
    const base = getAudio(src, volume)
    const a = base.cloneNode()
    a.volume = volume
    a.playbackRate = rate
    a.play().catch(() => {})
  } catch {}
}

export function useMusic(src, { enabled, volume = 0.35 }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!enabled) return
    const a = new Audio(src)
    a.loop = true
    a.volume = volume
    a.play().catch(() => {})
    ref.current = a
    return () => { a.pause(); a.src = '' }
  }, [enabled, src, volume])
  return ref
}
