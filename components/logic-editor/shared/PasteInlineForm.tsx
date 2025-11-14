import React, { useState, useEffect, useRef } from 'react';
import { InfoIcon } from '../../icons';

export const PasteInlineForm: React.FC<{
  onSave: (text: string) => { success: boolean; error?: string };
  onCancel: () => void;
  placeholder: string;
  primaryActionLabel: string;
  disclosureText: string;
  helpTopic?: string;
  onRequestGeminiHelp?: (topic: string) => void;
}> = ({ onSave, onCancel, placeholder, primaryActionLabel, disclosureText, helpTopic, onRequestGeminiHelp }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (!text.trim()) {
      onCancel();
      return;
    }
    const result = onSave(text.trim());
    if (result.success) {
      onCancel(); 
    } else {
      setError(result.error || 'Invalid syntax.');
    }
  };

  return (
    <div className={`p-3 bg-surface-container-high rounded-md border ${error ? 'border-error' : 'border-outline-variant'}`}>
      <div className="text-xs text-on-surface-variant mb-2 flex items-center gap-1 flex-wrap">
        <InfoIcon className="text-sm flex-shrink-0" />
        <span>{disclosureText}</span>
        {helpTopic && onRequestGeminiHelp && (
            <button onClick={() => onRequestGeminiHelp(helpTopic)} className="text-primary hover:underline font-medium">learn more</button>
        )}
      </div>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (error) setError(null);
        }}
        rows={4}
        className={`w-full bg-surface border rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary font-mono ${error ? 'border-error' : 'border-outline'}`}
        placeholder={placeholder}
      />
      {error && (
        <p className="text-xs text-error mt-2">{error}</p>
      )}
      <div className="mt-2 flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1.5 text-xs font-semibold text-primary rounded-full hover:bg-primary-container">Cancel</button>
        <button onClick={handleSave} className="px-4 py-1.5 text-xs font-semibold text-on-primary bg-primary rounded-full hover:opacity-90">{primaryActionLabel}</button>
      </div>
    </div>
  );
};
