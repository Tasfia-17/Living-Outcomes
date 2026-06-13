import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './Nav.module.css';

export default function Nav() {
  const { pathname } = useLocation();

  return (
    <motion.header
      className={styles.header}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to="/" className={styles.logo} aria-label="Living Outcomes">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.5"/>
          <text x="16" y="21" textAnchor="middle" fontFamily="var(--font-serif)" fontSize="16" fontWeight="500" fill="currentColor">L</text>
        </svg>
      </Link>
      <nav className={styles.nav}>
        <Link to="/strategies" className={`${styles.link} ${pathname.startsWith('/strategies') ? styles.active : ''}`}>Strategies</Link>
        <Link to="/bundles" className={`${styles.link} ${pathname.startsWith('/bundles') ? styles.active : ''}`}>Bundles</Link>
        <Link to="/leaderboard" className={`${styles.link} ${pathname.startsWith('/leaderboard') ? styles.active : ''}`}>Leaderboard</Link>
      </nav>
    </motion.header>
  );
}
