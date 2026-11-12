import React, { useCallback, useRef, useState } from 'react'
import { TILE_DEF } from '../maps/mapFormat.js'
import { PARKOUR_MAP } from '../maps/parkourMap.js'

// Developer map editor. Render this instead of App to design levels.
// Usage in main.jsx: import MapEditor from './components/MapEditor.jsx'
//                    ReactDOM.createRoot(...).render(<MapEditor />)

const TILE_PX = 18  // px per tile in the editor grid

export default function MapEditor() {
  const [map,        setMap]        = useState(() => PARKOUR_MAP.map(r => [...r]))
  const [selected,   setSelected]   = useState(1)   // default: Dirt
  const [hover,      setHover]      = useState(null) // { r, c }
  const [exportText, setExportText] = useState('')
  const [importText, setImportText] = useState('')
  const painting = useRef(false)

  const paint = useCallback((r, c, id) => {
    setMap(prev => {
      const next = prev.map(row => [...row])
      if (next[r]?.[c] !== undefined) next[r][c] = id
      return next
    })
  }, [])

  const onMouseDown = (r, c, e) => {
    e.preventDefault()
    painting.current = true
    paint(r, c, e.button === 2 ? 0 : selected)
  }
  const onMouseEnter = (r, c) => {
    setHover({ r, c })
    if (painting.current) paint(r, c, selected)
  }
  const onMouseUp = () => { painting.current = false }

  const rows = map.length
  const cols = map[0]?.length ?? 0

  return (
    <div
      style={{ padding: 12, background: '#f0f0f0', minHeight: '100vh', fontFamily: 'monospace', fontSize: 13 }}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <h2 style={{ margin: '0 0 10px' }}>Map Editor — {cols}×{rows}</h2>

      {/* Palette */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <strong>Tile:</strong>
        {Object.entries(TILE_DEF).map(([id, def]) => (
          <button
            key={id}
            title={def.label}
            onClick={() => setSelected(Number(id))}
            style={{
              width: 36, height: 36,
              background: def.color === 'transparent' ? '#ccc' : def.color,
              border: selected === Number(id) ? '3px solid #000' : `1px solid ${def.border || '#888'}`,
              cursor: 'pointer', borderRadius: 3,
              fontSize: 10, color: '#fff', textShadow: '0 0 2px #000', fontWeight: 'bold',
            }}
          >
            {def.label.slice(0, 3)}
          </button>
        ))}
        <span style={{ color: '#555', marginLeft: 8 }}>
          Left-click = paint &nbsp;|&nbsp; Right-click = erase &nbsp;|&nbsp;
          {hover ? `(col ${hover.c}, row ${hover.r})` : 'hover to see coords'}
        </span>
      </div>

      {/* Grid */}
      <div
        style={{ display: 'inline-block', border: '1px solid #999', cursor: 'crosshair', userSelect: 'none', overflowX: 'auto' }}
        onContextMenu={e => e.preventDefault()}
      >
        {/* Column numbers header */}
        <div style={{ display: 'flex', paddingLeft: 24 }}>
          {Array.from({ length: cols }, (_, c) => (
            <div key={c} style={{ width: TILE_PX, textAlign: 'center', fontSize: 8, color: '#666', flexShrink: 0 }}>
              {c % 5 === 0 ? c : ''}
            </div>
          ))}
        </div>

        {map.map((row, r) => (
          <div key={r} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Row number */}
            <div style={{ width: 22, textAlign: 'right', paddingRight: 2, fontSize: 9, color: '#666', flexShrink: 0 }}>
              {r}
            </div>
            {row.map((tileId, c) => {
              const def     = TILE_DEF[tileId] || TILE_DEF[0]
              const isHover = hover?.r === r && hover?.c === c
              return (
                <div
                  key={c}
                  onMouseDown={e => onMouseDown(r, c, e)}
                  onMouseEnter={() => onMouseEnter(r, c)}
                  style={{
                    width: TILE_PX, height: TILE_PX,
                    background: def.color === 'transparent' ? '#1a1a2e' : def.color,
                    border: `1px solid ${isHover ? '#fff' : (tileId === 0 ? '#222' : (def.border || '#999'))}`,
                    boxSizing: 'border-box', flexShrink: 0,
                    outline: isHover ? '1px solid #fff' : undefined,
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Export / Import */}
      <div style={{ marginTop: 14, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <button
            onClick={() => setExportText(JSON.stringify(map))}
            style={{ padding: '6px 14px', cursor: 'pointer', marginBottom: 4 }}
          >
            Export map JSON
          </button>
          {exportText && (
            <textarea
              readOnly
              value={exportText}
              onClick={e => e.target.select()}
              style={{ display: 'block', width: 480, height: 90, fontSize: 11, fontFamily: 'monospace' }}
            />
          )}
        </div>
        <div>
          <div style={{ marginBottom: 4 }}>Import (paste JSON array):</div>
          <textarea
            value={importText}
            onChange={e => setImportText(e.target.value)}
            placeholder='Paste exported map JSON here...'
            style={{ display: 'block', width: 480, height: 90, fontSize: 11, fontFamily: 'monospace' }}
          />
          <button
            onClick={() => {
              try {
                const parsed = JSON.parse(importText)
                if (Array.isArray(parsed) && Array.isArray(parsed[0])) setMap(parsed)
              } catch {}
            }}
            style={{ marginTop: 4, padding: '6px 14px', cursor: 'pointer' }}
          >
            Load map
          </button>
        </div>
      </div>

      <p style={{ color: '#777', marginTop: 10, fontSize: 12 }}>
        After editing, export the JSON and replace the <code>build()</code> output in <code>frontend/src/maps/parkourMap.js</code>.
      </p>
    </div>
  )
}
