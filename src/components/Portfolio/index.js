import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { tradeAPI } from '../../services/api.js';

export const Portfolio = () => {
  const { user, updateUser } = useAuth();
  const [portfolio, setPortfolio] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadPortfolio = async () => {
    setError('');
    try {
      const response = await tradeAPI.getPortfolio();
      setPortfolio(response.portfolio || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadPortfolio(); }, []);

  const portfolioValue = portfolio.reduce((total, position) => total + position.currentPrice * position.quantity, 0);
  const unrealizedPnL = portfolio.reduce((total, position) => total + position.pnl, 0);

  const handleSellAll = async (position) => {
    setError('');
    try {
      const response = await tradeAPI.sellStock(position.symbol, position.quantity);
      updateUser(response.user);
      await loadPortfolio();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  if (isLoading) return <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">Loading portfolio...</div>;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
      <h3 className="text-2xl font-bold text-slate-800 mb-4">Portfolio</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Available Cash</p>
          <p className="text-2xl font-bold text-slate-800">₹{Number(user?.balance || 0).toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Holdings</p>
          <p className="text-2xl font-bold text-slate-800">{portfolio.length}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Total P&L</p>
          <p className={`text-2xl font-bold ${unrealizedPnL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>₹{unrealizedPnL.toLocaleString()}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl bg-indigo-50 p-4">
        <div><p className="text-sm text-slate-500">Current holdings value</p><p className="text-xl font-bold text-slate-800">₹{portfolioValue.toLocaleString()}</p></div>
        <button type="button" onClick={loadPortfolio} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Refresh portfolio</button>
      </div>
      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
      <div className="mt-6 space-y-3">
        {portfolio.length === 0 && !error && <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">No open positions.</p>}
        {portfolio.map((position) => (
          <div key={position.symbol} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
            <div><p className="font-semibold text-slate-800">{position.symbol}</p><p className="text-sm text-slate-500">{position.quantity} shares at ₹{position.avgPrice.toLocaleString()}</p></div>
            <div className="flex items-center gap-4"><div className="text-right"><p className="text-sm text-slate-500">Value ₹{(position.currentPrice * position.quantity).toLocaleString()}</p><p className={position.pnl >= 0 ? 'font-semibold text-emerald-600' : 'font-semibold text-red-600'}>P&L ₹{position.pnl.toLocaleString()}</p></div><button type="button" onClick={() => handleSellAll(position)} className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100">Sell all</button></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Portfolio;
