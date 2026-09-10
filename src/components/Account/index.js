import React from 'react';
import { LogOut, User } from 'lucide-react';

export const Account = ({ user, onLogout }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-700"><User size={24} /></div>
      <div><h2 className="text-2xl font-bold text-slate-800">My Account</h2><p className="text-sm text-slate-500">{user?.email}</p></div>
    </div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl bg-emerald-50 p-4"><p className="text-sm text-slate-500">Account balance</p><p className="mt-1 text-2xl font-bold text-emerald-700">₹{Number(user?.balance || 0).toLocaleString()}</p></div>
      <div className="rounded-xl bg-blue-50 p-4"><p className="text-sm text-slate-500">Realized P&amp;L</p><p className="mt-1 text-2xl font-bold text-blue-700">₹{Number(user?.totalPnL || 0).toLocaleString()}</p></div>
    </div>
    <button type="button" onClick={onLogout} className="mt-6 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 font-semibold text-red-600 hover:bg-red-100"><LogOut size={18} /> Logout</button>
  </section>
);

export default Account;