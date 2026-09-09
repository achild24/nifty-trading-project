import React, { useEffect, useState } from 'react';
import { tradeAPI } from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';

export const Trade = () => {
  const { updateUser } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const stock = stocks.find((item) => item.symbol === selectedSymbol);

  const loadStocks = async () => {
    setError('');
    try {
      const response = await tradeAPI.getStocks();
      setStocks(response.stocks || []);
      setSelectedSymbol((current) => current || '');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStocks();
  }, []);

  const handleTrade = async (type) => {
    setError('');
    setMessage('');
    try {
      const response = type === 'BUY'
        ? await tradeAPI.buyStock(selectedSymbol, quantity)
        : await tradeAPI.sellStock(selectedSymbol, quantity);
      updateUser(response.user);
      setMessage(response.message);
      setToast({ type: 'success', text: `${type === 'BUY' ? 'Bought' : 'Sold'} ${quantity} ${selectedSymbol} share${quantity === 1 ? '' : 's'} successfully` });
      window.setTimeout(() => setToast(null), 3500);
    } catch (requestError) {
      setError(requestError.message);
      setToast({ type: 'error', text: requestError.message });
      window.setTimeout(() => setToast(null), 4500);
    }
  };

  if (isLoading) return <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">Loading stocks...</div>;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
      <h3 className="text-2xl font-bold text-slate-800 mb-4">Trade</h3>

      {!stock && error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="relative mt-6 min-h-[360px] overflow-hidden">
      <div className={`overflow-x-auto transition-all duration-300 ${stock ? 'lg:pr-[320px]' : ''}`}>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-semibold text-slate-800">Market data</h4>
          <button type="button" onClick={loadStocks} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Refresh prices</button>
        </div>
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr><th className="px-3 py-2">Symbol</th><th className="px-3 py-2">Company</th><th className="px-3 py-2">Price</th><th className="px-3 py-2">Change</th></tr>
          </thead>
          <tbody>
            {stocks.map((item) => {
              const change = item.price - item.previousPrice;
              return <tr key={item.symbol} onClick={() => { setSelectedSymbol((current) => current === item.symbol ? '' : item.symbol); setMessage(''); setError(''); }} className={`cursor-pointer border-b border-slate-100 transition hover:bg-indigo-50 ${selectedSymbol === item.symbol ? 'bg-indigo-100' : ''}`}><td className="px-3 py-2 font-semibold text-slate-800">{item.symbol}</td><td className="px-3 py-2 text-slate-600">{item.name}</td><td className="px-3 py-2 font-medium">₹{item.price.toLocaleString()}</td><td className={`px-3 py-2 font-medium ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{change >= 0 ? '+' : ''}{change.toFixed(2)}</td></tr>;
            })}
          </tbody>
        </table>
      </div>

      <aside className={`absolute right-0 top-0 z-10 h-full w-full max-w-[300px] rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-lg transition-transform duration-300 ease-out ${stock ? 'translate-x-0' : 'translate-x-[calc(100%+1rem)]'}`} aria-hidden={!stock}>
        <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Order panel</p><button type="button" onClick={() => setSelectedSymbol('')} className="text-sm font-semibold text-slate-500 hover:text-slate-800">Close</button></div>
        {stock ? <><p className="mt-2 text-sm text-slate-500">Selected stock</p><h4 className="mt-1 text-2xl font-bold text-slate-800">{stock.symbol}</h4><p className="mt-1 text-lg font-semibold text-indigo-600">₹{stock.price.toLocaleString()}</p><label className="mt-5 block text-sm font-medium text-slate-700" htmlFor="trade-quantity">Quantity</label><input id="trade-quantity" type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value || 1)))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2" /><div className="mt-3 flex items-center justify-between text-sm text-slate-500"><span>Estimated total</span><strong className="text-slate-800">₹{(stock.price * quantity).toLocaleString()}</strong></div><div className="mt-5 grid gap-2"><button type="button" onClick={() => handleTrade('BUY')} className="rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-700">Buy</button><button type="button" onClick={() => handleTrade('SELL')} className="rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700">Sell</button></div></> : <p className="mt-3 text-sm leading-6 text-slate-500">Click a stock in the market table to open its buy and sell options.</p>}
      </aside>
      </div>


      {!stock && !error && <p className="mt-4 text-sm text-slate-500">Select a stock from the market table to trade.</p>}
      {(message || error) && <p className={`mt-4 text-sm ${error ? 'text-red-600' : 'text-emerald-600'}`}>{error || message}</p>}

      {toast && <div role="status" className={`fixed bottom-5 right-5 z-50 max-w-sm rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xl ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>{toast.text}</div>}
    </div>
  );
};

export default Trade;
