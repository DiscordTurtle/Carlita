import React from 'react'

export default function GameSettings({ masterVolume, setMasterVolume, onBack }) {
  return (
    <div className="pixel text-center">
      <div
        className="rounded-lg border-4 bg-blue-900 px-8 py-6 shadow-2xl"
        style={{
          minWidth: '340px',
          background: 'linear-gradient(135deg, #1a4d6d 0%, #0d2e42 100%)',
          borderColor: '#5fa8d3'
        }}
      >
        <h1
          className="mb-8 text-2xl font-bold"
          style={{
            color: '#e8f4f8',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            letterSpacing: '0.1em'
          }}
        >
          Personal Settings
        </h1>

        {/* Music Volume Slider */}
        <div className="mb-8">
          <div
            className="text-sm font-bold mb-2"
            style={{
              color: '#e8f4f8',
              textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
              letterSpacing: '0.05em'
            }}
          >
            Music volume
          </div>
          <div className="flex items-center gap-2" style={{ padding: '0 2px' }}>
            <span
              className="text-xs font-bold"
              style={{ color: '#a8d4e8', minWidth: '28px' }}
            >
              Min
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVolume}
              onChange={(e) => setMasterVolume(Number(e.target.value))}
              className="flex-1 cursor-pointer"
              style={{
                height: '8px',
                WebkitAppearance: 'none',
                appearance: 'none',
                width: '100%',
                background: 'linear-gradient(to right, #5fa8d3 0%, #5fa8d3 ' + (masterVolume * 100) + '%, #0d2e42 ' + (masterVolume * 100) + '%, #0d2e42 100%)',
                borderRadius: '4px',
                outline: 'none',
                accentColor: '#5fa8d3'
              }}
            />
            <span
              className="text-xs font-bold"
              style={{ color: '#a8d4e8', minWidth: '28px', textAlign: 'right' }}
            >
              Max
            </span>
          </div>
          <style>{`
            input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: #7cc4e8;
              cursor: pointer;
              border: 2px solid #e8f4f8;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            input[type="range"]::-moz-range-thumb {
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: #7cc4e8;
              cursor: pointer;
              border: 2px solid #e8f4f8;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
          `}</style>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="mt-8 w-full rounded px-4 py-2 font-bold transition-all"
          style={{
            background: 'linear-gradient(135deg, #4a9fbf 0%, #2d5f7d 100%)',
            color: '#e8f4f8',
            textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
            border: '2px solid #7cc4e8',
            cursor: 'pointer',
            fontSize: '16px',
            letterSpacing: '0.05em'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #5aafcf 0%, #3d6f8d 100%)'
            e.target.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #4a9fbf 0%, #2d5f7d 100%)'
            e.target.style.transform = 'translateY(0)'
          }}
        >
          Back
        </button>
      </div>
    </div>
  )
}
