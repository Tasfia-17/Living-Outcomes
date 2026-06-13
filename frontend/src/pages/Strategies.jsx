import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { useApi } from '../lib/useApi';
import { MOCK_STRATEGIES } from '../lib/mockData';
import StrategyCard from '../components/StrategyCard';
import Loader from '../components/Loader';
import styles from './Strategies.module.css';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export default function Strategies() {
  const { data, loading, error } = useApi(() =>
    USE_MOCK ? Promise.resolve(MOCK_STRATEGIES) : api.strategies()
  );
  const [sort, setSort] = useState('score');
  const [filter, setFilter] = useState('');

  const strategies = data
    ? [...data]
        .filter(s => s.active)
        .filter(s => filter === '' || s.parent_id === (filter === 'fork' ? undefined : filter === 'root' ? 0 : undefined))
        .sort((a, b) => {
          if (sort === 'score') return (b.latest_score_bps ?? 0) - (a.latest_score_bps ?? 0);
          if (sort === 'price') return b.price_wei - a.price_wei;
          if (sort === 'newest') return b.token_id - a.token_id;
          return 0;
        })
    : [];

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h1 className={styles.title}>Strategies</h1>
          <p className={styles.subtitle}>
            {data ? `${data.filter(s => s.active).length} active strategies` : '—'}
          </p>
        </div>
        <div className={styles.controls}>
          <select className={styles.select} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="score">Sort: Score</option>
            <option value="price">Sort: Price</option>
            <option value="newest">Sort: Newest</option>
          </select>
          <select className={styles.select} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All</option>
            <option value="root">Root only</option>
            <option value="fork">Forks only</option>
          </select>
        </div>
      </motion.div>

      {loading && <Loader rows={6} />}
      {error && <p className={styles.error}>Could not connect to backend — showing mock data.</p>}

      <div className={styles.grid}>
        {strategies.map((s, i) => (
          <StrategyCard key={s.token_id} strategy={s} />
        ))}
      </div>
    </div>
  );
}
