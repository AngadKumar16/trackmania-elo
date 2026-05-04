import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Leaderboard from './pages/Leaderboard'
import PlayerProfile from './pages/PlayerProfile'
import Tournaments from './pages/Tournaments'
import MonthlyHOF from './pages/MonthlyHOF'
import Admin from './pages/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0a0e1a]">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/"            element={<Leaderboard />} />
            <Route path="/players/:id" element={<PlayerProfile />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/monthly"     element={<MonthlyHOF />} />
            <Route path="/admin"       element={<Admin />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
