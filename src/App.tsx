import { Routes, Route } from 'react-router-dom';
import TopNav from './components/TopNav';
import Dashboard from './pages/Dashboard';
import Athletes from './pages/Athletes';
import Poles from './pages/Poles';
import Meets from './pages/Meets';
import Settings from './pages/Settings';

export default function App() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <TopNav />
      <div className="px-4 py-6 max-w-4xl">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/athletes" element={<Athletes />} />
          <Route path="/poles" element={<Poles />} />
          <Route path="/meets" element={<Meets />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}
