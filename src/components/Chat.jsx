import React, { useState, useRef, useEffect } from 'react';
import UploadZone from './UploadZone';
import { chatText } from '../static-text/chat_text';
import {
  Send,
  Trash2,
  Search,
  Sparkles,
  Terminal,
  Table,
  BarChart2,
  Calendar,
  Clock,
  User,
  IndianRupee,
  Hash,
  Database,
  FileSpreadsheet,
  Bot,
  Percent,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Copy,
  Check,
  Download
} from 'lucide-react';

// Help helper to map column names to visual icons representing their data type
const getColumnIcon = (columnName) => {
  const name = columnName.toLowerCase();
  if (name.includes('date')) return <Calendar className="h-3.5 w-3.5 text-blue-500" />;
  if (name.includes('time')) return <Clock className="h-3.5 w-3.5 text-sky-500" />;
  if (name.includes('manager') || name.includes('by') || name.includes('cashier')) {
    return <User className="h-3.5 w-3.5 text-brand-gold" />;
  }
  if (name.includes('sales') || name.includes('price') || name.includes('amount') || name.includes('revenue')) {
    return <IndianRupee className="h-3.5 w-3.5 text-emerald-500" />;
  }
  if (name.includes('%') || name.includes('discount')) {
    return <Percent className="h-3.5 w-3.5 text-amber-500" />;
  }
  if (name.includes('id') || name.includes('no') || name.includes('number') || name.includes('quantity')) {
    return <Hash className="h-3.5 w-3.5 text-brand-gold" />;
  }
  return <Database className="h-3.5 w-3.5 text-slate-400" />;
};


