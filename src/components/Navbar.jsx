import React from 'react';
import { Bot, BarChart3, HelpCircle, FileSpreadsheet, Settings } from 'lucide-react';
import { navbarText } from '../static-text/navbar_text';
import eyLogo from '../assets/EY_logo.png';

export default function Navbar({ activeFile, rowCount }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Left Side: Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center">
            <img src={eyLogo} alt="EY Logo" className="h-10 w-10" />
          </div>
          <div className="flex flex-col">
            <span className="bg-gradient-to-r from-slate-900 to-brand-gold bg-clip-text text-lg font-extrabold tracking-tight text-transparent dark:from-brand-yellow dark:to-brand-gold">
              {navbarText.logoTitle}
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              {navbarText.logoSubtitle}
            </span>
          </div>
        </div>


        {/* Right Side: Data Connectivity status & Settings */}
        <div className="flex items-center gap-4">
          {activeFile ? (
            <div className="flex items-center gap-2.5 rounded-full border border-emerald-200 bg-emerald-50/50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm transition dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="max-w-[120px] truncate sm:max-w-[180px]">{activeFile}</span>
              <span className="border-l border-emerald-200 pl-2 dark:border-emerald-800">{rowCount} {navbarText.rowsCountSuffix}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 rounded-full border border-amber-200 bg-amber-50/50 px-3.5 py-1.5 text-xs font-semibold text-amber-700 shadow-sm transition dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
              </span>
              <span>{navbarText.noSheetConnected}</span>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
