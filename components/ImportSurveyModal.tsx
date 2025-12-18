import React, { useState, useRef, useEffect, useCallback } from 'react';
import { XIcon, FileUploadIcon } from './icons';

interface ImportSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (csvContent: string, fileName: string) => void;
}

export const ImportSurveyModal: React.FC<ImportSurveyModalProps> = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setError(null);
      setIsDragging(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleFileSelect = (selectedFile: File | null) => {
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload a valid .csv file.');
        setFile(null);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files ? e.target.files[0] : null);
  };

  const handleDragEvents = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, [handleDragEvents]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
  }, [handleDragEvents]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files ? e.dataTransfer.files[0] : null);
  }, [handleDragEvents]);

  const handleImportClick = () => {
    if (!file) {
      setError('Please select a file to import.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      onImport(text, file.name);
      onClose();
    };
    reader.onerror = () => {
      setError('Error reading file.');
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-surface-container rounded-lg shadow-xl w-full max-w-lg m-4 flex flex-col border border-outline-variant"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-outline-variant flex items-center justify-between">
          <h2 className="text-lg font-bold text-on-surface">Import Survey</h2>
          <button onClick={onClose} className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container-lowest">
            <XIcon className="text-xl" />
          </button>
        </div>
        <div className="p-6 flex-grow">
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragEvents}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging
              ? 'border-primary bg-primary-container'
              : 'border-outline-variant hover:border-primary hover:bg-surface-container-lowest'
              }`}
          >
            <FileUploadIcon className="text-4xl text-on-surface-variant mb-3" />
            <p className="text-on-surface font-semibold">
              {file ? file.name : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">CSV file up to 10MB</p>
          </div>
          {error && <p className="text-sm text-error mt-2" role="alert">{error}</p>}
          <div className="mt-4 p-3 bg-surface-container-high rounded-md text-xs text-on-surface-variant">
            <p><strong>Note:</strong> Importing will replace the entire current survey. This action cannot be undone.</p>
          </div>
        </div>
        <div className="p-4 border-t border-outline-variant flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-button-primary text-on-surface rounded-full hover:bg-surface-container-lowest"
          >
            Cancel
          </button>
          <button
            onClick={handleImportClick}
            disabled={!file}
            className="px-6 py-2 text-sm font-button-primary text-on-primary bg-primary rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
};
