import { useEffect, useRef } from 'react'

const cache = new Map()
let masterVolume = 0.1
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

export function playSfx(src, { volume = 0.7, rate = 1, startTime = 0, duration } = {}) {
  try {
    const effectiveVolume = clampVolume(volume * masterVolume)
    const base = getAudio(src, effectiveVolume)
    const a = base.cloneNode()
    a.volume = effectiveVolume
    a.playbackRate = rate
    if (startTime) a.currentTime = startTime
    a.play().catch(() => {})
    if (duration) setTimeout(() => { try { a.pause() } catch {} }, duration * 1000)
  } catch {}
}

let _bgAudio = null
export function registerBgAudio(a) { _bgAudio = a }
export function swapBgMusic(src) {
  if (!_bgAudio) return
  _bgAudio.pause()
  _bgAudio.src = src
  _bgAudio.loop = true
  _bgAudio.volume = 0.35 * masterVolume
  _bgAudio.play().catch(() => {})
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
