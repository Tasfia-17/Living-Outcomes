import { motion } from 'framer-motion';
import styles from './Loader.module.css';

export default function Loader({ rows = 3 }) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: rows }).map((_, i) => (
        <motion.div
          key={i}
          className={styles.skeleton}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}
