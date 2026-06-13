import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './StrategyCard.module.css';

function shortAddr(addr) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '—';
}

function formatEth(wei) {
  return (Number(wei) / 1e18).toFixed(2);
}

export default function StrategyCard({ strategy, rank }) {
  const score = strategy.latest_score_bps ?? 0;
  const tier = score >= 2000 ? 'elite' : score >= 1500 ? 'strong' : 'base';

  return (
    <motion.div
      className={`${styles.card} ${styles[tier]}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
    >
      {rank && <span className={styles.rank}>#{rank}</span>}
      <div className={styles.scoreBar}>
        <motion.div
          className={styles.scoreFill}
          initial={{ width: 0 }}
          whileInView={{ width: `${Math.min(score / 30, 100)}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        />
      </div>
      <div className={styles.body}>
        <div className={styles.row}>
          <span className={styles.label}>Strategy</span>
          <span className={styles.value}>#{strategy.token_id}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Creator</span>
          <span className={styles.value}>{shortAddr(strategy.creator)}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Score</span>
          <span className={styles.scoreVal}>{(score / 100).toFixed(1)}%</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Price</span>
          <span className={styles.value}>{formatEth(strategy.price_wei)} ETH</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Royalty</span>
          <span className={styles.value}>{strategy.royalty_bps / 100}%</span>
        </div>
        {strategy.parent_id > 0 && (
          <div className={styles.row}>
            <span className={styles.label}>Fork of</span>
            <Link to={`/strategies/${strategy.parent_id}`} className={styles.forkLink}>
              #{strategy.parent_id}
            </Link>
          </div>
        )}
      </div>
      <Link to={`/strategies/${strategy.token_id}`} className={styles.cta}>
        View Strategy
      </Link>
    </motion.div>
  );
}
