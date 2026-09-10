import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { tradeAPI } from '../../services/api.js';

export const Portfolio = () => {
  const { updateUser } = useAuth();
  const [portfolio, setPortfolio] = useState([]);
  const [error, setError] = useState('');
  const [quantities, setQuantities] = useState({});
  const [processingSymbol, setProcessingSymbol] = useState('');
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
  const investedValue = portfolio.reduce((total, position) => total + position.avgPrice * position.quantity, 0);
  const unrealizedPnL = portfolio.reduce((total, position) => total + position.pnl, 0);

  const handleTrade = async (position, type) => {
    setError('');
    const quantity = Math.max(1, parseInt(quantities[position.symbol], 10) || 1);
    setQuantities((current) => ({ ...current, [position.symbol]: quantity }));
    setProcessingSymbol(position.symbol);
    try {
      const response = type === 'BUY'
        ? await tradeAPI.buyStock(position.symbol, quantity)
        : await tradeAPI.sellStock(position.symbol, quantity);
      updateUser(response.user);
      await loadPortfolio();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setProcessingSymbol('');
    }
  };

  if (isLoading) return <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">Loading portfolio...</div>;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
      <h3 className="text-2xl font-bold text-slate-800 mb-4">Portfolio</h3>
      <div className="hidden grid-cols-3 gap-4 sm:grid">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Holding Value</p>
          <p className="text-2xl font-bold text-slate-800">₹{portfolioValue.toLocaleString()}</p>
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
      <div className="mt-4 hidden items-center justify-between rounded-xl bg-indigo-50 p-4 sm:flex">
        <div><p className="text-sm text-slate-500">Current holdings value</p><p className="text-xl font-bold text-slate-800">₹{portfolioValue.toLocaleString()}</p></div>
        <button type="button" onClick={loadPortfolio} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Refresh portfolio</button>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:hidden">
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-xs text-slate-500">Invested</p><p className="mt-1 text-lg font-bold text-slate-800">₹{investedValue.toLocaleString()}</p></div>
          <div className="border-l border-slate-200 pl-4"><p className="text-xs text-slate-500">Current</p><p className="mt-1 text-lg font-bold text-slate-800">₹{portfolioValue.toLocaleString()}</p></div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3"><span className="text-sm text-slate-500">P&amp;L</span><strong className={unrealizedPnL >= 0 ? 'text-emerald-600' : 'text-red-600'}>₹{unrealizedPnL.toLocaleString()}</strong></div>
      </div>
      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
      <div className="mt-6 hidden overflow-x-auto sm:block">
        {portfolio.length === 0 && !error && <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">No open positions.</p>}
        {portfolio.length > 0 && <table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-slate-200 text-slate-500"><tr><th className="px-3 py-3">Company</th><th className="px-3 py-3">Quantity</th><th className="px-3 py-3">Avg. price</th><th className="px-3 py-3">Total value</th><th className="px-3 py-3">P&amp;L</th><th className="px-3 py-3">Trade quantity</th><th className="px-3 py-3">Action</th></tr></thead><tbody>{portfolio.map((position) => <tr key={position.symbol} className="border-b border-slate-100"><td className="px-3 py-3 font-semibold text-slate-800">{position.symbol}</td><td className="px-3 py-3">{position.quantity}</td><td className="px-3 py-3">₹{position.avgPrice.toLocaleString()}</td><td className="px-3 py-3">₹{(position.currentPrice * position.quantity).toLocaleString()}</td><td className={`px-3 py-3 font-semibold ${position.pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>₹{position.pnl.toLocaleString()}</td><td className="px-3 py-3"><input aria-label={`Trade quantity for ${position.symbol}`} type="number" min="1" step="1" value={quantities[position.symbol] ?? 1} onChange={(event) => setQuantities((current) => ({ ...current, [position.symbol]: event.target.value }))} onBlur={() => setQuantities((current) => ({ ...current, [position.symbol]: Math.max(1, parseInt(current[position.symbol], 10) || 1) }))} className="w-20 rounded-lg border border-slate-300 px-2 py-2" /></td><td className="px-3 py-3"><div className="flex gap-2"><button type="button" disabled={processingSymbol === position.symbol} onClick={() => handleTrade(position, 'BUY')} className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50">Buy</button><button type="button" disabled={processingSymbol === position.symbol} onClick={() => handleTrade(position, 'SELL')} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50">Sell</button></div></td></tr>)}</tbody></table>}
      </div>
      <div className="mt-6 space-y-3 sm:hidden">
        {portfolio.length === 0 && !error && <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">No open positions.</p>}
        {portfolio.map((position) => <article key={position.symbol} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between"><div><h4 className="font-bold text-slate-800">{position.symbol}</h4><p className="mt-1 text-xs text-slate-500">Avg. price ₹{position.avgPrice.toLocaleString()}</p></div><div className="text-right"><p className="text-xs text-slate-500">Quantity</p><p className="font-bold text-slate-800">{position.quantity}</p></div></div><div className="mt-4 grid grid-cols-2 gap-3 border-y border-slate-100 py-3"><div><p className="text-xs text-slate-500">Total value</p><p className="font-semibold text-slate-800">₹{(position.currentPrice * position.quantity).toLocaleString()}</p></div><div><p className="text-xs text-slate-500">P&amp;L</p><p className={`font-semibold ${position.pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>₹{position.pnl.toLocaleString()}</p></div></div><div className="mt-3 flex gap-2"><input aria-label={`Trade quantity for ${position.symbol}`} type="number" min="1" step="1" value={quantities[position.symbol] ?? 1} onChange={(event) => setQuantities((current) => ({ ...current, [position.symbol]: event.target.value }))} onBlur={() => setQuantities((current) => ({ ...current, [position.symbol]: Math.max(1, parseInt(current[position.symbol], 10) || 1) }))} className="w-20 rounded-lg border border-slate-300 px-2 py-2 text-sm" /><button type="button" disabled={processingSymbol === position.symbol} onClick={() => handleTrade(position, 'BUY')} className="flex-1 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 disabled:opacity-50">Buy</button><button type="button" disabled={processingSymbol === position.symbol} onClick={() => handleTrade(position, 'SELL')} className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 disabled:opacity-50">Sell</button></div></article>)}
      </div>
    </div>
  );
};

export default Portfolio;
