import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { AuthProvider } from './context/AuthContext.js';
import { useAuth } from './hooks/useAuth.js';
import { Header } from './components/Header.js';
import { Login, Register } from './components/Auth/index.js';
import { Trade } from './components/Trade/index.js';
import { Portfolio } from './components/Portfolio/index.js';
import { tradeAPI } from './services/api.js';

function AppContent() {
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const [showAuth, setShowAuth] = useState(!isAuthenticated);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [activeTab, setActiveTab] = useState('trade');
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [totalPnL, setTotalPnL] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      setShowAuth(true);
    } else if (isAuthenticated && !authLoading) {
      setShowAuth(false);
      setActiveTab('trade');
    }
  }, [isAuthenticated, authLoading]);

  // Calculate portfolio value and total P&L
  useEffect(() => {
    if (!isAuthenticated) return;

    const calculatePortfolioMetrics = async () => {
      try {
        const response = await tradeAPI.getPortfolio();
        const portfolio = response.portfolio || [];

        let pValue = 0;
        let pnlUnrealized = 0;

        portfolio.forEach(position => {
          pValue += (position.currentPrice || position.avgPrice) * position.quantity;
          pnlUnrealized += position.pnl || 0;
        });

        setPortfolioValue(pValue);
        setTotalPnL((user?.totalPnL || 0) + pnlUnrealized);
      } catch (error) {
        console.error('Error calculating portfolio metrics:', error);
      }
    };

    calculatePortfolioMetrics();
    // Recalculate every 3 seconds
    const interval = setInterval(calculatePortfolioMetrics, 3000);
    setIsLoading(false);

    return () => clearInterval(interval);
  }, [isAuthenticated, user?.totalPnL]);

  const handleLogout = async () => {
    await logout();
    setShowAuth(true);
    setAuthMode('login');
  };

  const handleSwitchToRegister = () => {
    setAuthMode('register');
  };

  const handleSwitchToLogin = () => {
    setAuthMode('login');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Activity className="text-indigo-600 animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600 font-medium">Loading Nifty 50 Paper Trading...</p>
        </div>
      </div>
    );
  }

  if (showAuth) {
    return authMode === 'login' ? (
      <Login onSwitchToRegister={handleSwitchToRegister} />
    ) : (
      <Register onSwitchToLogin={handleSwitchToLogin} />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Activity className="text-indigo-600 animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={user}
        portfolioValue={portfolioValue}
        totalPnL={totalPnL}
        onLogout={handleLogout}
      />

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-2 mb-6">
          {['trade', 'portfolio'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'trade' && <Trade />}
        {activeTab === 'portfolio' && <Portfolio />}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
