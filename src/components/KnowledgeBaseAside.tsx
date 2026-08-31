import React from 'react';
import { DocumentMetadata } from '../types';
import { Database, RefreshCw, CheckCircle } from 'lucide-react';

interface KnowledgeBaseAsideProps {
  documents: DocumentMetadata[];
  onSelectDoc: (doc: DocumentMetadata) => void;
  similarityScore: number;
  latencyMs: number;
  onRefreshDocs: () => void;
}

export const KnowledgeBaseAside: React.FC<KnowledgeBaseAsideProps> = ({
  documents,
  onSelectDoc,
  similarityScore,
  latencyMs,
  onRefreshDocs
}) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onRefreshDocs();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <aside
      id="knowledge-base-aside"
      className="w-80 bg-slate-50 border-l border-slate-100 p-6 flex flex-col shrink-0 overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          Base de Conhecimento
        </h3>
        <span className="text-[10px] font-mono bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-200">
          {documents.length} docs
        </span>
      </div>

      <div className="space-y-2 mb-8" id="docs-quick-list">
        {documents.map(doc => (
          <div
            key={doc.id}
            id={`doc-card-${doc.id}`}
            onClick={() => onSelectDoc(doc)}
            className="flex items-center gap-3 p-2 bg-white rounded border border-slate-200 shadow-sm cursor-pointer hover:border-[#002B5B] hover:shadow transition-all group"
            title={`Clique para inspecionar ${doc.filename}`}
          >
            <div className="w-1.5 h-6 bg-blue-500 rounded-full group-hover:bg-[#002B5B] transition-colors shrink-0"></div>
            <div className="flex-1 overflow-hidden">
              <div className="text-[11px] font-bold text-slate-700 truncate group-hover:text-[#002B5B]">
                {doc.filename}
              </div>
              <div className="text-[9px] text-slate-400 flex items-center justify-between">
                <span>{doc.chunksCount || 0} chunks indexados</span>
                <span className="text-slate-300 font-mono text-[8px]">{doc.code || 'API'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
        Métricas RAG
      </h3>
      <div className="grid grid-cols-2 gap-3 mb-8" id="rag-metrics-cards">
        <div className="bg-white p-3 rounded border border-slate-100 text-center shadow-xs">
          <div className="text-lg font-bold text-[#002B5B]">
            {similarityScore > 0 ? similarityScore.toFixed(2) : '0.00'}
          </div>
          <div className="text-[9px] text-slate-400 uppercase font-medium">Similaridade</div>
        </div>
        <div className="bg-white p-3 rounded border border-slate-100 text-center shadow-xs">
          <div className="text-lg font-bold text-[#002B5B]">
            {latencyMs > 0 ? `${(latencyMs / 1000).toFixed(2)}s` : '0.00s'}
          </div>
          <div className="text-[9px] text-slate-400 uppercase font-medium">Latência</div>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <div
          id="drag-drop-ingest-box"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={onRefreshDocs}
          className="bg-[#e2e8f0]/80 hover:bg-[#e2e8f0] p-4 rounded-lg border-2 border-dashed border-slate-300 hover:border-[#002B5B] transition-all cursor-pointer text-center group"
        >
          <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 group-hover:text-slate-700 uppercase tracking-wider mb-2 leading-snug">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>REINDEXAR BASE DE DOCUMENTOS</span>
          </div>
          <div className="w-8 h-8 mx-auto border-2 border-slate-400 group-hover:border-[#002B5B] rounded flex items-center justify-center transition-colors bg-white/60">
            <Database className="w-4 h-4 text-slate-500 group-hover:text-[#002B5B]" />
          </div>
          <div className="mt-3 text-[10px] text-slate-500 flex items-center justify-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span>Atualiza a fonte oficial em data/</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
