import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { tradeAPI } from '../../services/api.js';

export const Portfolio = () => {
  const { user, updateUser } = useAuth();
  const [portfolio, setPortfolio] = useState([]);
  const [error, setError] = useState('');
  const [quantities, setQuantities] = useState({});
  const [processingSymbol, setProcessingSymbol] = useState('');
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [toast, setToast] = useState(null);
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

  useEffect(() => {
    if (!selectedPosition) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!event.target.closest('[data-portfolio-sheet]') && !event.target.closest('[data-portfolio-card]')) {
        setSelectedPosition(null);
      }
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [selectedPosition]);

  const portfolioValue = portfolio.reduce((total, position) => total + position.currentPrice * position.quantity, 0);
  const investedValue = portfolio.reduce((total, position) => total + position.avgPrice * position.quantity, 0);
  const unrealizedPnL = portfolio.reduce((total, position) => total + position.pnl, 0);
  const selectedQuantity = selectedPosition ? Number(quantities[selectedPosition.symbol] || 0) : 0;
  const selectedOrderAmount = selectedPosition ? selectedPosition.currentPrice * selectedQuantity : 0;
  const availableBalance = Number(user?.balance || 0);
  const selectedHasBalance = selectedOrderAmount > 0 && selectedOrderAmount <= availableBalance;

  const handleTrade = async (position, type) => {
    setError('');
    const quantity = Math.max(1, parseInt(quantities[position.symbol], 10) || 1);
    setQuantities((current) => ({ ...current, [position.symbol]: quantity }));
    if (type === 'BUY' && quantity * position.currentPrice > Number(user?.balance || 0)) {
      setError('Insufficient balance for this order');
      return;
    }
    setProcessingSymbol(position.symbol);
    try {
      const response = type === 'BUY'
        ? await tradeAPI.buyStock(position.symbol, quantity)
        : await tradeAPI.sellStock(position.symbol, quantity);
      updateUser(response.user);
      setToast({ type: 'success', text: `${type === 'BUY' ? 'Added' : 'Sold short'} ${quantity} ${position.symbol} share${quantity === 1 ? '' : 's'} successfully` });
      window.setTimeout(() => setToast(null), 3500);
      setSelectedPosition(null);
      await loadPortfolio();
    } catch (requestError) {
      setError(requestError.message);
      setToast({ type: 'error', text: requestError.message });
      window.setTimeout(() => setToast(null), 4500);
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
      <div className="mt-6 hidden overflow-hidden sm:block">
        {portfolio.length === 0 && !error && <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">No open positions.</p>}
        {portfolio.length > 0 && <table className="w-full table-fixed text-left text-xs"><thead className="border-b border-slate-200 text-slate-500"><tr><th className="px-2 py-3">Company</th><th className="px-2 py-3">Qty</th><th className="px-2 py-3">Avg. price</th><th className="px-2 py-3">Total value</th><th className="px-2 py-3">P&amp;L</th><th className="px-2 py-3">Trade qty</th><th className="px-2 py-3">Action</th></tr></thead><tbody>{portfolio.map((position) => <tr key={position.symbol} className="border-b border-slate-100"><td className="px-2 py-3 font-semibold text-slate-800">{position.symbol}</td><td className="px-2 py-3">{position.quantity}</td><td className="px-2 py-3">₹{position.avgPrice.toLocaleString()}</td><td className="px-2 py-3">₹{(position.currentPrice * position.quantity).toLocaleString()}</td><td className={`px-2 py-3 font-semibold ${position.pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>₹{position.pnl.toLocaleString()}</td><td className="px-2 py-3"><input aria-label={`Trade quantity for ${position.symbol}`} type="number" min="1" step="1" value={quantities[position.symbol] ?? 1} onChange={(event) => setQuantities((current) => ({ ...current, [position.symbol]: event.target.value }))} onBlur={() => setQuantities((current) => ({ ...current, [position.symbol]: Math.max(1, parseInt(current[position.symbol], 10) || 1) }))} className="w-14 rounded-lg border border-slate-300 px-1 py-2" /></td><td className="px-2 py-3"><div className="flex flex-wrap gap-1"><button type="button" disabled={processingSymbol === position.symbol} onClick={() => handleTrade(position, 'BUY')} className="rounded-lg bg-emerald-50 px-2 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50">Add</button><button type="button" disabled={processingSymbol === position.symbol} onClick={() => handleTrade(position, 'SELL')} className="rounded-lg bg-red-50 px-2 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50">Sell</button></div></td></tr>)}</tbody></table>}
      </div>
      <div className="mt-6 space-y-3 sm:hidden">
        {portfolio.length === 0 && !error && <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">No open positions.</p>}
        {portfolio.map((position) => <button type="button" key={position.symbol} data-portfolio-card className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition active:bg-slate-50" onClick={() => setSelectedPosition(position)}><div className="flex items-start justify-between"><div><h4 className="font-bold text-slate-800">{position.symbol} {position.side === 'SHORT' && <span className="text-xs font-semibold text-red-600">SHORT</span>}</h4><p className="mt-1 text-xs text-slate-500">Avg. price ₹{position.avgPrice.toLocaleString()}</p></div><div className="text-right"><p className="text-xs text-slate-500">Quantity</p><p className="font-bold text-slate-800">{position.quantity}</p></div></div><div className="mt-4 grid grid-cols-2 gap-3 border-y border-slate-100 py-3"><div><p className="text-xs text-slate-500">Total value</p><p className="font-semibold text-slate-800">₹{(position.currentPrice * position.quantity).toLocaleString()}</p></div><div><p className="text-xs text-slate-500">Gain / loss</p><p className={`font-semibold ${position.pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{position.pnl >= 0 ? '+' : '-'}₹{Math.abs(position.pnl).toLocaleString()}</p></div></div><p className="mt-3 text-center text-xs font-semibold text-indigo-600">Tap to Add or Sell</p></button>)}
      </div>
      {selectedPosition && <><button type="button" aria-label="Close portfolio actions" onClick={() => setSelectedPosition(null)} className="fixed inset-0 z-40 bg-slate-900/30 sm:hidden" /><section data-portfolio-sheet className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:hidden"><div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300" /><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Order panel</p><h4 className="mt-1 text-xl font-bold text-slate-800">{selectedPosition.symbol}</h4><p className="text-sm font-semibold text-indigo-600">₹{selectedPosition.currentPrice.toLocaleString()}</p></div><button type="button" onClick={() => setSelectedPosition(null)} className="text-sm font-semibold text-slate-500">Close</button></div><label className="mt-5 block text-sm font-medium text-slate-700" htmlFor="portfolio-trade-quantity">Quantity</label><input id="portfolio-trade-quantity" type="number" min="1" step="1" value={quantities[selectedPosition.symbol] ?? 1} onChange={(event) => setQuantities((current) => ({ ...current, [selectedPosition.symbol]: event.target.value }))} onBlur={() => setQuantities((current) => ({ ...current, [selectedPosition.symbol]: Math.max(1, parseInt(current[selectedPosition.symbol], 10) || 1) }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /><div className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm"><div className="flex justify-between"><span className="text-slate-500">Estimated amount</span><strong>₹{selectedOrderAmount.toLocaleString()}</strong></div><div className="flex justify-between"><span className="text-slate-500">Available balance</span><strong>₹{availableBalance.toLocaleString()}</strong></div><div className="flex justify-between border-t border-slate-200 pt-2"><span className="text-slate-500">After Add</span><strong className={selectedHasBalance ? 'text-slate-800' : 'text-red-600'}>₹{(availableBalance - selectedOrderAmount).toLocaleString()}</strong></div><p className={`font-semibold ${selectedHasBalance ? 'text-emerald-600' : 'text-red-600'}`}>{selectedHasBalance ? 'Sufficient balance' : 'Insufficient balance'}</p></div><div className="mt-4 grid grid-cols-2 gap-3"><button type="button" disabled={processingSymbol === selectedPosition.symbol || !selectedHasBalance} onClick={() => handleTrade(selectedPosition, 'BUY')} className="rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white disabled:opacity-50">Add</button><button type="button" disabled={processingSymbol === selectedPosition.symbol || selectedOrderAmount <= 0} onClick={() => handleTrade(selectedPosition, 'SELL')} className="rounded-lg bg-red-600 px-4 py-3 font-semibold text-white disabled:opacity-50">Sell</button></div></section></>}
      {selectedPosition && <><button type="button" aria-label="Close portfolio actions" onClick={() => setSelectedPosition(null)} className="fixed inset-0 z-40 bg-slate-900/30 sm:hidden" /><section data-portfolio-sheet className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:hidden"><div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300" /><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Manage holding</p><h4 className="mt-1 text-xl font-bold text-slate-800">{selectedPosition.symbol}</h4></div><button type="button" onClick={() => setSelectedPosition(null)} className="text-sm font-semibold text-slate-500">Close</button></div><label className="mt-5 block text-sm font-medium text-slate-700" htmlFor="portfolio-trade-quantity">Quantity</label><input id="portfolio-trade-quantity" type="number" min="1" step="1" value={quantities[selectedPosition.symbol] ?? 1} onChange={(event) => setQuantities((current) => ({ ...current, [selectedPosition.symbol]: event.target.value }))} onBlur={() => setQuantities((current) => ({ ...current, [selectedPosition.symbol]: Math.max(1, parseInt(current[selectedPosition.symbol], 10) || 1) }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /><div className="mt-4 grid grid-cols-2 gap-3"><button type="button" disabled={processingSymbol === selectedPosition.symbol} onClick={() => handleTrade(selectedPosition, 'BUY')} className="rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white disabled:opacity-50">Add</button><button type="button" disabled={processingSymbol === selectedPosition.symbol} onClick={() => handleTrade(selectedPosition, 'SELL')} className="rounded-lg bg-red-600 px-4 py-3 font-semibold text-white disabled:opacity-50">Sell</button></div></section></>}
      {toast && <div role="status" className={`fixed left-1/2 top-4 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl px-4 py-3 text-center text-sm font-semibold text-white shadow-xl ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>{toast.text}</div>}
    </div>
  );
};

export default Portfolio;
