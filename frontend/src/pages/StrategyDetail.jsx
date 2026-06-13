import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { useApi } from '../lib/useApi';
import { MOCK_STRATEGIES } from '../lib/mockData';
import styles from './StrategyDetail.module.css';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

function shortAddr(addr) { return addr ? `${addr.slice(0, 8)}…${addr.slice(-6)}` : '—'; }
function formatEth(wei) { return (Number(wei) / 1e18).toFixed(4); }

function ScoreChart({ snapshots }) {
  if (!snapshots?.length) return <p className={styles.noData}>No performance data yet.</p>;

  const maxScore = Math.max(...snapshots.map(s => s.return_bps));
  const w = 560, h = 120, pad = 20;

  const points = snapshots.map((s, i) => {
    const x = pad + (i / Math.max(snapshots.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - ((s.return_bps / maxScore) * (h - pad * 2));
    return [x, y];
  });

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const area = `${path} L${points[points.length-1][0]},${h} L${pad},${h} Z`;

  return (
    <div className={styles.chartWrap}>
      <p className={styles.chartLabel}>Return BPS · {snapshots.length} snapshots</p>
      <svg viewBox={`0 0 ${w} ${h}`} className={styles.chart} preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-ink)" stopOpacity="0.12"/>
            <stop offset="100%" stopColor="var(--color-ink)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={area} fill="url(#areaGrad)"/>
        <motion.path
          d={path}
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        {points.map(([x, y], i) => (
          <motion.circle
            key={i} cx={x} cy={y} r="3"
            fill="var(--color-bone)" stroke="var(--color-ink)" strokeWidth="1.5"
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 1 + i * 0.05 }}
          />
        ))}
      </svg>
    </div>
  );
}

export default function StrategyDetail() {
  const { id } = useParams();
  const { data: strategy, loading: sLoading } = useApi(
    () => USE_MOCK
      ? Promise.resolve(MOCK_STRATEGIES.find(s => s.token_id === Number(id)))
      : api.strategy(id),
    [id]
  );
  const { data: snapshots } = useApi(
    () => USE_MOCK ? Promise.resolve([]) : api.snapshots(id),
    [id]
  );

  if (sLoading) return <div className={styles.page}><div className={styles.loading}>Loading…</div></div>;
  if (!strategy) return <div className={styles.page}><div className={styles.loading}>Strategy not found.</div></div>;

  const score = strategy.latest_score_bps ?? 0;

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.inner}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.breadcrumb}>
          <Link to="/strategies" className={styles.back}>← Strategies</Link>
        </div>

        <div className={styles.topRow}>
          <div>
            <h1 className={styles.title}>Strategy #{strategy.token_id}</h1>
            <p className={styles.creator}>{shortAddr(strategy.creator)}</p>
          </div>
          <div className={styles.scoreBlock}>
            <motion.span
              className={styles.score}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {(score / 100).toFixed(1)}%
            </motion.span>
            <span className={styles.scoreLabel}>EWA Score</span>
          </div>
        </div>

        <div className={styles.metaGrid}>
          {[
            { label: 'Token ID', value: `#${strategy.token_id}` },
            { label: 'Price', value: `${formatEth(strategy.price_wei)} ETH` },
            { label: 'Royalty', value: `${strategy.royalty_bps / 100}%` },
            { label: 'Parent Royalty', value: strategy.parent_royalty_bps > 0 ? `${strategy.parent_royalty_bps / 100}%` : 'Root' },
            { label: 'Agent ID', value: shortAddr(strategy.agent_id) },
            { label: 'Snapshots', value: strategy.snapshot_count },
          ].map(item => (
            <div key={item.label} className={styles.metaItem}>
              <span className={styles.metaLabel}>{item.label}</span>
              <span className={styles.metaValue}>{item.value}</span>
            </div>
          ))}
        </div>

        {strategy.parent_id > 0 && (
          <div className={styles.forkNotice}>
            <span>Fork of </span>
            <Link to={`/strategies/${strategy.parent_id}`} className={styles.forkLink}>
              Strategy #{strategy.parent_id}
            </Link>
            <span> — original creator receives {strategy.parent_royalty_bps / 100}% royalty on each sale.</span>
          </div>
        )}

        <div className={styles.contentHash}>
          <span className={styles.metaLabel}>Content Hash</span>
          <code className={styles.hash}>{strategy.content_hash}</code>
        </div>

        <ScoreChart snapshots={snapshots || []} />
      </motion.div>
    </div>
  );
}
