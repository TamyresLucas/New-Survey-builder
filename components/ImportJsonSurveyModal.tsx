import React, { useState } from 'react';
import { XIcon } from './icons';
import { Button } from '@voxco/design-system';
import { FormFieldAdapter } from '../src/adapters/FormFieldAdapter';
import { TextareaFieldAdapter } from '../src/adapters/TextareaFieldAdapter';

interface ImportJsonSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (surveyData: any, surveyName: string) => void;
}

export const ImportJsonSurveyModal: React.FC<ImportJsonSurveyModalProps> = ({ isOpen, onClose, onImport }) => {
  const [surveyName, setSurveyName] = useState('');
  const [jsonData, setJsonData] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImport = () => {
    let hasError = false;

    if (!surveyName.trim()) {
      setError('Survey name is required');
      hasError = true;
    } else {
      setError(null);
    }

    if (!jsonData.trim()) {
      setJsonError('JSON data is required');
      hasError = true;
    } else {
      try {
        JSON.parse(jsonData);
        setJsonError(null);
      } catch (err) {
        setJsonError('Invalid JSON format');
        hasError = true;
      }
    }

    if (!hasError) {
      try {
        const parsedData = JSON.parse(jsonData);
        if (parsedData && typeof parsedData === 'object') {
          onImport(parsedData, surveyName);
          onClose();
        } else {
          setJsonError('Invalid survey data format');
        }
      } catch (err) {
        setJsonError('Invalid JSON format');
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="bg-surface-container rounded-lg shadow-xl w-full max-w-lg m-4 flex flex-col border border-outline-variant"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-outline-variant flex items-center justify-between">
          <h2 className="text-lg font-bold text-on-surface">Import Survey from JSON</h2>
          <button onClick={onClose} className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container-lowest">
            <XIcon className="text-xl" />
          </button>
        </div>
        <div className="p-6 flex-grow">
          <div className="space-y-4">
            <FormFieldAdapter
              label="Survey Name"
              id="survey-name"
              value={surveyName}
              onChange={(e) => setSurveyName(e.target.value)}
              placeholder="Enter survey name"
              error={error}
            />
            <TextareaFieldAdapter
              label="JSON Data"
              id="json-data"
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              rows={8}
              placeholder="Paste your survey JSON data here..."
              error={jsonError}
              className="font-mono text-xs"
            />
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
            onClick={handleImport}
            className="px-6 py-2 text-sm font-button-primary text-on-primary bg-primary rounded-full hover:opacity-90"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
};