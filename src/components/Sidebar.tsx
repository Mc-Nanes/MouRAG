import React from 'react';
import { MessageSquare, FileText, Activity } from 'lucide-react';
import mouraLogoImg from '../assets/logo-1.png';

interface SidebarProps {
  activeTab: 'chat' | 'documents' | 'logs';
  setActiveTab: (tab: 'chat' | 'documents' | 'logs') => void;
  totalDocuments: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  totalDocuments
}) => {
  return (
    <aside
      id="main-sidebar"
      className="w-64 bg-[#002B5B] flex flex-col border-r border-slate-200 shrink-0 select-none"
    >
      {/* Brand Header */}
      <div className="p-6">
        <div
          id="moura-brand-logo"
          className="bg-white rounded-xl mb-4 p-2 shadow-md border border-white/20 overflow-hidden flex items-center justify-center"
          title="Grupo Moura"
        >
          <img
            src={mouraLogoImg}
            alt="Grupo Moura"
            className="w-full h-12 object-contain"
          />
        </div>
        <h1 className="text-white font-bold text-lg tracking-tight flex items-center gap-2">
          Assistente Moura
        </h1>
      </div>

      {/* Navigation Tabs */}
      <nav id="sidebar-nav" className="flex-1 mt-4 px-4 space-y-2">
        <button
          id="nav-tab-chat"
          onClick={() => setActiveTab('chat')}
          className={`w-full px-3 py-2 rounded-md text-sm transition-all flex items-center gap-3 text-left font-medium ${
            activeTab === 'chat'
              ? 'bg-[#0a3a6e] text-white shadow-inner font-semibold'
              : 'text-blue-100 hover:bg-[#0a3a6e]/60 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4 opacity-80" />
          <span>Chat do Consultor</span>
        </button>

        <button
          id="nav-tab-documents"
          onClick={() => setActiveTab('documents')}
          className={`w-full px-3 py-2 rounded-md text-sm transition-all flex items-center justify-between text-left font-medium ${
            activeTab === 'documents'
              ? 'bg-[#0a3a6e] text-white shadow-inner font-semibold'
              : 'text-blue-100 hover:bg-[#0a3a6e]/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 opacity-80" />
            <span>Documentos Ingeridos</span>
          </div>
          <span className="text-[10px] bg-[#001f42] px-1.5 py-0.5 rounded text-blue-200">
            {totalDocuments}
          </span>
        </button>

        <button
          id="nav-tab-logs"
          onClick={() => setActiveTab('logs')}
          className={`w-full px-3 py-2 rounded-md text-sm transition-all flex items-center gap-3 text-left font-medium ${
            activeTab === 'logs'
              ? 'bg-[#0a3a6e] text-white shadow-inner font-semibold'
              : 'text-blue-100 hover:bg-[#0a3a6e]/60 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4 opacity-80" />
          <span>Logs de Ingestão</span>
        </button>
      </nav>

      {/* Footer System Status */}
      <div id="sidebar-status-footer" className="p-6 border-t border-blue-900/80 mt-auto bg-[#002247]/50">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
          <span className="text-xs text-blue-200 uppercase tracking-widest font-semibold">
            Assistente Online
          </span>
        </div>
        <p className="text-[10px] text-blue-300/60 font-mono tracking-wider">
          v1.2.0-stable
        </p>
      </div>
    </aside>
  );
};
