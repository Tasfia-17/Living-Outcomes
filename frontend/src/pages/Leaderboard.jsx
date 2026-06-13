import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useApi } from '../lib/useApi';
import { MOCK_LEADERBOARD } from '../lib/mockData';
import styles from './Leaderboard.module.css';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

function shortAddr(addr) { return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '—'; }

function RankRow({ entry, maxScore, index }) {
  const pct = maxScore > 0 ? (entry.score_bps / maxScore) * 100 : 0;
  const medal = index === 0 ? '◆' : index === 1 ? '◇' : index === 2 ? '△' : null;

  return (
    <motion.div
      className={`${styles.row} ${index < 3 ? styles[`top${index + 1}`] : ''}`}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className={styles.rankNum}>
        {medal ? <span className={styles.medal}>{medal}</span> : entry.rank}
      </span>

      <div className={styles.barCell}>
        <motion.div
          className={styles.bar}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.4 + index * 0.06, ease: 'easeOut' }}
        />
      </div>

      <span className={styles.creator}>{shortAddr(entry.strategy.creator)}</span>
      <span className={styles.score}>{(entry.score_bps / 100).toFixed(2)}%</span>
      <span className={styles.snapshots}>{entry.strategy.snapshot_count} snaps</span>
      <Link to={`/strategies/${entry.strategy.token_id}`} className={styles.viewLink}>
        #{entry.strategy.token_id} →
      </Link>
    </motion.div>
  );
}

export default function Leaderboard() {
  const { data, loading } = useApi(() =>
    USE_MOCK ? Promise.resolve(MOCK_LEADERBOARD) : api.leaderboard(20)
  );

  const maxScore = data ? Math.max(...data.map(e => e.score_bps)) : 1;

  return (
    <div className={styles.page}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={styles.headerWrap}
      >
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Leaderboard</h1>
            <p className={styles.subtitle}>Ranked by on-chain EWA performance score</p>
          </div>
          {data?.[0] && (
            <div className={styles.topCard}>
              <span className={styles.topLabel}>Top Performer</span>
              <span className={styles.topScore}>{(data[0].score_bps / 100).toFixed(1)}%</span>
              <span className={styles.topCreator}>{shortAddr(data[0].strategy.creator)}</span>
            </div>
          )}
        </div>
      </motion.div>

      <div className={styles.tableWrap}>
        <div className={styles.tableHeader}>
          <span>#</span>
          <span>Performance</span>
          <span>Creator</span>
          <span>Score</span>
          <span>Snapshots</span>
          <span></span>
        </div>
        <AnimatePresence>
          {loading && (
            <motion.div className={styles.loadingRows} exit={{ opacity: 0 }}>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className={styles.skelRow}
                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        {data?.map((entry, i) => (
          <RankRow key={entry.strategy.token_id} entry={entry} maxScore={maxScore} index={i} />
        ))}
      </div>
    </div>
  );
}
