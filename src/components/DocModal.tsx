import React, { useMemo, useState } from 'react';
import { DocumentMetadata } from '../types';
import { X, Layers, FileText, Copy, Check } from 'lucide-react';

interface DocModalProps {
  doc: DocumentMetadata | null;
  onClose: () => void;
}

export const DocModal: React.FC<DocModalProps> = ({ doc, onClose }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'chunks'>('content');
  const [copied, setCopied] = useState(false);

  if (!doc) return null;

  const contentText = useMemo(
    () =>
      doc.content && doc.content.trim().length > 0
        ? doc.content
        : `Documento: ${doc.filename}\n\nInformações detalhadas são mantidas na base oficial em data/ e acessadas pela API FastAPI. Este modal exibe apenas metadados do documento e a referência do arquivo fonte.`,
    [doc]
  );

  const chunks = useMemo(() => {
    if (!doc.content || !doc.content.trim()) return [];
    const lines = doc.content.split('\n');
    const items: Array<{ id: string; sectionTitle: string; content: string }> = [];
    let section = doc.title;
    let current: string[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('#')) {
        if (current.length > 0) {
          items.push({ id: `${doc.id}-chunk-${idx}`, sectionTitle: section, content: current.join('\n\n').trim() });
        }
        section = trimmed.replace(/^#+\s*/, '');
        current = [];
        return;
      }
      if (trimmed.length > 0) {
        current.push(trimmed);
      }
    });

    if (current.length > 0) {
      items.push({ id: `${doc.id}-chunk-end`, sectionTitle: section, content: current.join('\n\n').trim() });
    }

    return items.filter(item => item.content.length > 30);
  }, [doc]);

  const handleCopy = () => {
    navigator.clipboard.writeText(contentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono bg-[#002B5B] text-white px-2 py-0.5 rounded font-semibold">
                {doc.code || doc.filename}
              </span>
              <span className="text-xs text-slate-500 font-mono">v{doc.version || 'api'}</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-blue-600 font-mono font-medium">{doc.filename}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{doc.title}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title="Copiar conteúdo"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 border-b border-slate-100 flex gap-4 bg-white">
          <button
            onClick={() => setActiveTab('content')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'content'
                ? 'border-[#002B5B] text-[#002B5B]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Documento Completo</span>
          </button>
          <button
            onClick={() => setActiveTab('chunks')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'chunks'
                ? 'border-[#002B5B] text-[#002B5B]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Chunks Fragmentados ({chunks.length})</span>
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
          {activeTab === 'content' ? (
            <div className="bg-white p-6 rounded-lg border border-slate-200 text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-line shadow-xs">
              {contentText}
            </div>
          ) : (
            <div className="space-y-4">
              {chunks.length > 0 ? chunks.map((chunk, idx) => (
                <div key={chunk.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 text-xs">
                    <span className="font-bold text-[#002B5B]">{chunk.sectionTitle}</span>
                    <span className="font-mono text-slate-400 text-[10px]">Chunk #{idx + 1}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {chunk.content}
                  </p>
                </div>
              )) : (
                <div className="bg-white p-6 rounded-lg border border-slate-200 text-sm text-slate-600">
                  Este documento não possui conteúdo local em cache. A base oficial continua na pasta data/.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
