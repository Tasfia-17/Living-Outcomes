import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { useApi } from '../lib/useApi';
import { MOCK_BUNDLES } from '../lib/mockData';
import BundleCard from '../components/BundleCard';
import Loader from '../components/Loader';
import styles from './Bundles.module.css';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export default function Bundles() {
  const { data, loading } = useApi(() =>
    USE_MOCK ? Promise.resolve(MOCK_BUNDLES) : api.bundles()
  );

  const bundles = data?.filter(b => b.active) ?? [];

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h1 className={styles.title}>Bundles</h1>
          <p className={styles.subtitle}>
            {data ? `${bundles.length} active bundles` : '—'}
          </p>
        </div>
      </motion.div>

      <div className={styles.explainer}>
        <p className={styles.explainerText}>
          Bundles combine multiple strategies into a portfolio. Revenue splits automatically on-chain — assembler takes the majority, each constituent strategy earns a proportional share.
        </p>
      </div>

      {loading && <Loader rows={2} />}

      <div className={styles.grid}>
        {bundles.map(b => (
          <BundleCard key={b.bundle_id} bundle={b} />
        ))}
      </div>
    </div>
  );
}