export default function Chat({
  activeFile,
  setActiveFile,
  rowCount,
  setRowCount,
  columns,
  setColumns,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [schemaSearch, setSchemaSearch] = useState('');
  const messagesEndRef = useRef(null);

  // Initialize welcome message when file is loaded
  useEffect(() => {
    if (activeFile) {
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: chatText.getWelcomeMessage(activeFile, rowCount),
          isWelcome: true
        }
      ]);
    } else {
      setMessages([]);
    }
  }, [activeFile, rowCount]);

  // Scroll chat viewport to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
    };

    const botMsgId = (Date.now() + 1).toString();
    const botMsg = {
      id: botMsgId,
      sender: 'bot',
      text: '',
      loading: true,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: textToSend }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error status: ${response.status}`);
      }

      const data = await response.json();

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMsgId
            ? {
              ...msg,
              text: data.summary || `Here is the data for your query:`,
              plan: data.plan,
              result: data.result,
              loading: false,
            }
            : msg
        )
      );
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMsgId
            ? {
              ...msg,
              text: chatText.serverConnectionError,
              error: err.message,
              loading: false,
            }
            : msg
        )
      );
    }
  };

  const handleClearData = async () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    try {
      await fetch(`${backendUrl}/api/upload`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to clear backend data:', err);
    }
    setActiveFile(null);
    setRowCount(0);
    setColumns([]);
    setMessages([]);
  };

  const filteredColumns = columns.filter((col) =>
    col.toLowerCase().includes(schemaSearch.toLowerCase())
  );

  if (!activeFile) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="text-center mb-8 max-w-lg space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-yellow/10 text-brand-gold dark:bg-brand-yellow/15 dark:text-brand-yellow mb-2 shadow-sm">
            <Database className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            {chatText.welcomeTitle}
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400">
            {chatText.welcomeSubtitle}
          </p>
        </div>
        <UploadZone
          setActiveFile={setActiveFile}
          setRowCount={setRowCount}
          setColumns={setColumns}
        />
      </div>
    );
  }

  return (
    // flex-1 min-h-0: fills all remaining vertical space after the navbar, never overflows
    <div className="flex-1 min-h-0 flex overflow-hidden">

      {/* ── LEFT SIDEBAR ─────────────────────────────────────────── */}
      {/* h-full + flex flex-col: sidebar stretches full height, children laid out vertically */}
      <aside className="w-72 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 flex flex-col h-full overflow-hidden">

        {/* Database header — always visible, never scrolls */}
        <div className="shrink-0 p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate max-w-[130px]">
                {activeFile}
              </span>
            </div>
            <button
              onClick={handleClearData}
              title={chatText.removeDatabaseTooltip}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition dark:hover:bg-red-950/30"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
            {rowCount.toLocaleString()} {chatText.transactionsLoadedSuffix}
          </p>
        </div>

        {/* Columns section — fixed header + internally scrollable list */}
        <div className="shrink-0 border-b border-slate-200 dark:border-slate-800 flex flex-col" style={{ maxHeight: '45%' }}>
          <div className="shrink-0 px-4 pt-4 pb-2 space-y-2">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {chatText.availableColumnsTitle} ({columns.length})
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={chatText.filterColumnsPlaceholder}
                value={schemaSearch}
                onChange={(e) => setSchemaSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-900 bg-slate-50 placeholder-slate-400 focus:outline-none focus:border-brand-yellow transition dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
              />
            </div>
          </div>
          {/* This inner div scrolls independently */}
          <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-1 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            {filteredColumns.map((col, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
              >
                {getColumnIcon(col)}
                <span className="truncate">{col}</span>
              </div>
            ))}
            {filteredColumns.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-3">{chatText.noMatchingColumns}</p>
            )}
          </div>
        </div>

        {/* Quick Suggestions — fixed header + independently scrollable list */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="shrink-0 px-4 pt-4 pb-2">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-brand-gold dark:text-brand-yellow" />
              {chatText.quickSuggestionsTitle}
            </h3>
          </div>
          {/* flex-1 + overflow-y-auto: fills remaining sidebar height and scrolls on its own */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            {chatText.suggestedPrompts.map((promptText, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(promptText)}
                className="w-full text-left text-xs p-3 rounded-xl border border-slate-100 hover:border-brand-yellow/30 hover:bg-brand-yellow/5 transition text-slate-600 hover:text-brand-gold dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-brand-yellow"
              >
                <div className="flex gap-2 items-start">
                  <ArrowRight className="h-3 w-3 shrink-0 mt-0.5 text-slate-400" />
                  <span>{promptText}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* ── RIGHT PANEL: CHAT CONSOLE ─────────────────────────── */}
      {/* flex flex-col + min-h-0: allows children to scroll within this column */}
      <section className="flex-1 min-h-0 flex flex-col bg-slate-50/30 dark:bg-slate-950/20">

        {/* Messages viewport — this is the ONLY thing that scrolls */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
          <div className="max-w-5xl mx-auto w-full space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
              >
                {/* Avatar */}
                <div
                  className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-sm ${msg.sender === 'user'
                    ? 'bg-brand-yellow text-slate-950 font-bold'
                    : msg.isWelcome
                      ? 'bg-gradient-to-tr from-brand-yellow to-brand-gold text-slate-950 font-bold'
                      : 'bg-white border border-slate-200 text-brand-gold dark:bg-slate-900 dark:border-slate-800 dark:text-brand-yellow'
                    }`}
                >
                  {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                {/* Bubble + data card */}
                <div className="space-y-2 max-w-[75%]">
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${msg.sender === 'user'
                      ? 'bg-brand-yellow text-slate-950 rounded-tr-none font-medium'
                      : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200'
                      }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    {msg.loading && (
                      <div className="flex items-center gap-2 mt-2 text-slate-400">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-yellow border-t-transparent" />
                        <span className="text-xs font-semibold animate-pulse">{chatText.runningSqlPlan}</span>
                      </div>
                    )}
                  </div>
                  {msg.sender === 'bot' && msg.result && (
                    <DataResponseCard plan={msg.plan} result={msg.result} />
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input bar — shrink-0 keeps it pinned at the bottom always */}
        <div className="shrink-0 border-t border-slate-200/80 bg-white px-4 py-3 dark:bg-slate-950 dark:border-slate-800">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
            className="flex items-center gap-3 max-w-4xl mx-auto"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={chatText.inputPlaceholder}
              className="flex-1 border border-slate-200 rounded-2xl py-3 px-4 text-sm text-slate-900 bg-slate-50 placeholder-slate-400 shadow-sm focus:outline-none focus:border-brand-yellow focus:ring-4 focus:ring-brand-yellow/5 transition dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-brand-yellow hover:bg-brand-gold disabled:opacity-40 text-slate-950 font-bold rounded-2xl p-3 shadow-md shadow-brand-yellow/10 transition shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-400 mt-2 font-medium tracking-wide">
            {chatText.footerBranding}
          </p>
        </div>
      </section>
    </div>
  );
}

