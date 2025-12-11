import React, { useState, useRef } from 'react';
import { InfoIcon, SparkleIcon, WarningIcon } from '../../icons';

interface LogicExpressionEditorProps {
  onSave: (text: string) => { success: boolean; error?: string };
  onCancel: () => void;
  placeholder: string;
  primaryActionLabel?: string;
  disclosureText: string;
  helpTopic?: string;
  onRequestGeminiHelp?: (topic: string) => void;
  transparentBackground?: boolean;
}

export const LogicExpressionEditor: React.FC<LogicExpressionEditorProps> = ({
  onSave,
  onCancel,
  placeholder,
  primaryActionLabel = "Apply",
  disclosureText,
  helpTopic,
  onRequestGeminiHelp,
  transparentBackground = false
}) => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(true);

  const handleSave = () => {
    const result = onSave(text);
    if (result.success) {
      setError(null);
      setIsEditing(false);
      // Do not call onCancel() here, so the component stays mounted in "View" mode
    } else {
      const errorMsg = result.error || 'An error occurred.';
      setError(errorMsg);
      generateErrorSuggestions(errorMsg, text);
    }
  };

  const generateErrorSuggestions = (errorMsg: string, currentText: string) => {
    const newSuggestions: string[] = [];

    // Heuristic: Self-reference or Invalid reference
    if (errorMsg.includes('Invalid reference') || errorMsg.includes('must appear before')) {
      // Check if user typed "Show Qx if..." where Qx is the current question
      const match = currentText.match(/^(?:SHOW|HIDE)\s+(Q\w+)\s+IF/i);
      if (match) {
        // Suggest removing the "Show Qx if" part and formatting correctly
        const cleaned = currentText.replace(/^(?:SHOW|HIDE)\s+Q\w+\s+IF\s+/i, '');
        // Default to HIDE IF as per requirements if ambiguous, or keep original intent if clear
        // But here the user explicitly typed SHOW or HIDE, so we keep that intent but fix syntax
        const prefix = currentText.match(/^SHOW/i) ? 'SHOW IF' : 'HIDE IF';
        newSuggestions.push(`${prefix} ${cleaned}`);
      }
    }

    // Heuristic: Syntax error
    if (errorMsg.includes('Syntax error')) {
      if (currentText.includes('=')) {
        // Ensure it starts with SHOW/HIDE IF
        let fixed = currentText.replace('=', 'equals');
        if (!fixed.match(/^(SHOW|HIDE)\s+IF/i)) {
          fixed = `HIDE IF ${fixed}`;
        }
        newSuggestions.push(fixed);
      }
    }

    // Always offer a generic "Fix" if we can't guess
    if (newSuggestions.length === 0) {
      newSuggestions.push('HIDE IF Q1 = 1');
    }

    setSuggestions(newSuggestions);
  };

  // Mock AI Suggestion Logic (Simulating an AI that guesses intent)
  const updateSuggestions = (inputText: string) => {
    const lastLine = inputText.split('\n').pop()?.trim() || '';
    const newSuggestions: string[] = [];

    // Helper to ensure prefix
    const withPrefix = (text: string, defaultPrefix: 'SHOW' | 'HIDE' = 'HIDE') => {
      if (text.match(/^(SHOW|HIDE)\s+IF/i)) return text;
      return `${defaultPrefix} IF ${text}`;
    };

    if (!lastLine) {
      newSuggestions.push('SHOW IF Q1.A1 = 1');
      newSuggestions.push('HIDE IF Q2 = 0');
    } else {
      // Detect existing prefix to preserve intent
      const existingPrefixMatch = lastLine.match(/^(SHOW|HIDE)\s+IF/i);
      const prefix = existingPrefixMatch ? existingPrefixMatch[1].toUpperCase() : 'HIDE'; // Default to HIDE

      // Strip prefix for analysis if present
      const content = lastLine.replace(/^(SHOW|HIDE)\s+IF\s*/i, '');

      if (content.match(/^Q\w+$/i)) {
        // Suggest standard Voxco patterns for a question ID
        newSuggestions.push(`${prefix} IF ${content}.A1 = 1`);
        newSuggestions.push(`${prefix} IF ${content} = 1`);
        newSuggestions.push(`${prefix} IF ${content} <> 1`);
        newSuggestions.push(`${prefix} IF ${content} LIKE "text"`);
      } else if (content.match(/^Q\w+\.A\w+$/i)) {
        // Suggest patterns for a specific answer choice
        newSuggestions.push(`${prefix} IF ${content} = 1`);
        newSuggestions.push(`${prefix} IF ${content} <> 1`);
      } else if (content.match(/^Q\w+\s*(=|<>|>|<|>=|<=|LIKE|RLIKE)\s*$/i)) {
        // User typed an operator, suggest values
        newSuggestions.push(`${prefix} IF ${content} 1`);
        newSuggestions.push(`${prefix} IF ${content} 0`);
        newSuggestions.push(`${prefix} IF ${content} "Yes"`);
      } else if (content.match(/^Q\w+\s*=\s*$/i)) {
        // Fallback for just =
        const qPart = content.split('=')[0].trim();
        newSuggestions.push(`${prefix} IF ${qPart} = 1`);
        newSuggestions.push(`${prefix} IF ${qPart} = 0`);
        newSuggestions.push(`${prefix} IF ${qPart} = "Yes"`);
      } else if (!content && existingPrefixMatch) {
        // User typed just "SHOW IF" or "HIDE IF"
        newSuggestions.push(`${prefix} IF Q1.A1 = 1`);
        newSuggestions.push(`${prefix} IF Q1 <> 0`);
        newSuggestions.push(`${prefix} IF Q2 LIKE "text"`);
      } else if (content) {
        // Generic fallback for partial content
        newSuggestions.push(`${prefix} IF ${content}`);
      }
    }

    setSuggestions(newSuggestions);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    if (error) setError(null);
    updateSuggestions(newText);
  };

  const applySuggestion = (suggestion: string) => {
    // If we are in an error state, the suggestion is likely a full replacement/fix
    if (error) {
      setText(suggestion);
      setError(null);
      updateSuggestions(suggestion);
      textareaRef.current?.focus();
      return;
    }

    const lines = text.split('\n');
    // Replace the last line with the full suggestion since suggestions are now always full lines
    lines[lines.length - 1] = suggestion;

    const newText = lines.join('\n');
    setText(newText);
    updateSuggestions(newText);
    textareaRef.current?.focus();
  };

  if (!isEditing) {
    return (
      <div className={`${transparentBackground ? 'bg-transparent' : 'bg-surface-container'} border border-outline-variant rounded-md p-4 space-y-3`}>
        <div
          onClick={() => setIsEditing(true)}
          className="p-3 bg-surface rounded border border-outline-variant text-sm font-mono text-on-surface whitespace-pre-wrap cursor-pointer hover:border-primary transition-colors"
          title="Click to edit"
        >
          {text}
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="text-error hover:text-error-container text-xs font-semibold transition-colors"
          >
            Delete
          </button>
        </div>
      </div >
    );
  }

  return (
    <div className={`${transparentBackground ? 'bg-transparent' : 'bg-surface-container'} border border-outline-variant rounded-md p-4 space-y-3`}>
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-on-surface block">
          Write expression
        </label>
        {helpTopic && onRequestGeminiHelp && (
          <button
            onClick={() => onRequestGeminiHelp(helpTopic)}
            className="flex items-center gap-1 text-primary hover:bg-surface-container-lowest px-2 py-1 rounded-full transition-colors text-xs font-semibold"
            title="Ask Gemini for help"
          >
            <SparkleIcon className="text-lg" />
            <span>Ask AI</span>
          </button>
        )}
      </div>

      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleTextChange}
        placeholder={placeholder}
        className="w-full h-32 bg-transparent border border-input-border rounded-md p-2 text-sm text-on-surface font-mono focus:outline-2 focus:outline-offset-1 focus:outline-primary resize-none"
      />

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-fadeIn">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => applySuggestion(suggestion)}
              className="px-2 py-1 text-xs bg-primary-container/50 text-on-surface hover:bg-primary-container border border-primary/20 rounded-full transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between gap-2 text-error text-xs bg-error-container/10 p-2 rounded">
          <div className="flex items-center gap-2">
            <WarningIcon className="text-sm flex-shrink-0" />
            <span>{error}</span>
          </div>
          {onRequestGeminiHelp && (
            <button
              onClick={() => onRequestGeminiHelp(`Fix logic error: "${error}" in logic: "${text}"`)}
              className="flex items-center gap-1 text-primary hover:text-primary-container font-semibold whitespace-nowrap"
            >
              <SparkleIcon className="text-sm" />
              <span>Fix with AI</span>
            </button>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-on-surface-variant">
          {disclosureText}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-lowestest rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!text.trim()}
            className="px-3 py-1.5 text-xs font-button-operator text-on-primary bg-primary rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {primaryActionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
