import React, { useState } from 'react';
import { Activity, LogOut, Moon, Sun, User, X } from 'lucide-react';

export const Header = ({ user, portfolioValue, totalPnL, totalHoldingQuantity, isDarkMode, onToggleTheme, onLogout, onNavigate }) => {
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
              <button type="button" onClick={onToggleTheme} aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                {isDarkMode ? <Sun size={19} /> : <Moon size={19} />}
              </button>
              <div className="rounded-lg border border-slate-200 px-3 py-2 text-right sm:px-4 dark:border-slate-700">
                <p className="text-xs text-slate-700 dark:text-white">Balance</p>
                <p className="font-bold text-black dark:text-white">₹{Number(user?.balance || 0).toLocaleString()}</p>
              </div>
              <div className="relative hidden sm:block">
              <button type="button" onClick={() => setShowAccountMenu((visible) => !visible)} aria-label="Open My Account menu" className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                {showAccountMenu ? <X size={20} /> : <User size={20} />}<span className="hidden sm:inline">My Account</span>
              </button>
              {showAccountMenu && (
                <div className="absolute right-0 z-20 mt-3 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                  <p className="border-b border-slate-100 px-3 pb-3 text-sm font-semibold text-slate-800">{user?.username || 'My account'}</p>
                  <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 px-3 py-1">
                    <div className="flex items-center justify-between py-3"><span className="text-sm text-slate-500">Balance</span><strong className="text-emerald-700">₹{Number(user?.balance || 0).toLocaleString()}</strong></div>
                    <div className="flex items-center justify-between py-3"><span className="text-sm text-slate-500">Total holding quantity</span><strong className="text-slate-800">{Number(totalHoldingQuantity || 0).toLocaleString()} shares</strong></div>
                    <div className="flex items-center justify-between py-3"><span className="text-sm text-slate-500">Current holding value</span><strong className="text-slate-800">₹{Number(portfolioValue || 0).toLocaleString()}</strong></div>
                    <div className="flex items-center justify-between py-3"><span className="text-sm text-slate-500">P&amp;L</span><strong className={totalPnL >= 0 ? 'text-emerald-700' : 'text-red-700'}>₹{Number(totalPnL || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
                  </div>
                  <button type="button" onClick={() => { setShowAccountMenu(false); onLogout(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"><LogOut size={17} /> Logout</button>
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