// Subcomponent: Data Response Tabbed Renderer (Charts + Tables + SQL Code)
function DataResponseCard({ plan, result }) {
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' | 'table' | 'sql'
  const [copied, setCopied] = useState(false);

  const handleCopySql = () => {
    const sqlText = plan?.sql || 'SELECT * FROM ?';
    navigator.clipboard.writeText(sqlText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleExportToExcel = () => {
    if (!result || result.length === 0) return;

    // Get the headers dynamically
    const { labelHeader, valueHeader } = parseSqlHeaders(plan?.sql);
    const rawHeaders = Object.keys(result[0] || {});
    const displayHeaders = rawHeaders.map(h => {
      if (h === 'key') return labelHeader;
      if (h === 'value') return valueHeader;
      return h;
    });

    // Create CSV rows
    const csvContent = [
      // Header row
      displayHeaders.join(','),
      // Data rows
      ...result.map(row => 
        rawHeaders.map(headerKey => {
          let cellValue = row[headerKey] ?? '';
          // Escape quotes and commas
          let cellString = String(cellValue).replace(/"/g, '""');
          if (cellString.includes(',') || cellString.includes('\n') || cellString.includes('"')) {
            cellString = `"${cellString}"`;
          }
          return cellString;
        }).join(',')
      )
    ].join('\n');

    // Create a blob and download it as a .csv file (Excel compatible)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `query_result_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!result || result.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs font-semibold text-slate-500 text-center dark:border-slate-800 dark:bg-slate-900/30">
        {chatText.noRecordsReturned}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-in fade-in slide-in-from-top-2 duration-300 max-w-2xl">
      {/* Navigation tabs */}
      <div className="flex justify-between items-center border-b border-slate-150 bg-slate-50/60 pr-3 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex px-2">
          <button
            onClick={() => setActiveTab('chart')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 transition ${activeTab === 'chart'
              ? 'border-brand-yellow text-brand-gold dark:border-brand-yellow dark:text-brand-yellow'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            {chatText.tabVisualization}
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 transition ${activeTab === 'table'
              ? 'border-brand-yellow text-brand-gold dark:border-brand-yellow dark:text-brand-yellow'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
          >
            <Table className="h-3.5 w-3.5" />
            {chatText.tabDataTable}
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 transition ${activeTab === 'sql'
              ? 'border-brand-yellow text-brand-gold dark:border-brand-yellow dark:text-brand-yellow'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            {chatText.tabSqlTrace}
          </button>
        </div>
        <button
          onClick={handleExportToExcel}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-slate-500 hover:text-brand-gold hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-brand-yellow dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer shadow-sm focus:outline-none"
          title="Download query results as CSV (Excel compatible)"
        >
          <Download className="h-3 w-3 text-slate-400" />
          Export
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-4">
        {activeTab === 'chart' && <HorizontalBarChart result={result} sql={plan?.sql} />}
        {activeTab === 'table' && <SimpleDataTable result={result} sql={plan?.sql} />}
        {activeTab === 'sql' && (
          <div className="relative rounded-xl bg-slate-950 p-4 border border-slate-900 font-mono text-xs text-brand-yellow/80 select-all group">
            <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">
              {chatText.sqlExecutedQueryHeader}
            </div>
            <pre className="pr-10 pb-3 overflow-x-auto font-mono whitespace-pre">
              {plan?.sql || 'SELECT * FROM ?'}
            </pre>
            <button
              onClick={handleCopySql}
              className="absolute right-3 top-3 p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-brand-yellow hover:bg-slate-800 transition border border-slate-800 focus:outline-none cursor-pointer"
              title="Copy SQL Query"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper to parse column display headers from SQL alias mappings
const parseSqlHeaders = (sql) => {
  let labelHeader = 'Item';
  let valueHeader = 'Value';

  if (!sql) return { labelHeader, valueHeader };

  try {
    const keyMatch = sql.match(/SELECT\s+([\s\S]+?)\s+AS\s+\[?key\]?/i);
    const valueMatch = sql.match(/,\s*([\s\S]+?)\s+AS\s+\[?value\]?/i);

    const cleanHeader = (header) => {
      let clean = header.trim();
      const funcMatch = clean.match(/^(SUM|COUNT|AVG|MIN|MAX)\((.*?)\)$/i);
      if (funcMatch) {
        const funcName = funcMatch[1].toUpperCase();
        let inner = funcMatch[2].replace(/[\[\]]/g, '').trim();
        if (inner === '*') {
          return funcName === 'COUNT' ? 'Count' : 'Value';
        }
        if (funcName === 'SUM') return `Total ${inner}`;
        if (funcName === 'AVG') return `Average ${inner}`;
        if (funcName === 'COUNT') return `Count of ${inner}`;
        if (funcName === 'MAX') return `Max ${inner}`;
        if (funcName === 'MIN') return `Min ${inner}`;
        clean = inner;
      }
      return clean.replace(/[\[\]]/g, '').trim();
    };

    if (keyMatch && keyMatch[1]) {
      labelHeader = cleanHeader(keyMatch[1]);
    }
    if (valueMatch && valueMatch[1]) {
      valueHeader = cleanHeader(valueMatch[1]);
    }
  } catch (err) {
    console.error("Error parsing SQL headers:", err);
  }

  return { labelHeader, valueHeader };
};

// Subcomponent: Premium SVG Horizontal Bar Chart Renderer
function HorizontalBarChart({ result, sql }) {
  // Parse fields dynamically to handle any column names, aliasing them to label & val
  const firstRow = result[0];
  const keys = Object.keys(firstRow);

  const labelField = keys.find(k => k === 'key') || keys[0];
  const valueField = keys.find(k => k === 'value') || keys.find(k => typeof firstRow[k] === 'number') || keys[1];

  const data = result.map((row) => ({
    label: String(row[labelField] ?? 'N/A'),
    val: Number(row[valueField] ?? 0),
  }));

  const maxVal = Math.max(...data.map((d) => d.val), 1);

  // Extract friendly names from the SQL query if possible
  const { labelHeader, valueHeader } = parseSqlHeaders(sql);

  // Formatter helper to display numbers beautifully
  const formatVal = (v) => {
    if (v === undefined || isNaN(v)) return '0';
    if (v % 1 === 0) return v.toLocaleString(); // whole integers

    const valueName = (valueHeader || '').toLowerCase();
    if (valueName.includes('percent') || valueName.includes('%')) {
      return `${v.toFixed(2)}%`;
    }
    if (valueName.includes('sales') || valueName.includes('amount') || valueName.includes('price')) {
      return `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return v.toFixed(2);
  };

  return (
    <div className="max-h-64 overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 space-y-3 pt-0 px-2 pb-2">
      {/* Sticky Header Row */}
      <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 flex justify-between items-center pt-2 pb-2 border-b border-slate-150 dark:border-slate-800 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
        <span>{labelHeader}</span>
        <span>{valueHeader}</span>
      </div>

      {data.map((item, idx) => {
        const percentWidth = (item.val / maxVal) * 100;
        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="truncate max-w-[280px]">{item.label}</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{formatVal(item.val)}</span>
            </div>
            <div className="w-full h-3 rounded-full bg-brand-track overflow-hidden relative">
              <div
                style={{ width: `${percentWidth}%` }}
                className="h-full bg-gradient-to-r from-brand-yellow to-brand-gold rounded-full transition-all duration-1000 ease-out shadow-sm"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Subcomponent: Standard Tabular Data Grid Renderer
function SimpleDataTable({ result, sql }) {
  const headers = Object.keys(result[0] || {});
  const { labelHeader, valueHeader } = parseSqlHeaders(sql);

  const getHeaderDisplayName = (headerKey) => {
    if (headerKey === 'key') return labelHeader;
    if (headerKey === 'value') return valueHeader;
    return headerKey;
  };

  // Clean formatting helpers for table cells
  const formatCell = (headerKey, val) => {
    if (typeof val === 'number') {
      const displayName = getHeaderDisplayName(headerKey);
      const h = displayName.toLowerCase();
      if (h.includes('%') || h.includes('percent')) return `${val.toFixed(2)}%`;
      if (h.includes('amount') || h.includes('sales') || h.includes('price')) {
        return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      return val.toLocaleString();
    }
    return String(val ?? '');
  };

  return (
    <div className="w-full overflow-x-auto border border-slate-100 rounded-xl dark:border-slate-800/60 max-h-64 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="sticky top-0 bg-slate-50 border-b border-slate-150 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest dark:bg-slate-900 dark:border-slate-800">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="py-2.5 px-4">
                {getHeaderDisplayName(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {result.map((row, rIdx) => (
            <tr
              key={rIdx}
              className="hover:bg-slate-50/50 transition dark:hover:bg-slate-900/30 text-slate-700 dark:text-slate-300"
            >
              {headers.map((h, cIdx) => (
                <td key={cIdx} className="py-2.5 px-4 font-medium truncate max-w-[200px]">
                  {formatCell(h, row[h])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}