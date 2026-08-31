import React from 'react';
import { Trash2, Sparkles, Building2 } from 'lucide-react';

interface HeaderProps {
  onClearChat: () => void;
  activeTabTitle: string;
}

export const Header: React.FC<HeaderProps> = ({ onClearChat, activeTabTitle }) => {
  return (
    <header
      id="main-app-header"
      className="h-16 border-b border-slate-100 px-8 flex items-center justify-between bg-white shrink-0"
    >
      <div className="flex items-center gap-4">
        <span className="text-slate-400 font-medium text-sm hidden sm:inline">Ambiente:</span>
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded border border-slate-200/60">
          <Building2 className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-700 text-xs font-semibold tracking-wide">
            PRODUÇÃO - CORPORATIVO
          </span>
        </div>
        <span className="text-slate-300 font-light hidden md:inline">|</span>
        <span className="text-slate-500 text-xs font-medium hidden md:inline">
          {activeTabTitle}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          id="btn-clear-conversation"
          onClick={onClearChat}
          className="bg-[#F7C600] hover:bg-[#e5b700] text-[#002B5B] px-4 py-2 rounded font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
          title="Limpar histórico da conversa ativa"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>LIMPAR CONVERSA</span>
        </button>

        <div
          id="user-profile-avatar"
          className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 font-bold text-xs"
          title="Consultor Corporativo Moura"
        >
          <Sparkles className="w-4 h-4 text-[#002B5B]" />
        </div>
      </div>
    </header>
  );
};
