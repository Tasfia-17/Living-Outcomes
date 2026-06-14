import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import { MOCK_STRATEGIES } from '../lib/mockData'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

function shortAddr(a) { return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '—' }
function formatEth(wei) { return (Number(wei) / 1e18).toFixed(2) }

export default function Strategies() {
  const { data, loading } = useApi(() =>
    USE_MOCK ? Promise.resolve(MOCK_STRATEGIES) : api.strategies()
  )
  const [sort, setSort] = useState('score')
  const [onlyRoots, setOnlyRoots] = useState(false)

  const strategies = data
    ? [...data]
        .filter(s => s.active)
        .filter(s => !onlyRoots || s.parent_id === 0)
        .sort((a, b) => {
          if (sort === 'score') return (b.latest_score_bps ?? 0) - (a.latest_score_bps ?? 0)
          if (sort === 'price') return b.price_wei - a.price_wei
          if (sort === 'newest') return b.token_id - a.token_id
          return 0
        })
    : []

  const maxScore = strategies.length ? Math.max(...strategies.map(s => s.latest_score_bps ?? 0)) : 1

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px' }}>
      <div className="label" style={{ marginBottom: 12 }}>Strategy Registry</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 className="subheading" style={{ marginBottom: 6 }}>All Strategies</h1>
          <span style={{ color: 'var(--color-mid-gray-border)', fontSize: 13 }}>
            {data ? `${strategies.length} active` : '—'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => setOnlyRoots(v => !v)}
            className={onlyRoots ? 'btn-lime' : 'btn-ghost'}
            style={{ fontSize: 11, padding: '7px 14px' }}
          >
            Roots only
          </button>
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ width: 'auto', padding: '7px 14px', fontFamily: 'var(--font-jetbrains)', fontSize: 11 }}>
            <option value="score">Sort: Score</option>
            <option value="price">Sort: Price</option>
            <option value="newest">Sort: Newest</option>
          </select>
        </div>
      </div>

      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--color-dark-grid)' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ height: 200, background: 'var(--surface-dark-card)', animation: 'pulse-glow 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      )}

      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--color-dark-grid)' }}>
          {strategies.map((s, i) => {
            const score = s.latest_score_bps ?? 0
            const pct = maxScore > 0 ? (score / maxScore) * 100 : 0
            return (
              <div key={s.token_id} className="card card-trace fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="label" style={{ color: 'var(--color-lime-interface)', marginBottom: 4 }}>
                      Strategy #{s.token_id}
                    </div>
                    <div style={{ fontFamily: 'var(--font-pt-serif)', fontSize: 22, lineHeight: 1.1 }}>
                      {(score / 100).toFixed(1)}%
                    </div>
                  </div>
                  {s.parent_id > 0 && (
                    <span className="badge badge-active" style={{ fontSize: 9 }}>FORK</span>
                  )}
                </div>

                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>

                {[
                  ['Creator', shortAddr(s.creator)],
                  ['Price', `${formatEth(s.price_wei)} ETH`],
                  ['Royalty', `${s.royalty_bps / 100}%`],
                  s.parent_id > 0 ? ['Fork of', `#${s.parent_id}`] : ['Type', 'Root'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-dark-grid)', paddingBottom: 8 }}>
                    <span style={{ color: 'var(--color-mid-gray-border)', fontSize: 12 }}>{k}</span>
                    <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--color-white-outlined-text)' }}>{v}</span>
                  </div>
                ))}

                <Link to={`/strategies/${s.token_id}`} className="btn-ghost" style={{ fontSize: 12, padding: '8px 14px', alignSelf: 'flex-start' }}>
                  View Strategy →
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
