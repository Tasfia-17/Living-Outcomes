import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Nav from './components/Nav';
import Landing from './pages/Landing';
import Strategies from './pages/Strategies';
import StrategyDetail from './pages/StrategyDetail';
import Bundles from './pages/Bundles';
import BundleDetail from './pages/BundleDetail';
import Leaderboard from './pages/Leaderboard';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

function AnimatedRoutes() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <>
      {!isLanding && <Nav />}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <Routes location={location}>
            <Route path="/"                    element={<Landing />} />
            <Route path="/strategies"          element={<Strategies />} />
            <Route path="/strategies/:id"      element={<StrategyDetail />} />
            <Route path="/bundles"             element={<Bundles />} />
            <Route path="/bundles/:id"         element={<BundleDetail />} />
            <Route path="/leaderboard"         element={<Leaderboard />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
