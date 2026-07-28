import { useEffect, useRef } from 'react'

const cache = new Map()
let masterVolume = 1
const volumeListeners = new Set()

function clampVolume(v) {
  return Math.max(0, Math.min(1, v))
}

function getAudio(src, volume = 0.7) {
  let a = cache.get(src)
  if (!a) {
    a = new Audio(src)
    a.volume = volume
    cache.set(src, a)
  }
  return a
}

export function getMasterVolume() {
  return masterVolume
}

export function setMasterVolume(v) {
  masterVolume = clampVolume(v)
  volumeListeners.forEach((listener) => listener(masterVolume))
}

export function subscribeToMasterVolume(listener) {
  volumeListeners.add(listener)
  return () => volumeListeners.delete(listener)
}

export function playSfx(src, { volume = 0.7, rate = 1 } = {}) {
  try {
    const effectiveVolume = clampVolume(volume * masterVolume)
    const base = getAudio(src, effectiveVolume)
    const a = base.cloneNode()
    a.volume = effectiveVolume
    a.playbackRate = rate
    a.play().catch(() => {})
  } catch {}
}

export function useMusic(src, { enabled, volume = 0.35 }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!enabled) return
    const effectiveVolume = clampVolume(volume * masterVolume)
    const a = new Audio(src)
    a.loop = true
    a.volume = effectiveVolume
    a.play().catch(() => {})
    ref.current = a
    return () => { a.pause(); a.src = '' }
  }, [enabled, src, volume])
  return ref
}
