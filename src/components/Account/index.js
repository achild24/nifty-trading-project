import React from 'react';
import { LogOut, User } from 'lucide-react';

export const Account = ({ user, totalHoldingQuantity, portfolioValue, totalPnL, onLogout }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 text-slate-600"><User size={24} /></div>
      <div><h2 className="text-2xl font-bold text-slate-800">My Account</h2><p className="text-sm text-slate-500">{user?.email}</p></div>
    </div>
    <div className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200 px-4">
      <div className="flex items-center justify-between py-4"><span className="text-sm text-slate-500">Account balance</span><strong className="text-lg text-emerald-700">₹{Number(user?.balance || 0).toLocaleString()}</strong></div>
      <div className="flex items-center justify-between py-4"><span className="text-sm text-slate-500">Total holding quantity</span><strong className="text-lg text-slate-800">{Number(totalHoldingQuantity || 0).toLocaleString()} shares</strong></div>
      <div className="flex items-center justify-between py-4"><span className="text-sm text-slate-500">Current holding value</span><strong className="text-lg text-slate-800">₹{Number(portfolioValue || 0).toLocaleString()}</strong></div>
      <div className="flex items-center justify-between py-4"><span className="text-sm text-slate-500">P&amp;L</span><strong className={`text-lg ${totalPnL >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>₹{Number(totalPnL || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
    </div>
    <button type="button" onClick={onLogout} className="mt-6 flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 font-semibold text-red-600 hover:bg-red-50"><LogOut size={18} /> Logout</button>
  </section>
);

export default Account;