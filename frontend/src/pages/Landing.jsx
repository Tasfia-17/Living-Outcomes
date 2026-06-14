import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { MOCK_LEADERBOARD } from '../lib/mockData'

const stats = [
  { value: '6',     label: 'Active strategies' },
  { value: '2',     label: 'Live bundles' },
  { value: '26.8%', label: 'Peak EWA score' },
  { value: '100%',  label: 'On-chain settlement' },
]

const features = [
  { tag: 'STRATEGY NFT',   title: 'On-Chain Ownership',         body: 'Every strategy is minted as an ERC-721 with ERC-2981 royalties. The NFT encodes price, royalty terms, fork lineage, and agent identity. Ownership is on-chain, not in a database.' },
  { tag: 'FORK ROYALTIES', title: 'Perpetual Creator Revenue',  body: 'Fork a strategy, link it on-chain. Every downstream sale routes a configurable royalty slice back to the original creator automatically. No invoices, no negotiation.' },
  { tag: 'BUNDLE REGISTRY', title: 'Composable Portfolios',     body: 'Assemble any set of strategies into a bundle. Revenue splits 70% to the assembler, 30% divided across constituent strategies. All enforced in Solidity.' },
  { tag: 'PERFORMANCE ORACLE', title: 'EWA Score On-Chain',     body: 'A reporter submits performance snapshots. The PerformanceOracle computes an Exponentially Weighted Average on-chain. Older snapshots carry higher weight. Scores are public and immutable.' },
  { tag: 'AGENT REGISTRY', title: 'ERC-8004 Identity',          body: 'Every creator maps to a verified agent identity. Reputation accrues to the agent across all strategies and bundles. No fake accounts. No stolen provenance.' },
  { tag: 'HASHKEY CHAIN',  title: 'Sub-cent Execution',         body: 'Royalty updates, performance snapshots, and price adjustments happen daily. Ethereum gas ($5+) makes this impossible. HashKey Chain makes it routine.' },
]

const ticker = [
  'HASHKEY CHAIN', '·', 'ERC-8004 IDENTITY', '·', 'FORK ROYALTIES', '·',
  'BUNDLE REGISTRY', '·', 'EWA SCORING', '·', 'ONCHAIN SETTLEMENT', '·',
  'AGENT ECONOMY', '·', 'MANTLE HACKATHON 2026', '·', 'PERPETUAL YIELD', '·',
]

const TERMINAL_LINES = [
  '> living-outcomes query --strategy 4',
  '  fetching from StrategyNFT...',
  '  reading PerformanceOracle...',
  '  creator=0xDave  fork_of=#2',
  '  price=2.0000 ETH  royalty=6%',
  '  ewa_score=26.80%  snapshots=6',
  '  rank=#1 on leaderboard',
]

function Terminal() {
  const [lines, setLines] = useState([])
  const [cursor, setCursor] = useState(0)

  useEffect(() => {
    if (cursor >= TERMINAL_LINES.length) {
      const t = setTimeout(() => { setLines([]); setCursor(0) }, 3000)
      return () => clearTimeout(t)
    }
    const delay = cursor === 0 ? 600 : cursor < 2 ? 400 : 700
    const t = setTimeout(() => {
      setLines(l => [...l, TERMINAL_LINES[cursor]])
      setCursor(c => c + 1)
    }, delay)
    return () => clearTimeout(t)
  }, [cursor])

  return (
    <div style={{
      background: '#000', border: '1px solid var(--color-dark-grid)',
      padding: '16px 20px', fontFamily: 'var(--font-jetbrains)', fontSize: 11,
      lineHeight: 1.8, minHeight: 160, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ color: 'var(--color-faint-grid)', marginBottom: 8, fontSize: 10, letterSpacing: '0.1em' }}>
        LIVING OUTCOMES NEXUS v1.0 · HASHKEY TESTNET
      </div>
      {lines.map((l, i) => (
        <div key={i} style={{
          color: l.includes('ewa_score') || l.includes('rank') ? 'var(--color-lime-interface)'
               : l.startsWith('  creator') || l.startsWith('  price') ? 'var(--color-white-outlined-text)'
               : l.startsWith('>') ? '#fff' : 'var(--color-mid-gray-border)',
          animation: 'fade-up 0.2s ease forwards',
        }}>{l}</div>
      ))}
      {cursor < TERMINAL_LINES.length && (
        <span style={{ color: 'var(--color-lime-interface)', animation: 'blink 1s step-end infinite' }}>█</span>
      )}
    </div>
  )
}

