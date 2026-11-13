import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AUTOTILE, BG_BLOCKS, autotileCSS } from '../autotile.js'

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

const isBg = name => name ? BG_BLOCKS.has(name) : false

// Grid cells are { fg: name|null, bg: name|null }
function makeGrid(w, h) {
  return Array.from({ length: h }, () => Array.from({ length: w }, () => ({ fg: null, bg: null })))
}

function copyGrid(g) {
  return g.map(row => row.map(cell => ({ ...cell })))
}

// Migrate old scenes saved as string|null per cell
function migrateCell(cell) {
  if (cell === null) return { fg: null, bg: null }
  if (typeof cell === 'string') return isBg(cell) ? { fg: null, bg: cell } : { fg: cell, bg: null }
  return cell
}

function loadScenes()   { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { return {} } }
function saveScenes(db) { localStorage.setItem(LS_KEY, JSON.stringify(db)) }

function tileStyle(name, neighbors, displayPx) {
  if (!name) return null
  const atDef = AUTOTILE[name]
  return atDef
    ? autotileCSS(atDef, neighbors, displayPx)
    : { background: `url(${BASE_URL + name}) center/calc(100% + 2px) calc(100% + 2px) no-repeat` }
}

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
  const [rectPreview, setRectPreview] = useState(null)
  const painting   = useRef(false)
  const erasing    = useRef(false)
  const scrollRef  = useRef(null)
  const dragRef    = useRef(null)
  const rectStart  = useRef(null)
  const gridRef    = useRef(grid)
  const historyRef = useRef([])
  const redoRef    = useRef([])
  // Select-move tool
  const [selState,    setSelState]   = useState(null)
  const selStart    = useRef(null)
  const selDragCell = useRef(null)
  const selTiles    = useRef(null)

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
    historyRef.current = [...historyRef.current.slice(-39), copyGrid(gridRef.current)]
    redoRef.current = []
  }, [])

  const undo = useCallback(() => {
    if (!historyRef.current.length) return
    redoRef.current = [copyGrid(gridRef.current), ...redoRef.current.slice(0, 39)]
    const prev = historyRef.current[historyRef.current.length - 1]
    historyRef.current = historyRef.current.slice(0, -1)
    setGrid(prev)
    setGridW(prev[0]?.length ?? DEFAULT_W)
    setGridH(prev.length)
  }, [])

  const redo = useCallback(() => {
    if (!redoRef.current.length) return
    historyRef.current = [...historyRef.current.slice(-39), copyGrid(gridRef.current)]
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
      if (e.key === 'Escape') setSelState(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])

  const filtered = search.trim()
    ? sprites.filter(s => s.includes(search.trim().toLowerCase()))
    : sprites

  const resize = useCallback((w, h) => {
    pushHistory()
    setGrid(prev => Array.from({ length: h }, (_, r) =>
      Array.from({ length: w }, (_, c) => prev[r]?.[c] ? { ...prev[r][c] } : { fg: null, bg: null })
    ))
    setGridW(w)
    setGridH(h)
  }, [pushHistory])

  const paint = useCallback((r, c, erase) => {
    setGrid(prev => {
      const next = copyGrid(prev)
      if (next[r]?.[c] === undefined) return prev
      if (erase) {
        next[r][c] = { fg: null, bg: null }
      } else {
        const cell = next[r][c]
        next[r][c] = isBg(selected) ? { ...cell, bg: selected } : { ...cell, fg: selected }
      }
      return next
    })
  }, [selected])

  const onCellDown = (r, c, e) => {
    if (tool === 'hand') return
    e.preventDefault()
    if (tool === 'select') {
      if (selState?.phase === 'selected') {
        const { r1, c1, r2, c2 } = selState
        if (r >= r1 && r <= r2 && c >= c1 && c <= c2) {
          selDragCell.current = { r, c }
          selTiles.current = Array.from({ length: r2-r1+1 }, (_, dr) =>
            Array.from({ length: c2-c1+1 }, (_, dc) => ({ ...gridRef.current[r1+dr]?.[c1+dc] ?? { fg: null, bg: null } }))
          )
          setSelState({ phase: 'moving', r1, c1, r2, c2, dr: 0, dc: 0 })
          return
        }
      }
      selStart.current = { r, c }
      setSelState({ phase: 'selecting', r1: r, c1: c, r2: r, c2: c })
      return
    }
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
    if (tool === 'select') {
      if (selState?.phase === 'selecting' && selStart.current) {
        const { r: sr, c: sc } = selStart.current
        setSelState({ phase: 'selecting', r1: Math.min(sr, r), c1: Math.min(sc, c), r2: Math.max(sr, r), c2: Math.max(sc, c) })
      } else if (selState?.phase === 'moving' && selDragCell.current) {
        setSelState(prev => ({ ...prev, dr: r - selDragCell.current.r, dc: c - selDragCell.current.c }))
      }
      return
    }
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
    if (tool === 'select') {
      if (selState?.phase === 'selecting') {
        setSelState(prev => ({ ...prev, phase: 'selected' }))
        selStart.current = null
      } else if (selState?.phase === 'moving') {
        const { r1, c1, r2, c2, dr, dc } = selState
        pushHistory()
        setGrid(prev => {
          const next = copyGrid(prev)
          for (let dri = 0; dri <= r2-r1; dri++)
            for (let dci = 0; dci <= c2-c1; dci++) {
              const tile = selTiles.current[dri][dci]
              if ((tile.fg !== null || tile.bg !== null) && next[r1+dri]?.[c1+dci] !== undefined)
                next[r1+dri][c1+dci] = { fg: null, bg: null }
            }
          for (let dri = 0; dri <= r2-r1; dri++)
            for (let dci = 0; dci <= c2-c1; dci++) {
              const tile = selTiles.current[dri][dci]
              if (tile.fg !== null || tile.bg !== null) {
                const nr = r1+dr+dri, nc = c1+dc+dci
                if (next[nr]?.[nc] !== undefined) next[nr][nc] = { ...tile }
              }
            }
          return next
        })
        setSelState({ phase: 'selected', r1: r1+dr, c1: c1+dc, r2: r2+dr, c2: c2+dc })
        selDragCell.current = null
      }
      return
    }
    if (tool === 'rect' && rectStart.current && rectPreview) {
      const { r1, c1, r2, c2 } = rectPreview
      const erase = rectStart.current.erase
      setGrid(prev => {
        const next = copyGrid(prev)
        for (let r = r1; r <= r2; r++)
          for (let c = c1; c <= c2; c++) {
            if (next[r]?.[c] === undefined) continue
            if (erase) {
              next[r][c] = { fg: null, bg: null }
            } else {
              const cell = next[r][c]
              next[r][c] = isBg(selected) ? { ...cell, bg: selected } : { ...cell, fg: selected }
            }
          }
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

  const saveScene = () => {
    const name = sceneName.trim()
    if (!name) return
    const db = { ...scenes, [name]: grid }
    setScenes(db)
    saveScenes(db)
  }

  const loadScene = name => {
    const saved = scenes[name]
    if (!saved) return
    const g = saved.map(row => row.map(migrateCell))
    setGrid(g)
    setGridH(g.length)
    setGridW(g[0]?.length ?? DEFAULT_W)
    setShowLoad(false)
  }

  const deleteScene = name => {
    const db = { ...scenes }
    delete db[name]
    setScenes(db)
    saveScenes(db)
  }

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(grid)], { type: 'application/json' })
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'scene.json' })
    a.click()
  }

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

    const bgImg = await load(`/weather/${weather}.png`)
    if (bgImg) ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height)
    else { ctx.fillStyle = '#020809'; ctx.fillRect(0, 0, canvas.width, canvas.height) }

    for (const layer of ['bg', 'fg']) {
      for (let r = 0; r < gridH; r++) {
        for (let c = 0; c < gridW; c++) {
          const name = grid[r][c]?.[layer]
          if (!name) continue
          const img = await load(BASE_URL + name)
          if (img) ctx.drawImage(img, c * tileSize, r * tileSize, tileSize, tileSize)
        }
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
        {[['pencil', '✏️'], ['rect', '⬜'], ['select', '⊡'], ['hand', '✋']].map(([t, icon]) => (
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
            const bg = isBg(selected)
            return (
              <div style={{ padding: '8px 10px', borderTop: '1px solid #333', display: 'flex', alignItems: 'center', gap: 8 }}>
                {atDef
                  ? <div style={{ width: 48, height: 48, imageRendering: 'pixelated', flexShrink: 0, ...autotileCSS(atDef, {}, 48) }} />
                  : <img src={BASE_URL + selected} style={{ width: 48, height: 48, imageRendering: 'pixelated', background: 'repeating-conic-gradient(#2a2a3a 0% 25%, #1a1a2a 0% 50%) 0 0 / 8px 8px' }} />
                }
                <div>
                  <div style={{ wordBreak: 'break-word', color: '#ccc', fontSize: 11 }}>{selected.replace('.png', '')}</div>
                  <div style={{ marginTop: 3, fontSize: 10, fontWeight: 'bold',
                    color: bg ? '#7af' : '#afa',
                    background: bg ? '#112233' : '#113311',
                    padding: '1px 5px', borderRadius: 2, display: 'inline-block' }}>
                    {bg ? '▣ BG layer' : '▤ FG layer'}
                  </div>
                </div>
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
              row.map((cell, c) => {
                const { fg, bg } = cell
                const isHover  = hover?.r === r && hover?.c === c
                const inRect   = rectPreview && r >= rectPreview.r1 && r <= rectPreview.r2 && c >= rectPreview.c1 && c <= rectPreview.c2

                // Selection tool visuals
                const inSel = selState && r >= selState.r1 && r <= selState.r2 && c >= selState.c1 && c <= selState.c2
                const isMovingSource = selState?.phase === 'moving' && inSel
                let ghostCell = null
                if (selState?.phase === 'moving') {
                  const { r1, c1, dr, dc } = selState
                  const dri = r - (r1 + dr), dci = c - (c1 + dc)
                  if (dri >= 0 && dci >= 0 && dri <= selState.r2-r1 && dci <= selState.c2-c1)
                    ghostCell = selTiles.current?.[dri]?.[dci] ?? null
                }

                // Autotile neighbor helpers per layer
                const fgN = fg ? {
                  n:  grid[r-1]?.[c]?.fg   === fg, ne: grid[r-1]?.[c+1]?.fg === fg,
                  e:  grid[r]?.[c+1]?.fg   === fg, se: grid[r+1]?.[c+1]?.fg === fg,
                  s:  grid[r+1]?.[c]?.fg   === fg, sw: grid[r+1]?.[c-1]?.fg === fg,
                  w:  grid[r]?.[c-1]?.fg   === fg, nw: grid[r-1]?.[c-1]?.fg === fg,
                } : {}
                const bgN = bg ? {
                  n:  grid[r-1]?.[c]?.bg   === bg, ne: grid[r-1]?.[c+1]?.bg === bg,
                  e:  grid[r]?.[c+1]?.bg   === bg, se: grid[r+1]?.[c+1]?.bg === bg,
                  s:  grid[r+1]?.[c]?.bg   === bg, sw: grid[r+1]?.[c-1]?.bg === bg,
                  w:  grid[r]?.[c-1]?.bg   === bg, nw: grid[r-1]?.[c-1]?.bg === bg,
                } : {}

                const fgStyle = tileStyle(fg, fgN, tileSize)
                const bgStyle = tileStyle(bg, bgN, tileSize)

                const selOutline =
                  inSel && selState.phase !== 'moving' ? '2px solid #88aaff' :
                  ghostCell !== null                   ? '2px solid #aaccff' : undefined

                const G = showGrid ? 'rgba(42,42,58,0.7)' : 'transparent'

                return (
                  <div
                    key={`${r}-${c}`}
                    onMouseDown={e => onCellDown(r, c, e)}
                    onMouseEnter={() => onCellEnter(r, c)}
                    style={{
                      position: 'relative',
                      width: tileSize, height: tileSize,
                      boxSizing: 'border-box',
                      opacity: isMovingSource ? 0.25 : 1,
                      outline: inRect ? '2px solid #fa8' : selOutline ?? (isHover ? '2px solid #aef' : undefined),
                      outlineOffset: '-2px',
                      boxShadow: showGrid ? `inset 0 0 0 1px ${G}` : 'none',
                    }}
                  >
                    {bgStyle && <div style={{ position: 'absolute', inset: 0, ...bgStyle }} />}
                    {fgStyle && <div style={{ position: 'absolute', inset: 0, ...fgStyle }} />}
                    {ghostCell && (ghostCell.bg || ghostCell.fg) && (
                      <>
                        {ghostCell.bg && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...tileStyle(ghostCell.bg, {}, tileSize) }} />}
                        {ghostCell.fg && <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...tileStyle(ghostCell.fg, {}, tileSize) }} />}
                      </>
                    )}
                  </div>
                )
              })
            )}
          </div>
          <div style={{ marginTop: 8, color: '#555', fontSize: 11 }}>
            ✏️ paint &nbsp;|&nbsp; ⬜ rect fill &nbsp;|&nbsp; ⊡ select+move &nbsp;|&nbsp; ✋ pan &nbsp;|&nbsp; Scroll = zoom &nbsp;|&nbsp; Ctrl+Z / Ctrl+Shift+Z = undo/redo &nbsp;|&nbsp; G = grid &nbsp;|&nbsp; Right-click = erase
          </div>
        </div>
      </div>
    </div>
  )
}
