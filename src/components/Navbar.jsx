
import React, { useState } from 'react';
import { FileSpreadsheet, Download, Trash2, FileJson, ChevronDown } from 'lucide-react';
import { navbarText } from '../static-text/navbar_text';
import eyLogo from '../assets/EY_logo.png';
import { getSheetFromIndexedDB } from '../utils/indexedDB';

export default function Navbar({ activeFile, rowCount, onClearData }) {
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState(false);

  const handleDownloadExcel = async () => {
    try {
      const stored = await getSheetFromIndexedDB();
      if (!stored || !stored.fileBlob) {
        alert('No Excel file found in browser memory.');
        return;
      }
      const url = URL.createObjectURL(stored.fileBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = stored.fileName || 'dataset.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download Excel failed:', err);
      alert('Could not download Excel file.');
    } finally {
      setDownloadDropdownOpen(false);
    }
  };

  const handleDownloadJson = async () => {
    try {
      const stored = await getSheetFromIndexedDB();
      if (!stored || !stored.jsonData) {
        alert('No JSON data found in browser memory.');
        return;
      }
      const jsonString = JSON.stringify(stored.jsonData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const baseName = (stored.fileName || 'dataset').replace(/\.[^/.]+$/, "");
      a.download = `${baseName}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download JSON failed:', err);
      alert('Could not download JSON data.');
    } finally {
      setDownloadDropdownOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Left Side: Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center">
            <img src={eyLogo} alt="EY Logo" className="h-8 w-8" />
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

        {/* Right Side: Data Connectivity status & Actions */}
        <div className="flex items-center gap-3">
          {activeFile ? (
            <div className="flex items-center gap-2">
              {/* Active File Pill */}
              <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/50 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm transition dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="max-w-[100px] truncate sm:max-w-[150px]">{activeFile}</span>
                <span className="border-l border-emerald-200 pl-2 dark:border-emerald-800">{rowCount} {navbarText.rowsCountSuffix}</span>
              </div>

              {/* Download Menu */}
              <div className="relative">
                <button
                  onClick={() => setDownloadDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  title="Download File or JSON"
                >
                  <Download className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                  <span className="hidden sm:inline">Download</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                {downloadDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl transition dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={handleDownloadExcel}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                      <span>Download Excel</span>
                    </button>
                    <button
                      onClick={handleDownloadJson}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition"
                    >
                      <FileJson className="h-4 w-4 text-amber-500" />
                      <span>Download JSON</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Delete / Clear button */}
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this Excel file and JSON data from your browser memory?")) {
                    onClearData();
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/50 px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-red-100 hover:border-red-300 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-900/40"
                title="Delete from browser memory"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </button>
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