function GridCanvas() {
  const ref = useRef()
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const W = canvas.width, H = canvas.height

    const dots = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
      r: Math.random() * 1.2 + 0.3,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      ctx.strokeStyle = 'rgba(37,37,37,0.6)'
      ctx.lineWidth = 0.5
      for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
      for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy
        if (d.x < 0 || d.x > W) d.vx *= -1
        if (d.y < 0 || d.y > H) d.vy *= -1
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(197,255,74,0.4)'; ctx.fill()
      })

      dots.forEach((a, i) => dots.slice(i + 1).forEach(b => {
        const dist = Math.hypot(a.x - b.x, a.y - b.y)
        if (dist < 100) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `rgba(197,255,74,${0.08 * (1 - dist / 100)})`
          ctx.lineWidth = 0.5; ctx.stroke()
        }
      }))
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
}

export default function Landing() {
  const top3 = MOCK_LEADERBOARD.slice(0, 3)

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
      <div className="scanline" />

      {/* Hero */}
      <section style={{ padding: '80px 0 60px', borderBottom: '1px solid var(--color-dark-grid)', position: 'relative', overflow: 'hidden', minHeight: 480 }}>
        <GridCanvas />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 16 }}>
            <span className="label">Built on HashKey Chain · Mantle Turing Test Hackathon 2026</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-pt-serif)', fontSize: 72, fontWeight: 400, lineHeight: 1, letterSpacing: '-0.02em', maxWidth: 800, marginBottom: 24 }}>
            AI strategies that<br />
            <span className="lime glitch">pay you forever.</span>
          </h1>
          <p style={{ color: 'var(--color-white-outlined-text)', fontSize: 16, lineHeight: 1.6, maxWidth: 480, marginBottom: 36 }}>
            An open protocol where every strategy fork pays the original creator automatically, bundles split revenue among all contributors without negotiation, and real performance is tracked and scored on-chain.
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 40 }}>
            <Link to="/strategies" className="btn-lime pulse">Explore Strategies →</Link>
            <Link to="/leaderboard" className="btn-ghost">View Leaderboard</Link>
          </div>
          <div style={{ maxWidth: 560 }}>
            <Terminal />
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="ticker-wrap">
        <div className="ticker-inner">
          {[...ticker, ...ticker].map((t, i) => (
            <span key={i} style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, letterSpacing: '0.12em', color: t === '·' ? 'var(--color-faint-grid)' : 'var(--color-mid-gray-border)' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid var(--color-dark-grid)' }}>
        {stats.map(({ value, label }, i) => (
          <div key={i} className="fade-up" style={{ padding: '28px 22px', borderRight: i < 3 ? '1px solid var(--color-dark-grid)' : 'none' }}>
            <div style={{ fontFamily: 'var(--font-pt-serif)', fontSize: 40, fontWeight: 400, color: 'var(--color-lime-interface)', lineHeight: 1 }}>{value}</div>
            <div className="label" style={{ marginTop: 8 }}>{label}</div>
          </div>
        ))}
      </section>

      {/* How it works comparison */}
      <section style={{ padding: '40px 0', borderBottom: '1px solid var(--color-dark-grid)' }}>
        <div className="label" style={{ marginBottom: 16 }}>Why Living Outcomes</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: 'var(--color-dark-grid)' }}>
          {[
            { metric: 'Creator revenue',   us: 'Perpetual royalties', them: 'One-time sale' },
            { metric: 'Fork attribution',  us: 'On-chain lineage',    them: 'No record' },
            { metric: 'Performance truth', us: 'EWA oracle on-chain', them: 'Self-reported APY' },
            { metric: 'Bundle revenue',    us: 'Auto-split in Solidity', them: 'Manual negotiation' },
            { metric: 'Agent identity',    us: 'ERC-8004 verified',   them: 'API key or username' },
            { metric: 'Settlement',        us: 'Sub-cent on HashKey', them: 'Off-chain or $5+ gas' },
          ].map(({ metric, us, them }, i) => (
            <div key={i} className="fade-up card-trace" style={{ padding: '16px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, alignItems: 'center' }}>
              <span style={{ color: 'var(--color-mid-gray-border)', fontSize: 12 }}>{metric}</span>
              <span style={{ color: 'var(--color-lime-interface)', fontFamily: 'var(--font-jetbrains)', fontSize: 12 }}>{us}</span>
              <span style={{ color: 'var(--color-faint-grid)', fontFamily: 'var(--font-jetbrains)', fontSize: 12, textDecoration: 'line-through' }}>{them}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Live leaderboard preview */}
      <section style={{ padding: '40px 0', borderBottom: '1px solid var(--color-dark-grid)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div className="label">Live Leaderboard Preview</div>
          <Link to="/leaderboard" style={{ color: 'var(--color-lime-interface)', fontFamily: 'var(--font-jetbrains)', fontSize: 11, textDecoration: 'none', letterSpacing: '0.06em' }}>
            VIEW ALL →
          </Link>
        </div>
        <div style={{ border: '1px solid var(--color-dark-grid)' }}>
          {top3.map((entry, i) => (
            <div key={entry.strategy.token_id} className="fade-up" style={{
              display: 'grid', gridTemplateColumns: '40px 1fr 120px 100px 80px',
              gap: 16, padding: '14px 20px', alignItems: 'center',
              borderBottom: i < 2 ? '1px solid var(--color-dark-grid)' : 'none',
            }}>
              <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 13, color: 'var(--color-mid-gray-border)' }}>#{entry.rank}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--color-white-outlined-text)' }}>
                  Strategy #{entry.strategy.token_id}
                </div>
                <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 10, color: 'var(--color-mid-gray-border)', marginTop: 2 }}>
                  {entry.strategy.creator.slice(0, 8)}…{entry.strategy.creator.slice(-4)}
                </div>
              </div>
              <div style={{ height: 2, background: 'var(--color-dark-grid)', position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${Math.min(entry.score_bps / 30, 100)}%`, background: 'var(--color-lime-interface)' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-pt-serif)', fontSize: 18, color: 'var(--color-lime-interface)' }}>
                {(entry.score_bps / 100).toFixed(1)}%
              </span>
              <Link to={`/strategies/${entry.strategy.token_id}`} style={{ color: 'var(--color-mid-gray-border)', fontFamily: 'var(--font-jetbrains)', fontSize: 11, textDecoration: 'none', textAlign: 'right' }}>
                VIEW →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Core architecture features */}
      <section style={{ padding: '40px 0 60px' }}>
        <div className="label" style={{ marginBottom: 28 }}>Core Architecture</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--color-dark-grid)' }}>
          {features.map(({ tag, title, body }, i) => (
            <div key={i} className="card card-trace fade-up">
              <div className="label" style={{ color: 'var(--color-lime-interface)', marginBottom: 12 }}>{tag}</div>
              <div style={{ fontFamily: 'var(--font-pt-serif)', fontSize: 22, fontWeight: 400, lineHeight: 1.15, marginBottom: 12 }}>{title}</div>
              <div style={{ color: 'var(--color-mid-gray-border)', fontSize: 13, lineHeight: 1.6 }}>{body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--color-dark-grid)', padding: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--color-mid-gray-border)', letterSpacing: '0.06em' }}>
          LIVING OUTCOMES NEXUS · HASHKEY CHAIN · MANTLE 2026
        </span>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['Strategies', '/strategies'], ['Bundles', '/bundles'], ['Leaderboard', '/leaderboard']].map(([label, to]) => (
            <Link key={to} to={to} style={{ fontFamily: 'var(--font-inter-tight)', fontSize: 12, color: 'var(--color-mid-gray-border)', textDecoration: 'none' }}>{label}</Link>
          ))}
        </div>
      </footer>
    </main>
  )
}
