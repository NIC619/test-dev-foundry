import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { WagmiConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from './config/wagmi';
import BlockMonitorPage from './pages/BlockMonitor';
import PredeploysPage from './pages/Predeploys';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="app-container">
            <nav className="navbar">
              <div className="nav-brand">L2 Monitor & Management</div>
              <div className="nav-links">
                <Link to="/">Block Monitor</Link>
                <Link to="/predeploys">Predeploys</Link>
              </div>
            </nav>

            <main className="main-content">
              <Routes>
                <Route path="/" element={<BlockMonitorPage />} />
                <Route path="/predeploys" element={<PredeploysPage />} />
              </Routes>
            </main>
          </div>
        </Router>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

export default App;
