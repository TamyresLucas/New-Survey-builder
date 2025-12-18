import React, { useState, useEffect, useRef } from 'react';
import { XIcon } from './icons';

interface PasteChoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (choicesText: string) => void;
  initialChoicesText: string;
  primaryActionLabel: string;
}

export const PasteChoicesModal: React.FC<PasteChoicesModalProps> = ({ isOpen, onClose, onSave, initialChoicesText, primaryActionLabel }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setText(initialChoicesText);
      setError(null);
      // Timeout to allow the modal to render before focusing
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [isOpen, initialChoicesText]);

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

  const handleSave = () => {
    const lines = text.trim().split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) {
        setError('At least 2 choices must be added.');
        return;
    }
    onSave(text.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={modalRef}
        className="bg-surface-container rounded-lg shadow-xl w-full max-w-lg m-4 flex flex-col border border-outline-variant"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-outline-variant flex items-center justify-between">
          <h2 className="text-lg font-bold text-on-surface">Copy and Paste Choices</h2>
          <button onClick={onClose} className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container-lowest">
            <XIcon className="text-xl" />
          </button>
        </div>
        <div className="p-6 flex-grow">
          <label htmlFor="paste-choices-area" className="block text-sm font-medium text-on-surface-variant mb-2">
            Paste your choices below, one per line.
          </label>
          <textarea
            id="paste-choices-area"
            ref={textareaRef}
            value={text}
            onChange={(e) => {
                setText(e.target.value);
                if (error) setError(null);
            }}
            rows={10}
            className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
            placeholder="Choice 1
Choice 2
Choice 3..."
          />
          {error && (
            <p className="text-sm text-error mt-2" role="alert">
              {error}
            </p>
          )}
        </div>
        <div className="p-4 border-t border-outline-variant flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-button-primary text-primary rounded-full hover:bg-primary-container"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 text-sm font-button-primary text-on-primary bg-primary rounded-full hover:opacity-90"
          >
            {primaryActionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};