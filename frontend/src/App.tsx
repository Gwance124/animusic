import { Route, Routes } from 'react-router';
import { Home } from './pages/Home';
import { Navbar } from './components/Navbar';
import { Rank } from './pages/Rank.tsx';
import { Leaderboard } from './pages/Leaderboard.tsx';

function App() {

  return (
    <div className="min-h-screen bg-black text-gray-100 transition-opacity duration-700 pt-20">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rank" element={<Rank />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
