import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Chat from './components/Chat';

const App = () => {
  const [activeFile, setActiveFile] = useState(null);
  const [rowCount, setRowCount] = useState(0);
  const [columns, setColumns] = useState([]);

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
