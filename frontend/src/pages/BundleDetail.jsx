import { useParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import { MOCK_BUNDLES, MOCK_STRATEGIES } from '../lib/mockData'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

function shortAddr(a) { return a ? `${a.slice(0, 10)}…${a.slice(-6)}` : '—' }

export default function BundleDetail() {
  const { id } = useParams()
  const { data: bundle, loading } = useApi(
    () => USE_MOCK
      ? Promise.resolve(MOCK_BUNDLES.find(b => b.bundle_id === Number(id)))
      : api.bundle(id),
    [id]
  )

  if (loading) return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 32px' }}>
      <div className="label">Loading…</div>
    </main>
  )
  if (!bundle) return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 32px' }}>
      <div style={{ color: '#ff6b6b', fontFamily: 'var(--font-jetbrains)', fontSize: 12 }}>BUNDLE NOT FOUND</div>
    </main>
  )

  const strategies = USE_MOCK
    ? MOCK_STRATEGIES.filter(s => bundle.strategy_ids.includes(s.token_id))
    : []
  const n = bundle.strategy_ids.length
  const assemblerPct = 70
  const eachPct = n > 0 ? (30 / n).toFixed(1) : 0

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 32px' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 24 }}>
        <Link to="/bundles" style={{ color: 'var(--color-mid-gray-border)', fontFamily: 'var(--font-jetbrains)', fontSize: 11, textDecoration: 'none' }}>BUNDLES</Link>
        <span style={{ color: 'var(--color-faint-grid)', fontSize: 11 }}>/</span>
        <span style={{ color: 'var(--color-lime-interface)', fontFamily: 'var(--font-jetbrains)', fontSize: 11 }}>#{bundle.bundle_id}</span>
      </div>

      <div className="label" style={{ marginBottom: 12 }}>Bundle Registry</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 className="subheading" style={{ marginBottom: 6 }}>Bundle #{bundle.bundle_id}</h1>
          <span style={{ color: 'var(--color-mid-gray-border)', fontSize: 13, fontFamily: 'var(--font-jetbrains)' }}>
            {shortAddr(bundle.assembler)}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-pt-serif)', fontSize: 48, color: 'var(--color-lime-interface)', lineHeight: 1 }}>
            {(Number(bundle.price_wei) / 1e18).toFixed(2)}
          </div>
          <div className="label" style={{ marginTop: 4 }}>ETH</div>
        </div>
      </div>

      {/* Revenue split */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="label" style={{ marginBottom: 12, color: 'var(--color-lime-interface)' }}>Revenue Split</div>
        <div style={{ height: 6, background: 'var(--color-dark-grid)', display: 'flex', marginBottom: 12 }}>
          <div style={{ width: `${assemblerPct}%`, background: 'var(--color-lime-interface)', transition: 'width 0.8s ease' }} />
          <div style={{ flex: 1, background: 'var(--color-mid-gray-border)' }} />
        </div>
        <div style={{ display: 'flex', gap: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, background: 'var(--color-lime-interface)' }} />
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--color-white-outlined-text)' }}>Assembler {assemblerPct}%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, background: 'var(--color-mid-gray-border)' }} />
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--color-white-outlined-text)' }}>Each strategy {eachPct}%</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: 'var(--color-dark-grid)', marginBottom: 24 }}>
        {[
          ['Strategies included', `${n}`],
          ['Status', bundle.active ? 'Active' : 'Inactive'],
        ].map(([k, v]) => (
          <div key={k} style={{ background: 'var(--surface-dark-card)', padding: '16px 20px' }}>
            <div className="label" style={{ marginBottom: 8 }}>{k}</div>
            <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 13, color: 'var(--color-white-outlined-text)' }}>{v}</div>
          </div>
        ))}
      </div>

      <div className="label" style={{ marginBottom: 14 }}>Included Strategies</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 1, background: 'var(--color-dark-grid)' }}>
        {(USE_MOCK ? strategies : bundle.strategy_ids.map(id => ({ token_id: id }))).map((s) => (
          <div key={s.token_id} style={{
            background: 'var(--surface-dark-card)', padding: '14px 20px',
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 80px', gap: 16, alignItems: 'center',
          }}>
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 12, color: 'var(--color-lime-interface)' }}>
              Strategy #{s.token_id}
            </span>
            {s.creator && <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--color-mid-gray-border)' }}>{s.creator.slice(0,8)}…</span>}
            {s.latest_score_bps != null && (
              <span style={{ fontFamily: 'var(--font-pt-serif)', fontSize: 16, color: 'var(--color-white-outlined-text)' }}>
                {(s.latest_score_bps / 100).toFixed(1)}%
              </span>
            )}
            <Link to={`/strategies/${s.token_id}`} style={{ color: 'var(--color-mid-gray-border)', fontFamily: 'var(--font-jetbrains)', fontSize: 11, textDecoration: 'none', textAlign: 'right' }}>
              VIEW →
            </Link>
          </div>
        ))}
      </div>
    </main>
  )
}
