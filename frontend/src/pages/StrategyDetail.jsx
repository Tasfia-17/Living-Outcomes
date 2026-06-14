import { useParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import { MOCK_STRATEGIES } from '../lib/mockData'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

function shortAddr(a) { return a ? `${a.slice(0, 10)}…${a.slice(-6)}` : '—' }
function formatEth(wei) { return (Number(wei) / 1e18).toFixed(4) }

function ScoreChart({ snapshots }) {
  if (!snapshots?.length) return (
    <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-mid-gray-border)', fontFamily: 'var(--font-jetbrains)', fontSize: 12 }}>
      NO PERFORMANCE DATA YET
    </div>
  )
  const max = Math.max(...snapshots.map(s => s.return_bps))
  const W = 560, H = 100, pad = 16
  const pts = snapshots.map((s, i) => [
    pad + (i / Math.max(snapshots.length - 1, 1)) * (W - pad * 2),
    H - pad - (s.return_bps / max) * (H - pad * 2),
  ])
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ')
  const area = `${path} L${pts[pts.length-1][0]},${H} L${pad},${H} Z`
  return (
    <div className="card">
      <div className="label" style={{ marginBottom: 12, color: 'var(--color-lime-interface)' }}>
        PERFORMANCE · {snapshots.length} SNAPSHOTS
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 100, display: 'block' }} preserveAspectRatio="none">
        <path d={area} fill="rgba(197,255,74,0.06)" />
        <path d={path} fill="none" stroke="var(--color-lime-interface)" strokeWidth="1.5" strokeLinecap="round" />
        {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill="#000" stroke="var(--color-lime-interface)" strokeWidth="1.5" />)}
      </svg>
    </div>
  )
}

export default function StrategyDetail() {
  const { id } = useParams()
  const { data: strategy, loading } = useApi(
    () => USE_MOCK
      ? Promise.resolve(MOCK_STRATEGIES.find(s => s.token_id === Number(id)))
      : api.strategy(id),
    [id]
  )
  const { data: snapshots } = useApi(
    () => USE_MOCK ? Promise.resolve([]) : api.snapshots(id),
    [id]
  )

  if (loading) return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 32px' }}>
      <div className="label">Loading…</div>
    </main>
  )
  if (!strategy) return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 32px' }}>
      <div style={{ color: '#ff6b6b', fontFamily: 'var(--font-jetbrains)', fontSize: 12 }}>STRATEGY NOT FOUND</div>
    </main>
  )

  const score = strategy.latest_score_bps ?? 0

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 32px' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 24 }}>
        <Link to="/strategies" style={{ color: 'var(--color-mid-gray-border)', fontFamily: 'var(--font-jetbrains)', fontSize: 11, textDecoration: 'none' }}>
          STRATEGIES
        </Link>
        <span style={{ color: 'var(--color-faint-grid)', fontSize: 11 }}>/</span>
        <span style={{ color: 'var(--color-lime-interface)', fontFamily: 'var(--font-jetbrains)', fontSize: 11 }}>#{strategy.token_id}</span>
      </div>

      <div className="label" style={{ marginBottom: 12 }}>Strategy Registry</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 className="subheading" style={{ marginBottom: 6 }}>Strategy #{strategy.token_id}</h1>
          <span style={{ color: 'var(--color-mid-gray-border)', fontSize: 13, fontFamily: 'var(--font-jetbrains)' }}>
            {shortAddr(strategy.creator)}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-pt-serif)', fontSize: 48, color: 'var(--color-lime-interface)', lineHeight: 1 }}>
            {(score / 100).toFixed(1)}%
          </div>
          <div className="label" style={{ marginTop: 4 }}>EWA Score</div>
        </div>
      </div>

      {strategy.parent_id > 0 && (
        <div style={{ marginBottom: 20, padding: '12px 16px', border: '1px solid var(--color-glow-green)', background: 'rgba(89,115,33,0.08)', fontFamily: 'var(--font-jetbrains)', fontSize: 12, color: 'var(--color-white-outlined-text)' }}>
          FORK — original creator receives {strategy.parent_royalty_bps / 100}% on every sale.{' '}
          <Link to={`/strategies/${strategy.parent_id}`} style={{ color: 'var(--color-lime-interface)', textDecoration: 'none' }}>
            View parent #{strategy.parent_id} →
          </Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--color-dark-grid)', marginBottom: 20 }}>
        {[
          ['Token ID', `#${strategy.token_id}`],
          ['Price', `${formatEth(strategy.price_wei)} ETH`],
          ['Royalty', `${strategy.royalty_bps / 100}%`],
          ['Parent royalty', strategy.parent_royalty_bps > 0 ? `${strategy.parent_royalty_bps / 100}%` : 'Root strategy'],
          ['Snapshots', `${strategy.snapshot_count}`],
          ['Status', strategy.active ? 'Active' : 'Inactive'],
        ].map(([k, v]) => (
          <div key={k} style={{ background: 'var(--surface-dark-card)', padding: '16px 20px' }}>
            <div className="label" style={{ marginBottom: 8 }}>{k}</div>
            <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 13, color: 'var(--color-white-outlined-text)' }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 20 }}>
        <div className="label" style={{ marginBottom: 8 }}>Content Hash</div>
        <div style={{ padding: '12px 16px', background: '#000', border: '1px solid var(--color-dark-grid)', fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--color-mid-gray-border)', wordBreak: 'break-all' }}>
          {strategy.content_hash}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div className="label" style={{ marginBottom: 8 }}>Agent ID</div>
        <div style={{ padding: '12px 16px', background: '#000', border: '1px solid var(--color-dark-grid)', fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--color-mid-gray-border)', wordBreak: 'break-all' }}>
          {strategy.agent_id}
        </div>
      </div>

      <ScoreChart snapshots={snapshots || []} />
    </main>
  )
}
