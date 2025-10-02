import { GoogleGenAI, FunctionDeclaration, Type, Chat } from "@google/genai";
import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { XIcon, SparkleIcon, SendIcon, LoaderIcon, AccountCircleIcon } from './icons';
import type { ChatMessage, QuestionType } from '../types';
import { QuestionType as QTEnum } from '../types';

interface GeminiPanelProps {
  onClose: () => void;
  onAddQuestion: (questionType: QuestionType, title: string, choices?: string[], afterQid?: string, beforeQid?: string) => void;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const addQuestionFunctionDeclaration: FunctionDeclaration = {
    name: 'add_question',
    description: 'Adds a question to the survey. Can optionally specify its position relative to another question.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: 'The main text or question being asked.',
        },
        type: {
          type: Type.STRING,
          description: 'The type of question.',
          enum: [QTEnum.Radio, QTEnum.Checkbox, QTEnum.Description, QTEnum.Text],
        },
        choices: {
          type: Type.ARRAY,
          description: 'An array of strings for the choices. Only applicable for Radio Button and Checkbox types.',
          items: {
            type: Type.STRING,
          },
        },
        after_qid: {
            type: Type.STRING,
            description: "The variable name (e.g., 'Q1', 'Q2') of the question AFTER which this new question should be inserted. Use for requests like 'add a question after Q2'."
        },
        before_qid: {
            type: Type.STRING,
            description: "The variable name (e.g., 'Q1', 'Q2') of the question BEFORE which this new question should be inserted. Use for requests like 'add before Q2' or to make the new question become a specific number, e.g., 'make this the new Q1'."
        }
      },
      required: ['title', 'type'],
    },
};

const initialMessages: ChatMessage[] = [
    { role: 'model', text: "Hi! How can I help you build your survey today? You can ask me to add questions, suggest improvements, or check for issues." }
];


const GeminiPanel: React.FC<GeminiPanelProps> = memo(({ onClose, onAddQuestion }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    chatRef.current = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: initialMessages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      })),
      config: {
        tools: [{ functionDeclarations: [addQuestionFunctionDeclaration] }],
      },
    });
  }, []);


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = useCallback(async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading || !chatRef.current) return;

    const userMessage: ChatMessage = { role: 'user', text: trimmedInput };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: trimmedInput });
      
      const newModelMessages: ChatMessage[] = [];

      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const funcCall of response.functionCalls) {
          if (funcCall.name === 'add_question') {
            const { title, type, choices, after_qid, before_qid } = funcCall.args as { title: string; type: QuestionType; choices?: string[]; after_qid?: string; before_qid?: string; };
            onAddQuestion(type, title, choices, after_qid, before_qid);

            let confirmationText = `Sure, I've added a "${type}" question with the title "${title}"`;
            if (before_qid) {
              confirmationText += ` before question ${before_qid}. The question numbers have been updated.`;
            } else if (after_qid) {
              confirmationText += ` after question ${after_qid}.`;
            } else {
              confirmationText += '.';
            }
            newModelMessages.push({ role: 'model', text: confirmationText });
          }
        }
      } else if (response.text) {
        newModelMessages.push({ role: 'model', text: response.text });
      } else {
        newModelMessages.push({ role: 'model', text: "Sorry, I couldn't process that request." });
      }

      if (newModelMessages.length > 0) {
        setMessages(prev => [...prev, ...newModelMessages]);
      }

    } catch (error) {
      console.error('Error calling Gemini API:', error);
      const errorMessage: ChatMessage = { role: 'model', text: "Sorry, something went wrong. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, onAddQuestion]);


  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
  }, [handleSendMessage]);

  return (
    <aside className="w-full h-full bg-surface-container border-l border-outline-variant flex flex-col">
      <div className="p-4 border-b border-outline-variant flex items-center justify-between">
        <div className="flex items-center">
            <SparkleIcon className="text-xl text-primary mr-2" />
            <h2 className="text-lg font-bold text-on-surface" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                Gemini Assistant
            </h2>
        </div>
        <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface" aria-label="Close Gemini Assistant">
          <XIcon className="text-2xl" />
        </button>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto space-y-4" style={{ fontFamily: "'Open Sans', sans-serif" }}>
        {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                        <SparkleIcon className="text-lg text-on-primary-container" />
                    </div>
                )}
                <div className={`rounded-lg p-3 max-w-xs ${msg.role === 'user' ? 'bg-primary text-on-primary' : 'bg-surface-container-high'}`}>
                    <p className={`text-sm ${msg.role === 'user' ? '' : 'text-on-surface'}`}>
                        {msg.text}
                    </p>
                </div>
                 {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center flex-shrink-0">
                        <AccountCircleIcon className="text-lg text-on-surface-variant" />
                    </div>
                )}
            </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                    <LoaderIcon className="text-lg text-on-primary-container animate-spin" />
                </div>
                <div className="bg-surface-container-high rounded-lg p-3 max-w-xs">
                    <p className="text-sm text-on-surface-variant italic">
                        Gemini is thinking...
                    </p>
                </div>
            </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-outline-variant">
        <div className="relative">
          <textarea
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Gemini..."
            className="w-full bg-surface-container-high border-transparent rounded-md py-2 pl-4 pr-12 text-sm text-on-surface focus:outline-2 focus:outline-primary resize-none"
            style={{ fontFamily: "'Open Sans', sans-serif", maxHeight: '100px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
            disabled={isLoading}
          />
          <button 
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary text-on-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ring-offset-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message to Gemini"
          >
            <SendIcon className="text-base" />
          </button>
        </div>
      </div>
    </aside>
  );
});

export default GeminiPanel;