import React, { useState } from 'react';
import { Activity, LogOut, Menu, User, X } from 'lucide-react';

export const Header = ({ user, portfolioValue, totalPnL, onLogout, onNavigate }) => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  return (
    <>
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="text-indigo-600" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-800 sm:block hidden">Nifty 50 Paper Trading</h1>
                <h1 className="text-lg font-bold text-gray-800 sm:hidden">Nifty Trading</h1>
                <p className="hidden text-sm text-gray-600 sm:block">Welcome, {user?.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden rounded-lg bg-emerald-50 px-4 py-2 text-right sm:block">
                <p className="text-xs text-slate-500">Balance</p>
                <p className="font-bold text-emerald-700">₹{Number(user?.balance || 0).toLocaleString()}</p>
              </div>
              <div className="relative">
              <button type="button" onClick={() => setShowAccountMenu((visible) => !visible)} aria-label="Open My Account menu" className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                <span className="sm:hidden">{showAccountMenu ? <X size={22} /> : <User size={22} />}</span><span className="hidden sm:inline">{showAccountMenu ? <X size={20} /> : <Menu size={20} />} My Account</span>
              </button>
              {showAccountMenu && (
                <div className="absolute right-0 z-20 mt-3 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                  <p className="border-b border-slate-100 px-3 pb-3 text-sm font-semibold text-slate-800">{user?.username || 'My account'}</p>
                  <div className="space-y-1 py-2">
                    <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-3"><span className="text-sm text-slate-600">Balance</span><strong className="text-slate-900">₹{Number(user?.balance || 0).toLocaleString()}</strong></div>
                    <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-3"><span className="text-sm text-slate-600">Portfolio value</span><strong className="text-slate-900">₹{Number(portfolioValue || 0).toLocaleString()}</strong></div>
                    <div className={`flex items-center justify-between rounded-lg px-3 py-3 ${totalPnL >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}><span className="text-sm text-slate-600">Total P&amp;L</span><strong className={totalPnL >= 0 ? 'text-emerald-700' : 'text-red-700'}>₹{Number(totalPnL || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t border-slate-100 py-2 sm:hidden">
                    <button type="button" onClick={() => onNavigate('trade')} className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Trade</button>
                    <button type="button" onClick={() => onNavigate('portfolio')} className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Portfolio</button>
                  </div>
                  <button type="button" onClick={onLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"><LogOut size={17} /> Logout</button>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
