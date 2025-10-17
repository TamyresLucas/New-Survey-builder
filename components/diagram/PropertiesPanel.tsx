import React, { useState, useEffect, useCallback, memo } from 'react';
import type { Node, MultipleChoiceNode, TextEntryNode, Option } from '../../types';
import { isMultipleChoiceNode, isTextEntryNode } from '../../types';
import { XIcon, PlusIcon } from '../icons';
import { generateId } from '../../utils';

interface PropertiesPanelProps {
  node: Node;
  onUpdateNode: (nodeId: string, data: any) => void;
  onClose: () => void;
}

// Sub-component for editing Multiple Choice options
const MultipleChoiceOptionsEditor: React.FC<{
  node: MultipleChoiceNode;
  onUpdateNode: (nodeId: string, data: any) => void;
}> = ({ node, onUpdateNode }) => {
  
  const handleOptionTextChange = (optionId: string, newText: string) => {
    const newOptions = node.data.options.map(opt => 
      opt.id === optionId ? { ...opt, text: newText } : opt
    );
    onUpdateNode(node.id, { options: newOptions });
  };
  
  const handleAddOption = () => {
    const qid = node.data.variableName;
    const newOption: Option = {
      id: generateId('opt'),
      text: `Option ${node.data.options.length + 1}`,
      variableName: `${qid}_${node.data.options.length + 1}`
    };
    onUpdateNode(node.id, { options: [...node.data.options, newOption] });
  };

  const handleRemoveOption = (optionId: string) => {
    const newOptions = node.data.options.filter(opt => opt.id !== optionId);
    onUpdateNode(node.id, { options: newOptions });
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-on-surface-variant">Options</label>
      {node.data.options.map(option => (
        <div key={option.id} className="flex items-center gap-2">
          <input
            type="text"
            value={option.text}
            onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
            className="flex-grow bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
          />
          <button
            onClick={() => handleRemoveOption(option.id)}
            className="p-1 text-on-surface-variant hover:text-error rounded-full hover:bg-error-container"
          >
            <XIcon className="text-base" />
          </button>
        </div>
      ))}
      <button
        onClick={handleAddOption}
        className="flex items-center gap-1 text-sm font-medium text-primary hover:underline mt-2"
      >
        <PlusIcon className="text-base" />
        Add Option
      </button>
    </div>
  );
};

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ node, onUpdateNode, onClose }) => {
  const [questionText, setQuestionText] = useState(
      isMultipleChoiceNode(node) || isTextEntryNode(node) ? node.data.question : ''
  );

  useEffect(() => {
    if (isMultipleChoiceNode(node) || isTextEntryNode(node)) {
        setQuestionText(node.data.question);
    }
  }, [node]);

  const handleTextBlur = () => {
    if (isMultipleChoiceNode(node) || isTextEntryNode(node)) {
      if (questionText.trim() !== node.data.question) {
        onUpdateNode(node.id, { question: questionText.trim() });
      }
    }
  };
  
  const variableName = isMultipleChoiceNode(node) || isTextEntryNode(node) ? node.data.variableName : '';


  const renderNodeProperties = () => {
    if (isMultipleChoiceNode(node)) {
      return (
        <div className="space-y-4">
          <div>
            <label htmlFor="question-text" className="block text-sm font-medium text-on-surface-variant mb-1">
              Question Text
            </label>
            <textarea
              id="question-text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              onBlur={handleTextBlur}
              rows={3}
              className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
            />
          </div>
          <MultipleChoiceOptionsEditor node={node} onUpdateNode={onUpdateNode} />
        </div>
      );
    }

    if (isTextEntryNode(node)) {
       return (
        <div className="space-y-4">
          <div>
            <label htmlFor="question-text" className="block text-sm font-medium text-on-surface-variant mb-1">
              Question Text
            </label>
            <textarea
              id="question-text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              onBlur={handleTextBlur}
              rows={3}
              className="w-full bg-surface border border-outline rounded-md p-2 text-sm text-on-surface focus:outline-2 focus:outline-offset-1 focus:outline-primary"
            />
          </div>
        </div>
      );
    }
    
    // Default or other node types
    return <p className="text-sm text-on-surface-variant">No properties to edit for this node type.</p>;
  };

  return (
    <aside className="absolute top-4 right-4 z-10 w-96 max-h-[calc(100vh-2rem)] bg-surface-container border border-outline-variant rounded-lg shadow-lg flex flex-col">
      <header className="p-4 border-b border-outline-variant flex items-center justify-between">
        <h2 className="text-lg font-bold text-on-surface">Properties: {variableName}</h2>
        <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1">
          <XIcon className="text-2xl" />
        </button>
      </header>
      <div className="flex-1 p-6 overflow-y-auto">
        {renderNodeProperties()}
      </div>
    </aside>
  );
};

export default memo(PropertiesPanel);