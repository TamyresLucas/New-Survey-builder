import { GoogleGenAI, FunctionDeclaration, Type, Chat } from "@google/genai";
import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { XIcon, SparkleIcon, SendIcon, LoaderIcon, AccountCircleIcon } from './icons';
import type { ChatMessage, Question, QuestionType, Choice } from '../types';
import { QuestionType as QTEnum } from '../types';
import { generateId } from '../utils';

interface GeminiPanelProps {
  onClose: () => void;
  onAddQuestion: (questionType: QuestionType, title: string, choices?: string[], afterQid?: string, beforeQid?: string) => void;
  onUpdateQuestion: (args: any) => void;
  helpTopic: string | null;
  selectedQuestion: Question | null;
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
          enum: [QTEnum.Radio, QTEnum.Checkbox, QTEnum.Description, QTEnum.TextEntry],
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

const updateQuestionFunctionDeclaration: FunctionDeclaration = {
  name: 'update_question',
  description: 'Updates properties of an existing question. Use this to change text, choices, type, or other settings like making it required or randomizing choices.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      qid: {
        type: Type.STRING,
        description: "The variable name of the question to update (e.g., 'Q1'). When the user says 'this question', use the qid from the provided context.",
      },
      text: {
        type: Type.STRING,
        description: 'The new main text for the question.',
      },
      type: {
        type: Type.STRING,
        description: 'The new type for the question (e.g., "Checkbox", "Text Entry").',
        enum: Object.values(QTEnum),
      },
      choices: {
        type: Type.ARRAY,
        description: 'A new array of strings for the choices. This will replace all existing choices.',
        items: {
          type: Type.STRING,
        },
      },
      forceResponse: {
        type: Type.BOOLEAN,
        description: 'Set to true to make the question required, false to make it optional.',
      },
      randomizeChoices: {
          type: Type.BOOLEAN,
          description: "Set to true to randomize the order of choices, false to disable randomization."
      },
      answerFormat: {
          type: Type.STRING,
          description: "For choice-based questions, sets the display format.",
          enum: ['list', 'dropdown', 'horizontal']
      }
    },
    required: ['qid'],
  },
};

const initialMessages: ChatMessage[] = [
    { role: 'model', text: "Hi! How can I help you build your survey today? You can ask me to add questions, suggest improvements, or check for issues." }
];


const GeminiPanel: React.FC<GeminiPanelProps> = memo(({ onClose, onAddQuestion, onUpdateQuestion, helpTopic, selectedQuestion }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    const systemInstruction = `You are a helpful survey building assistant integrated into a UI.
    Your primary goal is to help users build and modify surveys using available tools.
    When the user refers to "this question" or "the selected question," you should use the context provided about the currently selected question (if any).
    Use the update_question tool to modify existing questions based on user requests like "make this required" or "change the choices".
    Always be concise and confirm actions taken.`;

    chatRef.current = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: initialMessages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      })),
      config: {
        tools: [{ functionDeclarations: [addQuestionFunctionDeclaration, updateQuestionFunctionDeclaration] }],
      },
      systemInstruction: { parts: [{ text: systemInstruction }] }
    });
  }, []);


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const fetchHelpTopic = async (topic: string) => {
      setMessages([]); // Clear previous chat
      setIsLoading(true);
      try {
        const prompt = `Explain the advanced syntax for ${topic} in this survey tool. 
        - Start with a brief explanation.
        - List the supported operators and their required structure. For example, 'Q1 equals Yes', or for skip logic 'Q5'.
        - Provide at least one concrete example for ${topic}.
        - Keep the explanation concise and formatted for a small panel using markdown for bolding and lists.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        
        const helpText = response.text;
        setMessages([{ role: 'model', text: helpText }]);

      } catch (error) {
        console.error('Error fetching help topic:', error);
        setMessages([{ role: 'model', text: `Sorry, I couldn't fetch information about ${topic}. Please check your API key and network connection.` }]);
      } finally {
        setIsLoading(false);
      }
    };

    if (helpTopic) {
      fetchHelpTopic(helpTopic);
    } else {
      if (messages.length === 0) {
        setMessages(initialMessages);
      }
    }
  }, [helpTopic]);

  const handleSendMessage = useCallback(async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading || !chatRef.current) return;

    const userMessage: ChatMessage = { role: 'user', text: trimmedInput };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      let finalInput = trimmedInput;
      if (selectedQuestion) {
          finalInput = `CONTEXT: The user has question ${selectedQuestion.qid} ('${selectedQuestion.text}') selected.\n\nUSER PROMPT: ${trimmedInput}`;
      }

      const response = await chatRef.current.sendMessage({ message: finalInput });
      
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
          } else if (funcCall.name === 'update_question') {
            const args = funcCall.args as any;
            onUpdateQuestion(args);
            newModelMessages.push({ role: 'model', text: `OK, I've updated question ${args.qid}.` });
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
  }, [inputValue, isLoading, onAddQuestion, onUpdateQuestion, selectedQuestion]);


  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
  }, [handleSendMessage]);

  const isHelpMode = !!helpTopic;

  return (
    <aside className="w-full h-full bg-surface-container border-l border-outline-variant flex flex-col">
      <div className="p-4 border-b border-outline-variant flex items-center justify-between">
        <div className="flex items-center">
            <SparkleIcon className="text-xl text-primary mr-2" />
            <h2 className="text-lg font-bold text-on-surface" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                {isHelpMode ? `About ${helpTopic}` : 'Gemini Assistant'}
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
                    <p className={`text-sm ${msg.role === 'user' ? '' : 'text-on-surface'}`} dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}/>
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
                        {helpTopic ? 'Fetching details...' : 'Gemini is thinking...'}
                    </p>
                </div>
            </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className={`p-4 border-t border-outline-variant ${isHelpMode ? 'hidden' : ''}`}>
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
            disabled={isLoading || isHelpMode}
          />
          <button 
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim() || isHelpMode}
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
