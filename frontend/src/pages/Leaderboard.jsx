import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import { MOCK_LEADERBOARD } from '../lib/mockData'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

function shortAddr(a) { return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '—' }

export default function Leaderboard() {
  const { data, loading } = useApi(() =>
    USE_MOCK ? Promise.resolve(MOCK_LEADERBOARD) : api.leaderboard(20)
  )

  const maxScore = data ? Math.max(...data.map(e => e.score_bps)) : 1

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px' }}>
      <div className="label" style={{ marginBottom: 12 }}>Performance Registry</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 className="subheading" style={{ marginBottom: 6 }}>Leaderboard</h1>
          <span style={{ color: 'var(--color-mid-gray-border)', fontSize: 13 }}>
            Ranked by on-chain EWA score
          </span>
        </div>
        {data?.[0] && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-pt-serif)', fontSize: 40, color: 'var(--color-lime-interface)', lineHeight: 1 }}>
              {(data[0].score_bps / 100).toFixed(1)}%
            </div>
            <div className="label" style={{ marginTop: 4 }}>Top score · Strategy #{data[0].strategy.token_id}</div>
          </div>
        )}
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: '48px 1fr 180px 140px 100px 80px 80px',
        gap: 16, padding: '10px 20px',
        background: 'var(--surface-subtle-panel)',
        borderBottom: '1px solid var(--color-dark-grid)',
      }}>
        {['RANK', 'PERFORMANCE', 'CREATOR', 'SCORE', 'PRICE', 'SNAPS', ''].map(h => (
          <span key={h} className="label" style={{ fontSize: 10 }}>{h}</span>
        ))}
      </div>

      {loading && (
        [...Array(6)].map((_, i) => (
          <div key={i} style={{ height: 52, background: 'var(--surface-dark-card)', borderBottom: '1px solid var(--color-dark-grid)' }} />
        ))
      )}

      {data?.map((entry, i) => {
        const pct = maxScore > 0 ? (entry.score_bps / maxScore) * 100 : 0
        return (
          <div key={entry.strategy.token_id} className="fade-up" style={{
            display: 'grid', gridTemplateColumns: '48px 1fr 180px 140px 100px 80px 80px',
            gap: 16, padding: '14px 20px', alignItems: 'center',
            borderBottom: '1px solid var(--color-dark-grid)',
            background: i === 0 ? 'rgba(197,255,74,0.04)' : i === 1 ? 'rgba(197,255,74,0.02)' : 'transparent',
            transition: 'background 0.15s',
          }}>
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 13, color: i < 3 ? 'var(--color-lime-interface)' : 'var(--color-mid-gray-border)' }}>
              #{entry.rank}
            </span>
            <div style={{ height: 2, background: 'var(--color-dark-grid)', position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: 'var(--color-lime-interface)' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--color-white-outlined-text)' }}>
              {shortAddr(entry.strategy.creator)}
            </span>
            <span style={{ fontFamily: 'var(--font-pt-serif)', fontSize: 18, color: 'var(--color-lime-interface)' }}>
              {(entry.score_bps / 100).toFixed(2)}%
            </span>
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--color-mid-gray-border)' }}>
              {(Number(entry.strategy.price_wei) / 1e18).toFixed(2)} ETH
            </span>
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--color-mid-gray-border)', textAlign: 'center' }}>
              {entry.strategy.snapshot_count}
            </span>
            <Link to={`/strategies/${entry.strategy.token_id}`} style={{ color: 'var(--color-lime-interface)', fontFamily: 'var(--font-jetbrains)', fontSize: 11, textDecoration: 'none', textAlign: 'right' }}>
              #{entry.strategy.token_id} →
            </Link>
          </div>
        )
      })}
    </main>
  )
}
