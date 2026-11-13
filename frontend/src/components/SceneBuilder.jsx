import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AUTOTILE, autotileCSS } from '../autotile.js'

// Standalone scene builder using all Growtopia sprites.
// Usage in main.jsx:
//   import SceneBuilder from './components/SceneBuilder.jsx'
//   ReactDOM.createRoot(...).render(<SceneBuilder />)

const MANIFEST = '/sprites/blocks/all-manifest.json'
const BASE_URL = '/sprites/blocks/all/'

const DEFAULT_W = 20
const DEFAULT_H = 15
const DEFAULT_TILE = 32
const MAX_SHOWN = 300
const LS_KEY = 'sceneBuilder_scenes'

function makeGrid(w, h) {
  return Array.from({ length: h }, () => Array(w).fill(null))
}

function loadScenes()   { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { return {} } }
function saveScenes(db) { localStorage.setItem(LS_KEY, JSON.stringify(db)) }

export default function SceneBuilder() {
  const [sprites,  setSprites]  = useState([])
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState(null)
  const [grid,     setGrid]     = useState(() => makeGrid(DEFAULT_W, DEFAULT_H))
  const [gridW,    setGridW]    = useState(DEFAULT_W)
  const [gridH,    setGridH]    = useState(DEFAULT_H)
  const [tileSize, setTileSize] = useState(DEFAULT_TILE)
  const [hover,     setHover]    = useState(null)
  const [sceneName, setSceneName] = useState('')
  const [scenes,    setScenes]    = useState(loadScenes)
  const [showLoad,  setShowLoad]  = useState(false)
  const [tool,        setTool]       = useState('pencil')
  const [weather,     setWeather]    = useState('sunny')
  const [showGrid,    setShowGrid]   = useState(true)
  const [rectPreview, setRectPreview] = useState(null)  // { r1,c1,r2,c2 } while rect-dragging
  const painting   = useRef(false)
  const erasing    = useRef(false)
  const scrollRef  = useRef(null)
  const dragRef    = useRef(null)   // { x, y, sl, st } while hand-dragging
  const rectStart  = useRef(null)   // { r, c } start cell for rect tool
  const gridRef    = useRef(grid)   // kept in sync for stable undo callbacks
  const historyRef = useRef([])     // undo stack (max 40 snapshots)
  const redoRef    = useRef([])     // redo stack

  useEffect(() => {
    fetch(MANIFEST).then(r => r.json()).then(list => {
      setSprites(list)
      setSelected(list[0] ?? null)
    })
  }, [])

  useEffect(() => { gridRef.current = grid }, [grid])

  useEffect(() => {
    if (!showLoad) return
    const close = e => { if (!e.target.closest('[data-load-menu]')) setShowLoad(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [showLoad])

  // Wheel zoom — must be non-passive to call preventDefault
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handler = e => {
      e.preventDefault()
      setTileSize(prev => Math.max(8, Math.min(128, prev - Math.sign(e.deltaY) * 2)))
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  })

  const pushHistory = useCallback(() => {
    historyRef.current = [...historyRef.current.slice(-39), gridRef.current.map(r => [...r])]
    redoRef.current = []
  }, [])

  const undo = useCallback(() => {
    if (!historyRef.current.length) return
    redoRef.current = [gridRef.current.map(r => [...r]), ...redoRef.current.slice(0, 39)]
    const prev = historyRef.current[historyRef.current.length - 1]
    historyRef.current = historyRef.current.slice(0, -1)
    setGrid(prev)
    setGridW(prev[0]?.length ?? DEFAULT_W)
    setGridH(prev.length)
  }, [])

  const redo = useCallback(() => {
    if (!redoRef.current.length) return
    historyRef.current = [...historyRef.current.slice(-39), gridRef.current.map(r => [...r])]
    const next = redoRef.current[0]
    redoRef.current = redoRef.current.slice(1)
    setGrid(next)
    setGridW(next[0]?.length ?? DEFAULT_W)
    setGridH(next.length)
  }, [])

  useEffect(() => {
    const handler = e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo() }
      if (e.key === 'g' || e.key === 'G') setShowGrid(v => !v)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])

  const filtered = search.trim()
    ? sprites.filter(s => s.includes(search.trim().toLowerCase()))
    : sprites

  // Resize grid, preserving existing tiles
  const resize = useCallback((w, h) => {
    pushHistory()
    setGrid(prev => Array.from({ length: h }, (_, r) =>
      Array.from({ length: w }, (_, c) => prev[r]?.[c] ?? null)
    ))
    setGridW(w)
    setGridH(h)
  }, [pushHistory])

  const paint = useCallback((r, c, erase) => {
    setGrid(prev => {
      const next = prev.map(row => [...row])
      if (next[r]?.[c] !== undefined) next[r][c] = erase ? null : selected
      return next
    })
  }, [selected])

  const onCellDown = (r, c, e) => {
    if (tool === 'hand') return
    e.preventDefault()
    if (tool === 'rect') {
      pushHistory()
      rectStart.current = { r, c, erase: e.button === 2 }
      setRectPreview({ r1: r, c1: c, r2: r, c2: c })
      return
    }
    pushHistory()
    painting.current = true
    erasing.current  = e.button === 2
    paint(r, c, erasing.current)
  }
  const onCellEnter = (r, c) => {
    setHover({ r, c })
    if (tool === 'rect' && rectStart.current) {
      setRectPreview({
        r1: Math.min(rectStart.current.r, r), c1: Math.min(rectStart.current.c, c),
        r2: Math.max(rectStart.current.r, r), c2: Math.max(rectStart.current.c, c),
      })
      return
    }
    if (tool === 'pencil' && painting.current) paint(r, c, erasing.current)
  }
  const stopPainting = () => {
    if (tool === 'rect' && rectStart.current && rectPreview) {
      const { r1, c1, r2, c2 } = rectPreview
      const erase = rectStart.current.erase
      setGrid(prev => {
        const next = prev.map(row => [...row])
        for (let r = r1; r <= r2; r++)
          for (let c = c1; c <= c2; c++)
            if (next[r]?.[c] !== undefined) next[r][c] = erase ? null : selected
        return next
      })
    }
    rectStart.current = null
    setRectPreview(null)
    painting.current = false
  }

  const onHandDown = e => {
    if (tool !== 'hand') return
    dragRef.current = { x: e.clientX, y: e.clientY, sl: scrollRef.current.scrollLeft, st: scrollRef.current.scrollTop }
    scrollRef.current.style.cursor = 'grabbing'
  }
  const onHandMove = e => {
    if (!dragRef.current) return
    scrollRef.current.scrollLeft = dragRef.current.sl - (e.clientX - dragRef.current.x)
    scrollRef.current.scrollTop  = dragRef.current.st - (e.clientY - dragRef.current.y)
  }
  const onHandUp = () => {
    if (!dragRef.current) return
    dragRef.current = null
    scrollRef.current.style.cursor = tool === 'hand' ? 'grab' : 'crosshair'
  }

  // Save scene
  const saveScene = () => {
    const name = sceneName.trim()
    if (!name) return
    const db = { ...scenes, [name]: grid }
    setScenes(db)
    saveScenes(db)
  }

  // Load scene
  const loadScene = name => {
    const saved = scenes[name]
    if (!saved) return
    setGrid(saved)
    setGridH(saved.length)
    setGridW(saved[0]?.length ?? DEFAULT_W)
    setShowLoad(false)
  }

  // Delete scene
  const deleteScene = name => {
    const db = { ...scenes }
    delete db[name]
    setScenes(db)
    saveScenes(db)
  }

  // Export JSON
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(grid)], { type: 'application/json' })
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'scene.json' })
    a.click()
  }

  // Export PNG via offscreen canvas
  const exportPNG = async () => {
    const canvas = document.createElement('canvas')
    canvas.width  = gridW * tileSize
    canvas.height = gridH * tileSize
    const ctx = canvas.getContext('2d')

    const load = src => new Promise(res => {
      const img = new Image()
      img.onload  = () => res(img)
      img.onerror = () => res(null)
      img.src = src
    })

    // Draw weather background first
    const bgImg = await load(`/weather/${weather}.png`)
    if (bgImg) {
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height)
    } else {
      ctx.fillStyle = '#020809'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    for (let r = 0; r < gridH; r++) {
      for (let c = 0; c < gridW; c++) {
        const name = grid[r][c]
        if (!name) continue
        const img = await load(BASE_URL + name)
        if (img) ctx.drawImage(img, c * tileSize, r * tileSize, tileSize, tileSize)
      }
    }

    const a = Object.assign(document.createElement('a'), { href: canvas.toDataURL('image/png'), download: 'scene.png' })
    a.click()
  }

  const shown = filtered.slice(0, MAX_SHOWN)

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#1a1a2e', color: '#e0e0e0', fontFamily: 'monospace', fontSize: 13 }}
      onMouseUp={stopPainting}
      onMouseLeave={stopPainting}
    >
      {/* Top bar */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 12px', background: '#13132a', borderBottom: '1px solid #333', flexWrap: 'wrap' }}>
        <strong style={{ color: '#aef' }}>Scene Builder</strong>
        <label>W <input type="number" min={1} max={80} value={gridW} onChange={e => resize(Number(e.target.value) || 1, gridH)}
          style={{ width: 48, background: '#222', color: '#eee', border: '1px solid #555', padding: '2px 4px' }} /></label>
        <label>H <input type="number" min={1} max={60} value={gridH} onChange={e => resize(gridW, Number(e.target.value) || 1)}
          style={{ width: 48, background: '#222', color: '#eee', border: '1px solid #555', padding: '2px 4px' }} /></label>
        <button onClick={() => resize(100, 54)}
          style={{ padding: '4px 10px', background: '#1a2a1a', border: '1px solid #446633', color: '#cec', cursor: 'pointer', fontSize: 11 }}>
          100×54 (GT)
        </button>
        <span style={{ width: 1, background: '#444', alignSelf: 'stretch', margin: '0 4px' }} />
        {[['pencil', '✏️'], ['rect', '⬜'], ['hand', '✋']].map(([t, icon]) => (
          <button key={t} onClick={() => setTool(t)} title={t}
            style={{ padding: '4px 10px', fontSize: 16, cursor: 'pointer', background: tool === t ? '#2a3a5a' : '#1a1a2e', border: `1px solid ${tool === t ? '#6688cc' : '#444'}`, color: '#eee' }}>
            {icon}
          </button>
        ))}
        <button onClick={() => setShowGrid(v => !v)} title="Toggle grid (G)"
          style={{ padding: '4px 10px', fontSize: 14, cursor: 'pointer', background: showGrid ? '#2a3a5a' : '#1a1a2e', border: `1px solid ${showGrid ? '#6688cc' : '#444'}`, color: '#eee' }}>
          #
        </button>
        <span style={{ width: 1, background: '#444', alignSelf: 'stretch', margin: '0 4px' }} />
        <input
          type="text"
          placeholder="scene name"
          value={sceneName}
          onChange={e => setSceneName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && saveScene()}
          style={{ width: 110, background: '#222', color: '#eee', border: '1px solid #555', padding: '2px 6px' }}
        />
        <button onClick={saveScene}
          style={{ padding: '4px 10px', background: '#2a2a1a', border: '1px solid #666633', color: '#ffe', cursor: 'pointer' }}>
          Save
        </button>
        <div data-load-menu="" style={{ position: 'relative' }}>
          <button onClick={() => setShowLoad(v => !v)}
            style={{ padding: '4px 10px', background: '#1a2a1a', border: '1px solid #446633', color: '#cec', cursor: 'pointer' }}>
            Load ▾
          </button>
          {showLoad && (
            <div style={{ position: 'absolute', top: '100%', left: 0, background: '#1e1e30', border: '1px solid #444', zIndex: 99, minWidth: 180, maxHeight: 260, overflowY: 'auto', marginTop: 2 }}>
              {Object.keys(scenes).length === 0
                ? <div style={{ padding: '8px 12px', color: '#666' }}>no saved scenes</div>
                : Object.keys(scenes).map(name => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', padding: '5px 10px', borderBottom: '1px solid #333', gap: 6 }}>
                    <span style={{ flex: 1, cursor: 'pointer', color: '#cef' }} onClick={() => loadScene(name)}>{name}</span>
                    <button onClick={() => deleteScene(name)}
                      style={{ background: 'none', border: 'none', color: '#a66', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>✕</button>
                  </div>
                ))
              }
            </div>
          )}
        </div>
        <span style={{ width: 1, background: '#444', alignSelf: 'stretch', margin: '0 4px' }} />
        <button onClick={() => { pushHistory(); setGrid(makeGrid(gridW, gridH)) }}
          style={{ padding: '4px 10px', background: '#4a2020', border: '1px solid #884444', color: '#fcc', cursor: 'pointer' }}>
          Clear
        </button>
        <button onClick={exportJSON}
          style={{ padding: '4px 10px', background: '#1a3a1a', border: '1px solid #448844', color: '#cfc', cursor: 'pointer' }}>
          Export JSON
        </button>
        <button onClick={exportPNG}
          style={{ padding: '4px 10px', background: '#1a2a3a', border: '1px solid #446688', color: '#adf', cursor: 'pointer' }}>
          Export PNG
        </button>
        <span style={{ width: 1, background: '#444', alignSelf: 'stretch', margin: '0 4px' }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#99c' }}>Sky</span>
          <select value={weather} onChange={e => setWeather(e.target.value)}
            style={{ background: '#222', color: '#eee', border: '1px solid #555', padding: '3px 6px', cursor: 'pointer' }}>
            {[['sunny','☀️ Sunny'],['night','🌙 Night'],['arid','🏜️ Arid'],['rainy','🌧️ Rainy'],['spooky','🎃 Spooky'],
              ['snowy','❄️ Snowy'],['snowy_night','🌨️ Snowy Night'],['nothing','⬛ Nothing'],
              ['jungle','🌿 Jungle'],['mars','🔴 Mars'],['beach','🏖️ Beach'],['spring','🌸 Spring'],
              ['undersea','🐟 Undersea'],['howling_sky','💨 Howling Sky'],['harvest','🍂 Harvest'],
              ['fire','🔥 Fire'],['water','💧 Water'],['warp','🌀 Warp'],['comet','☄️ Comet'],
              ['party','🎉 Party'],['balloon','🎈 Balloon'],['pineapples','🍍 Pineapples'],
              ['pagoda','🏯 Pagoda'],['pipes','🔧 Pipes'],
            ].map(([v, label]) => <option key={v} value={v}>{label}</option>)}
          </select>
        </label>
        {hover && <span style={{ color: '#888', marginLeft: 8 }}>col {hover.c}, row {hover.r}</span>}
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sprite picker */}
        <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid #333', background: '#13132a' }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid #333' }}>
            <input
              type="text"
              placeholder="Search sprites…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', background: '#222', color: '#eee', border: '1px solid #555', padding: '4px 6px' }}
            />
            <div style={{ marginTop: 4, color: '#777', fontSize: 11 }}>
              {filtered.length} matches{filtered.length > MAX_SHOWN ? ` (showing ${MAX_SHOWN})` : ''}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 8, display: 'flex', flexWrap: 'wrap', gap: 2, alignContent: 'flex-start' }}>
            {shown.map(name => {
              const atDef = AUTOTILE[name]
              const base = {
                width: 32, height: 32, flexShrink: 0, cursor: 'pointer',
                outline: selected === name ? '2px solid #aef' : '1px solid #333',
                imageRendering: 'pixelated',
              }
              return atDef ? (
                <div key={name} title={name.replace('.png', '')} onClick={() => setSelected(name)}
                  style={{ ...base, ...autotileCSS(atDef, {}, 32) }} />
              ) : (
                <img key={name} src={BASE_URL + name} title={name.replace('.png', '')} onClick={() => setSelected(name)} loading="lazy"
                  style={{ ...base, background: 'repeating-conic-gradient(#2a2a3a 0% 25%, #1a1a2a 0% 50%) 0 0 / 8px 8px' }} />
              )
            })}
            {filtered.length === 0 && <span style={{ color: '#666' }}>no matches</span>}
          </div>
          {selected && (() => {
            const atDef = AUTOTILE[selected]
            return (
              <div style={{ padding: '8px 10px', borderTop: '1px solid #333', display: 'flex', alignItems: 'center', gap: 8 }}>
                {atDef
                  ? <div style={{ width: 48, height: 48, imageRendering: 'pixelated', flexShrink: 0, ...autotileCSS(atDef, {}, 48) }} />
                  : <img src={BASE_URL + selected} style={{ width: 48, height: 48, imageRendering: 'pixelated', background: 'repeating-conic-gradient(#2a2a3a 0% 25%, #1a1a2a 0% 50%) 0 0 / 8px 8px' }} />
                }
                <span style={{ wordBreak: 'break-word', color: '#ccc', fontSize: 11 }}>{selected.replace('.png', '')}</span>
              </div>
            )
          })()}
        </div>

        {/* Grid */}
        <div ref={scrollRef}
          style={{ flex: 1, overflow: 'auto', padding: 12, cursor: tool === 'hand' ? 'grab' : 'crosshair', background: '#020809' }}
          onMouseDown={onHandDown} onMouseMove={onHandMove} onMouseUp={onHandUp} onMouseLeave={onHandUp}
        >
          <div
            style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${gridW}, ${tileSize}px)`, userSelect: 'none', border: '1px solid #444',
              background: `url(/weather/${weather}.png) center / ${100 * tileSize}px ${54 * tileSize}px` }}
            onContextMenu={e => e.preventDefault()}
          >
            {grid.map((row, r) =>
              row.map((name, c) => {
                const isHover  = hover?.r === r && hover?.c === c
                const inRect   = rectPreview && r >= rectPreview.r1 && r <= rectPreview.r2 && c >= rectPreview.c1 && c <= rectPreview.c2
                const atDef    = name ? AUTOTILE[name] : null
                const connects = (dr, dc) => name && grid[r + dr]?.[c + dc] === name
                const G = showGrid ? '#2a2a3a' : 'transparent'
                const T = '1px solid transparent'

                const bgStyle = atDef ? autotileCSS(atDef, {
                  n:  grid[r-1]?.[c]   === name,
                  ne: grid[r-1]?.[c+1] === name,
                  e:  grid[r]?.[c+1]   === name,
                  se: grid[r+1]?.[c+1] === name,
                  s:  grid[r+1]?.[c]   === name,
                  sw: grid[r+1]?.[c-1] === name,
                  w:  grid[r]?.[c-1]   === name,
                  nw: grid[r-1]?.[c-1] === name,
                }, tileSize) : {
                  background: name ? `url(${BASE_URL + name}) center/100% 100% no-repeat` : 'transparent',
                }

                // Autotile cells: no CSS borders (border shifts background-origin by 1px inside
                // border-box sizing, causing white strip at top). Grid lines only for non-autotile.
                const borders = atDef ? { border: 'none' } : {
                  borderTop:    connects(-1, 0) ? T : `1px solid ${G}`,
                  borderRight:  connects( 0, 1) ? T : `1px solid ${G}`,
                  borderBottom: connects( 1, 0) ? T : `1px solid ${G}`,
                  borderLeft:   connects( 0,-1) ? T : `1px solid ${G}`,
                }

                return (
                  <div
                    key={`${r}-${c}`}
                    onMouseDown={e => onCellDown(r, c, e)}
                    onMouseEnter={() => onCellEnter(r, c)}
                    style={{
                      width: tileSize, height: tileSize,
                      boxSizing: 'border-box',
                      outline: inRect ? '2px solid #fa8' : isHover ? '2px solid #aef' : undefined,
                      outlineOffset: '-2px',
                      ...borders,
                      ...bgStyle,
                    }}
                  />
                )
              })
            )}
          </div>
          <div style={{ marginTop: 8, color: '#555', fontSize: 11 }}>
            ✏️ paint &nbsp;|&nbsp; ⬜ rect fill &nbsp;|&nbsp; ✋ pan &nbsp;|&nbsp; Scroll = zoom &nbsp;|&nbsp; Ctrl+Z / Ctrl+Shift+Z = undo/redo &nbsp;|&nbsp; G = grid
          </div>
        </div>
      </div>
    </div>
  )
}
