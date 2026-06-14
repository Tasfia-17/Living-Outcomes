import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import { MOCK_BUNDLES } from '../lib/mockData'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

function shortAddr(a) { return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '—' }

export default function Bundles() {
  const { data, loading } = useApi(() =>
    USE_MOCK ? Promise.resolve(MOCK_BUNDLES) : api.bundles()
  )

  const bundles = data?.filter(b => b.active) ?? []

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px' }}>
      <div className="label" style={{ marginBottom: 12 }}>Bundle Registry</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 className="subheading" style={{ marginBottom: 6 }}>All Bundles</h1>
          <span style={{ color: 'var(--color-mid-gray-border)', fontSize: 13 }}>
            {data ? `${bundles.length} active` : '—'}
          </span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="label" style={{ marginBottom: 10, color: 'var(--color-lime-interface)' }}>How Bundle Revenue Works</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--color-dark-grid)', marginTop: 12 }}>
          {[
            { pct: '70%', role: 'Assembler', desc: 'Creator of the bundle receives the majority cut on every sale' },
            { pct: '30%', role: 'Strategies', desc: 'Split evenly across all constituent strategies in the bundle' },
            { pct: '0%',  role: 'Negotiation', desc: 'No invoices, no manual splits — all enforced in Solidity' },
          ].map(({ pct, role, desc }) => (
            <div key={role} style={{ background: 'var(--surface-dark-card)', padding: '16px 20px' }}>
              <div style={{ fontFamily: 'var(--font-pt-serif)', fontSize: 32, color: 'var(--color-lime-interface)', lineHeight: 1, marginBottom: 6 }}>{pct}</div>
              <div className="label" style={{ marginBottom: 6 }}>{role}</div>
              <div style={{ color: 'var(--color-mid-gray-border)', fontSize: 12, lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: 'var(--color-dark-grid)' }}>
          {[1, 2].map(i => <div key={i} style={{ height: 240, background: 'var(--surface-dark-card)' }} />)}
        </div>
      )}

      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: 'var(--color-dark-grid)' }}>
          {bundles.map((b, i) => (
            <div key={b.bundle_id} className="card card-trace fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="label" style={{ color: 'var(--color-lime-interface)', marginBottom: 4 }}>Bundle #{b.bundle_id}</div>
                  <div style={{ fontFamily: 'var(--font-pt-serif)', fontSize: 28, lineHeight: 1 }}>
                    {(Number(b.price_wei) / 1e18).toFixed(2)} ETH
                  </div>
                </div>
                <span className="badge badge-active">LIVE</span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {b.strategy_ids.map(id => (
                  <Link key={id} to={`/strategies/${id}`} style={{
                    fontFamily: 'var(--font-jetbrains)', fontSize: 10, padding: '3px 8px',
                    border: '1px solid var(--color-faint-grid)', color: 'var(--color-mid-gray-border)',
                    textDecoration: 'none', letterSpacing: '0.06em',
                  }}>
                    #{id}
                  </Link>
                ))}
              </div>

              {[
                ['Assembler',   shortAddr(b.assembler)],
                ['Strategies',  `${b.strategy_ids.length} included`],
                ['Each strategy', `${(30 / b.strategy_ids.length).toFixed(1)}% revenue share`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-dark-grid)', paddingBottom: 8 }}>
                  <span style={{ color: 'var(--color-mid-gray-border)', fontSize: 12 }}>{k}</span>
                  <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--color-white-outlined-text)' }}>{v}</span>
                </div>
              ))}

              <Link to={`/bundles/${b.bundle_id}`} className="btn-ghost" style={{ fontSize: 12, padding: '8px 14px', alignSelf: 'flex-start' }}>
                View Bundle →
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
