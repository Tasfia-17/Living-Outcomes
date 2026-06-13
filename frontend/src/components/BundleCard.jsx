import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './BundleCard.module.css';

function shortAddr(addr) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '—';
}

export default function BundleCard({ bundle }) {
  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
    >
      <div className={styles.header}>
        <span className={styles.id}>Bundle #{bundle.bundle_id}</span>
        <span className={`${styles.badge} ${bundle.active ? styles.active : styles.inactive}`}>
          {bundle.active ? 'Live' : 'Inactive'}
        </span>
      </div>
      <div className={styles.strategies}>
        {bundle.strategy_ids.map(id => (
          <Link key={id} to={`/strategies/${id}`} className={styles.stratTag}>
            #{id}
          </Link>
        ))}
      </div>
      <div className={styles.meta}>
        <div className={styles.row}>
          <span className={styles.label}>Assembler</span>
          <span className={styles.value}>{shortAddr(bundle.assembler)}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Price</span>
          <span className={styles.price}>{(Number(bundle.price_wei) / 1e18).toFixed(2)} ETH</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Strategies</span>
          <span className={styles.value}>{bundle.strategy_ids.length} included</span>
        </div>
      </div>
      <Link to={`/bundles/${bundle.bundle_id}`} className={styles.cta}>View Bundle</Link>
    </motion.div>
  );
}
