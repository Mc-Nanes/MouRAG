import React, { useState } from 'react';
import { DocumentMetadata } from '../types';
import { Search, FileText, Layers, Hash, Calendar, ExternalLink } from 'lucide-react';

interface DocumentsViewProps {
  documents: DocumentMetadata[];
  onSelectDoc: (doc: DocumentMetadata) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ documents, onSelectDoc }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(documents.map(d => d.category)))];

  const filteredDocs = documents.filter(doc => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <section id="documents-view-section" className="flex-1 flex flex-col p-8 overflow-y-auto bg-white">
      {/* Header & Filter Bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl font-bold text-[#002B5B] tracking-tight">
            Base de Documentos Corporativos
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Políticas, normas regulamentadoras e diretrizes indexadas no motor RAG
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Buscar por termo ou código..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#002B5B]"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              selectedCategory === cat
                ? 'bg-[#002B5B] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat === 'all' ? 'Todos os Documentos' : cat}
          </button>
        ))}
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map(doc => (
          <div
            key={doc.id}
            id={`doc-grid-card-${doc.id}`}
            onClick={() => onSelectDoc(doc)}
            className="p-5 bg-white border border-slate-200 rounded-lg shadow-xs hover:border-[#002B5B] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono bg-blue-50 text-[#002B5B] px-2 py-0.5 rounded font-semibold border border-blue-100">
                  {doc.code}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">v{doc.version}</span>
              </div>

              <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#002B5B] transition-colors line-clamp-2 mb-2">
                {doc.title}
              </h3>

              <p className="text-xs text-slate-500 mb-4 line-clamp-3">
                {doc.content.slice(0, 180)}...
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 font-mono">
                <Layers className="w-3.5 h-3.5 text-blue-500" />
                <span>{doc.chunksCount} chunks</span>
              </div>
              <div className="flex items-center gap-1 text-blue-600 font-semibold group-hover:underline">
                <span>Inspecionar</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
