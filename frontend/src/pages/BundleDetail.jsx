import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { useApi } from '../lib/useApi';
import { MOCK_BUNDLES, MOCK_STRATEGIES } from '../lib/mockData';
import StrategyCard from '../components/StrategyCard';
import styles from './BundleDetail.module.css';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

function shortAddr(a) { return a ? `${a.slice(0,8)}…${a.slice(-6)}` : '—'; }

export default function BundleDetail() {
  const { id } = useParams();

  const { data: bundle, loading } = useApi(
    () => USE_MOCK
      ? Promise.resolve(MOCK_BUNDLES.find(b => b.bundle_id === Number(id)))
      : api.bundle(id),
    [id]
  );

  const strategies = USE_MOCK
    ? MOCK_STRATEGIES.filter(s => bundle?.strategy_ids?.includes(s.token_id))
    : [];

  if (loading) return <div className={styles.page}><p className={styles.msg}>Loading…</p></div>;
  if (!bundle) return <div className={styles.page}><p className={styles.msg}>Bundle not found.</p></div>;

  const totalEth = (Number(bundle.price_wei) / 1e18).toFixed(4);
  const n = bundle.strategy_ids.length;
  // Revenue split: 70% assembler, 30% split among strategies
  const assemblerPct = 70;
  const eachPct = n > 0 ? (30 / n).toFixed(1) : 0;

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.inner}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/bundles" className={styles.back}>← Bundles</Link>

        <div className={styles.topRow}>
          <div>
            <h1 className={styles.title}>Bundle #{bundle.bundle_id}</h1>
            <p className={styles.assembler}>Assembled by {shortAddr(bundle.assembler)}</p>
          </div>
          <div className={styles.priceBlock}>
            <span className={styles.price}>{totalEth} ETH</span>
            <span className={styles.priceLabel}>Bundle Price</span>
          </div>
        </div>

        {/* Revenue split visualisation */}
        <div className={styles.splitCard}>
          <p className={styles.splitTitle}>Revenue Split</p>
          <div className={styles.splitBar}>
            <motion.div
              className={styles.splitAssembler}
              style={{ width: `${assemblerPct}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${assemblerPct}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
            <motion.div
              className={styles.splitContribs}
              style={{ width: `${100 - assemblerPct}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${100 - assemblerPct}%` }}
              transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
            />
          </div>
          <div className={styles.splitLegend}>
            <div className={styles.legendItem}>
              <span className={styles.dotBlack} />
              <span>Assembler {assemblerPct}%</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.dotGray} />
              <span>Each strategy {eachPct}%</span>
            </div>
          </div>
        </div>

        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Strategies</span>
            <span className={styles.metaValue}>{n}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Status</span>
            <span className={`${styles.metaValue} ${bundle.active ? styles.live : ''}`}>
              {bundle.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <h2 className={styles.sectionHead}>Included Strategies</h2>
        <div className={styles.grid}>
          {(USE_MOCK ? strategies : bundle.strategy_ids).map((item, i) => {
            const s = USE_MOCK ? item : null;
            if (s) return <StrategyCard key={s.token_id} strategy={s} />;
            return (
              <Link key={item} to={`/strategies/${item}`} className={styles.stratLink}>
                Strategy #{item} →
              </Link>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
