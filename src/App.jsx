import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Chat from './components/Chat';

const App = () => {
  const [activeFile, setActiveFile] = useState(null);
  const [rowCount, setRowCount] = useState(0);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    if (!activeFile) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ''; // Required to trigger the browser prompt
      return '';
    };

    const handleUnload = () => {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      // keepalive: true ensures the request reaches the server even after the tab unloads
      fetch(`${backendUrl}/api/upload`, {
        method: 'DELETE',
        keepalive: true
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [activeFile]);

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar activeFile={activeFile} rowCount={rowCount} />
      {/* flex-1 + min-h-0 are critical: lets child fill remaining height without overflow */}
      <main className="flex-1 min-h-0 flex flex-col">
        <Chat
          activeFile={activeFile}
          setActiveFile={setActiveFile}
          rowCount={rowCount}
          setRowCount={setRowCount}
          columns={columns}
          setColumns={setColumns}
        />
      </main>
    </div>
  );
};

export default App;
