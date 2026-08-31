import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, DocumentMetadata } from '../types';
import { Send, Sparkles, HelpCircle, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import userAvatarImg from '../assets/avatar.jpg';
import mouraLogoImg from '../assets/logo-1.png';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onSelectDocByName: (filename: string) => void;
}

const SAMPLE_QUESTIONS = [
  'Qual a política de férias e antecedência mínima?',
  'Qual é o valor do reembolso por km rodado?',
  'Como solicitar inclusão de dependente no plano de saúde?',
  'Quais são os requisitos de complexidade de senhas?',
  'Quais os EPIs obrigatórios para áreas de fundição de chumbo?'
];

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onSelectDocByName
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <section id="chat-view-section" className="flex-1 flex flex-col p-8 overflow-hidden bg-white">
      {/* Scrollable messages container */}
      <div id="messages-container" className="flex-1 space-y-6 overflow-y-auto pr-2">
        {messages.map(msg => {
          if (msg.sender === 'system') {
            return (
              <div key={msg.id} className="flex gap-4 items-start max-w-2xl">
                <div className="w-8 h-8 rounded-sm bg-slate-200 flex-shrink-0 flex items-center justify-center font-bold text-slate-500 text-xs">
                  S
                </div>
                <div className="bg-slate-100 p-4 rounded-lg rounded-tl-none border border-slate-200/50">
                  <div className="text-sm leading-relaxed text-slate-800 prose prose-sm max-w-none">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 block font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          }

          if (msg.sender === 'user') {
            return (
              <div
                key={msg.id}
                className="flex gap-4 items-start max-w-2xl ml-auto flex-row-reverse"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-slate-300 bg-slate-200 shadow-xs">
                  <img
                    src={userAvatarImg}
                    alt="Usuário"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="bg-[#002B5B] p-4 rounded-lg rounded-tr-none text-white shadow-md">
                  <p className="text-sm leading-relaxed font-normal">{msg.text}</p>
                  <span className="text-[10px] text-blue-200/70 mt-2 block text-right font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          }

          // AI Response Bubble
          return (
            <div key={msg.id} className="flex gap-4 items-start max-w-2xl">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex-shrink-0 flex items-center justify-center p-1 shadow-xs overflow-hidden">
                <img
                  src={mouraLogoImg}
                  alt="Moura"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="bg-white border-2 border-slate-100 p-4 rounded-lg rounded-tl-none shadow-sm flex-1">
                <div className="text-sm leading-relaxed text-slate-800 space-y-2 prose prose-sm max-w-none">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>

                {/* Sources & Citations Footer */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Fonte:
                    </span>
                    {msg.sources.map(src => (
                      <button
                        key={src}
                        onClick={() => onSelectDocByName(src)}
                        className="text-[10px] text-blue-600 font-mono hover:underline cursor-pointer flex items-center gap-1 bg-blue-50/70 px-2 py-0.5 rounded border border-blue-100"
                        title="Ver documento completo"
                      >
                        <span>data/{src}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                      </button>
                    ))}
                    {msg.similarityScore && (
                      <span className="ml-auto text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">
                        Confiança: {(msg.similarityScore * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-4 items-start max-w-2xl">
            <div className="w-8 h-8 rounded-sm bg-[#F7C600] flex-shrink-0 flex items-center justify-center font-bold text-[#002B5B] text-xs shadow-xs animate-pulse">
              IA
            </div>
            <div className="bg-white border-2 border-slate-100 p-4 rounded-lg rounded-tl-none shadow-sm flex items-center gap-3">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-[#002B5B] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#002B5B] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-[#002B5B] rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Consultando base vetorial corporativa...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      {messages.length <= 2 && (
        <div className="mt-4 mb-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Sugestões de perguntas frequentes:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(q);
                  onSendMessage(q);
                }}
                className="text-xs bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#002B5B] px-3 py-1.5 rounded-md border border-slate-200 hover:border-blue-300 transition-all text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="mt-4 relative">
        <input
          id="chat-query-input"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Digite sua dúvida corporativa..."
          type="text"
          disabled={isLoading}
          className="w-full border-2 border-slate-200 rounded-lg py-4 px-6 pr-28 focus:outline-none focus:border-[#002B5B] text-sm transition-all shadow-inner bg-white text-slate-800 placeholder:text-slate-400"
        />
        <button
          type="submit"
          id="chat-submit-btn"
          disabled={!inputText.trim() || isLoading}
          className="absolute right-3 top-3 bg-[#002B5B] hover:bg-[#001f42] text-white p-2.5 px-5 rounded font-bold text-xs shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider flex items-center gap-1.5"
        >
          <span>ENVIAR</span>
          <Send className="w-3 h-3" />
        </button>
      </form>
    </section>
  );
};
