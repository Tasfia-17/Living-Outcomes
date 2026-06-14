import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Landing from './pages/Landing'
import Strategies from './pages/Strategies'
import StrategyDetail from './pages/StrategyDetail'
import Bundles from './pages/Bundles'
import BundleDetail from './pages/BundleDetail'
import Leaderboard from './pages/Leaderboard'

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/"               element={<Landing />} />
        <Route path="/strategies"     element={<Strategies />} />
        <Route path="/strategies/:id" element={<StrategyDetail />} />
        <Route path="/bundles"        element={<Bundles />} />
        <Route path="/bundles/:id"    element={<BundleDetail />} />
        <Route path="/leaderboard"    element={<Leaderboard />} />
      </Routes>
    </BrowserRouter>
  )
}
