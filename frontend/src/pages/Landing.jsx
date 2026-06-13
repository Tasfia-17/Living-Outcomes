import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import styles from './Landing.module.css';

// Classical painting references from public domain (Wikimedia)
const PAINTINGS = [
  { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/402px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg', label: 'Momentum Alpha', caption: 'RSI-driven position with slashing guard' },
  { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Bouguereau-1879-La_Naissance_de_V%C3%A9nus_detail.jpg/440px-Bouguereau-1879-La_Naissance_de_V%C3%A9nus_detail.jpg', label: 'Mean Reversion', caption: 'Bollinger Band reversion on mETH' },
  { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Rembrandt_Harmensz._van_Rijn_-_Zelfportret_-_Google_Art_Project.jpg/436px-Rembrandt_Harmensz._van_Rijn_-_Zelfportret_-_Google_Art_Project.jpg', label: 'Volatility Hedge', caption: 'EigenLayer slashing probability filter' },
];

const STATS = [
  { label: 'Strategies', value: '6' },
  { label: 'Bundles', value: '2' },
  { label: 'Total Creators', value: '6' },
  { label: 'Peak Score', value: '26.8%' },
];

function HeroWordmark() {
  return (
    <div className={styles.wordmarkWrap} aria-hidden="true">
      <motion.span
        className={styles.wordmark}
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        Living Outcomes
      </motion.span>
    </div>
  );
}

function HeroCluster() {
  return (
    <motion.div
      className={styles.cluster}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <p className={styles.tagline}>
        AI strategies that improve forever.<br />
        <em>Every contributor paid, onchain.</em>
      </p>
      <div className={styles.statsRow}>
        {STATS.map(s => (
          <div key={s.label} className={styles.stat}>
            <span className={styles.statVal}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>
      <Link to="/strategies" className={styles.ctaBtn}>Explore Strategies</Link>
    </motion.div>
  );
}

function FeatureSection() {
  return (
    <section className={styles.featureSection}>
      <motion.h2
        className={styles.featureHeading}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        The Gallery
      </motion.h2>
      <p className={styles.featureSub}>Three pillars of the living marketplace</p>
      <div className={styles.vignettesGrid}>
        {PAINTINGS.map((p, i) => (
          <motion.div
            key={p.label}
            className={styles.vignette}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className={styles.vignetteTitle}>{p.label}</p>
            <div className={styles.vignetteCircle}>
              <img src={p.src} alt={p.label} loading="lazy" />
            </div>
            <p className={styles.vignetteCaption}>{p.caption}</p>
            <HexDot />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function HexDot() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" className={styles.hexDot}>
      <polygon points="6,1 11,3.5 11,8.5 6,11 1,8.5 1,3.5" stroke="currentColor" strokeWidth="1" fill="none"/>
    </svg>
  );
}

function HowItWorksSection() {
  const steps = [
    { n: '01', title: 'Create', body: 'Upload a strategy. Mint an NFT. Set your price and royalty.' },
    { n: '02', title: 'Improve', body: 'Fork any strategy. Improve it. Original creator earns royalties automatically — forever.' },
    { n: '03', title: 'Bundle', body: 'Assemble strategies into portfolios. Revenue splits onchain, no negotiation.' },
    { n: '04', title: 'Perform', body: 'The oracle tracks real performance. Scores update on-chain. Rankings shift.' },
  ];

  return (
    <section className={styles.howSection}>
      <motion.h2
        className={styles.howHeading}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        How It Works
      </motion.h2>
      <div className={styles.stepsGrid}>
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            className={styles.step}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
          >
            <span className={styles.stepNum}>{s.n}</span>
            <h3 className={styles.stepTitle}>{s.title}</h3>
            <p className={styles.stepBody}>{s.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function PaintingBanner() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-40, 40]);

  return (
    <section ref={ref} className={styles.paintingBanner} aria-hidden="true">
      <motion.div className={styles.paintingInner} style={{ y }}>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg"
          alt="The Starry Night"
          className={styles.paintingImg}
        />
      </motion.div>
      <div className={styles.paintingCard}>
        <span className={styles.paintingScroll}>SCROLL</span>
        <p className={styles.paintingCardTitle}>Every strategy<br />a living work</p>
        <Link to="/leaderboard" className={styles.paintingCta}>View Leaderboard</Link>
      </div>
    </section>
  );
}

function MarqueeSection() {
  const items = ['LIVING OUTCOMES', 'ONCHAIN ROYALTIES', 'EVOLVING STRATEGIES', 'PERPETUAL YIELD', 'HASHKEY CHAIN', 'REAL PERFORMANCE', 'AI EXECUTION'];
  const doubled = [...items, ...items];

  return (
    <div className={styles.marqueeWrap}>
      <motion.div
        className={styles.marqueeTrack}
        animate={{ x: '-50%' }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((item, i) => (
          <span key={i} className={styles.marqueeItem}>
            {item}
            <svg width="6" height="6" viewBox="0 0 6 6" className={styles.marqueeDot}>
              <circle cx="3" cy="3" r="3" fill="currentColor"/>
            </svg>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function CtaBanner() {
  return (
    <section className={styles.ctaBanner}>
      <motion.h2
        className={styles.ctaHeading}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        Your strategy.<br />
        <em>Alive forever.</em>
      </motion.h2>
      <motion.div
        className={styles.ctaBtns}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Link to="/strategies" className={styles.ctaPrimary}>Browse Strategies</Link>
        <Link to="/bundles" className={styles.ctaGhost}>Explore Bundles</Link>
      </motion.div>
    </section>
  );
}

export default function Landing() {
  return (
    <main className={styles.main}>
      {/* Hero */}
      <section className={styles.hero}>
        <HeroCluster />
        <HeroWordmark />
      </section>

      {/* Marquee */}
      <MarqueeSection />

      {/* Feature Gallery */}
      <FeatureSection />

      {/* Painting + product card */}
      <PaintingBanner />

      {/* How it works */}
      <HowItWorksSection />

      {/* CTA */}
      <CtaBanner />

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerBrand}>Living Outcomes</span>
          <span className={styles.footerNote}>Built on HashKey Chain · Mantle Turing Test Hackathon 2026</span>
          <div className={styles.footerLinks}>
            <Link to="/strategies" className={styles.footerLink}>Strategies</Link>
            <Link to="/bundles" className={styles.footerLink}>Bundles</Link>
            <Link to="/leaderboard" className={styles.footerLink}>Leaderboard</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
