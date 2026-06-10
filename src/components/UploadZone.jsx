import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { uploadZoneText } from '../static-text/upload_zone_text';

export default function UploadZone({ setActiveFile, setRowCount, setColumns, setFileUrl }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const uploadFile = async (file) => {
    // Verify file extension
    const extension = file.name.split('.').pop().toLowerCase();
    if (extension !== 'xlsx' && extension !== 'xls') {
      setError(uploadZoneText.errorInvalidFormat);
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${backendUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setActiveFile(file.name);
        setRowCount(result.rows);
        setColumns(result.columns);
        if (setFileUrl) {
          setFileUrl(result.fileUrl);
        }
      } else {
        setError(result.error || uploadZoneText.errorDefaultParse);
      }
    } catch (err) {
      console.error('Upload Error:', err);
      setError(uploadZoneText.errorConnection);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${isDragOver
            ? 'border-brand-yellow bg-brand-yellow/10 scale-[1.01] dark:border-brand-yellow dark:bg-brand-yellow/10'
            : 'border-slate-200 hover:border-brand-yellow hover:bg-brand-yellow/5 dark:border-slate-800 dark:hover:border-brand-yellow dark:hover:bg-slate-900/40'
          } ${isLoading ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx,.xls"
          className="hidden"
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-yellow opacity-20"></span>
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-yellow border-t-transparent"></div>
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                {uploadZoneText.loadingTitle}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {uploadZoneText.loadingSubtitle}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Animated Upload Icon Container */}
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-yellow/10 text-brand-gold transition-transform duration-300 dark:bg-brand-yellow/15 dark:text-brand-yellow group-hover:scale-110">
              <UploadCloud className="h-8 w-8 animate-pulse" />
            </div>

            <h3 className="mb-2 text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              {uploadZoneText.uploadTitle}
            </h3>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              {uploadZoneText.uploadDescription}
            </p>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 rounded-full px-4 py-2 bg-white/50 dark:bg-slate-900/50">
              <FileSpreadsheet className="h-4 w-4 text-slate-400" />
              <span>{uploadZoneText.onlyExcelSupported}</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <div>
            <span className="font-semibold text-red-800 dark:text-red-300">{uploadZoneText.uploadFailedPrefix}</span>
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
