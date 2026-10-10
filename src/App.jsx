import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Chat from './components/Chat';
import { getSheetFromIndexedDB, saveSheetToIndexedDB, clearSheetFromIndexedDB } from './utils/indexedDB';

const App = () => {
  const [activeFile, setActiveFile] = useState(null);
  const [rowCount, setRowCount] = useState(0);
  const [columns, setColumns] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // Restore stored Excel & JSON from IndexedDB when App loads/refreshes
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = await getSheetFromIndexedDB();
        if (stored) {
          let rows = stored.jsonData;
          let cols = stored.columns;

          // If jsonData was not cached or undefined, parse directly from stored fileBlob!
          if ((!rows || rows.length === 0) && stored.fileBlob) {
            try {
              const XLSX = await import('xlsx');
              const buffer = await stored.fileBlob.arrayBuffer();
              const workbook = XLSX.read(buffer, { type: 'array' });
              const sheetName = workbook.SheetNames[0];
              rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
              if (rows && rows.length > 0) {
                cols = Object.keys(rows[0]);
                // Re-save so jsonData is populated in IndexedDB
                await saveSheetToIndexedDB({
                  fileBlob: stored.fileBlob,
                  jsonData: rows,
                  fileName: stored.fileName,
                  rowCount: rows.length,
                  columns: cols
                });
              }
            } catch (parseErr) {
              console.error('Failed to parse fileBlob in frontend:', parseErr);
            }
          }

          if (rows && rows.length > 0) {
            setActiveFile(stored.fileName);
            setRowCount(rows.length);
            setColumns(cols || Object.keys(rows[0]));

            // Silently rehydrate backend RAM in case the server restarted
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
            await fetch(`${backendUrl}/api/upload/rehydrate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ jsonData: rows }),
            });
          }
        }
      } catch (err) {
        console.warn('Could not restore session from IndexedDB:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    restoreSession();
  }, []);

  const handleClearAll = async () => {
    // 1. Wipe browser IndexedDB
    try {
      await clearSheetFromIndexedDB();
    } catch (err) {
      console.error('Error clearing IndexedDB:', err);
    }

    // 2. Clear backend memory
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    try {
      await fetch(`${backendUrl}/api/upload`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to clear backend data:', err);
    }

    // 3. Reset React state
    setActiveFile(null);
    setRowCount(0);
    setColumns([]);
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="relative flex h-12 w-12 items-center justify-center mb-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-yellow opacity-20"></span>
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-yellow border-t-transparent"></div>
        </div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Loading stored workspace...</p>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar
        activeFile={activeFile}
        rowCount={rowCount}
        onClearData={handleClearAll}
      />
      {/* flex-1 + min-h-0 are critical: lets child fill remaining height without overflow */}
      <main className="flex-1 min-h-0 flex flex-col">
        <Chat
          activeFile={activeFile}
          setActiveFile={setActiveFile}
          rowCount={rowCount}
          setRowCount={setRowCount}
          columns={columns}
          setColumns={setColumns}
          onClearData={handleClearAll}
        />
      </main>
    </div>
  );
};

export default App;
