import React from 'react';
import { QueryAuditLog } from '../types';
import { Activity, Clock, ShieldAlert, CheckCircle2, FileText } from 'lucide-react';

interface AuditLogsViewProps {
  logs: QueryAuditLog[];
  onSelectDocByName: (filename: string) => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs, onSelectDocByName }) => {
  return (
    <section id="audit-logs-view-section" className="flex-1 flex flex-col p-8 overflow-y-auto bg-white">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-[#002B5B] tracking-tight">
          Logs de Ingestão e Auditoria RAG
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Histórico das consultas processadas, fontes correlacionadas, tempo de resposta e conformidade
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-lg border border-slate-200">
          <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">Nenhum log registrado na sessão</p>
          <p className="text-xs text-slate-400 mt-1">
            Faça perguntas no Chat do Consultor para gerar métricas de auditoria RAG.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map(log => (
            <div
              key={log.id}
              className="p-5 border border-slate-200 rounded-lg shadow-xs hover:border-slate-300 transition-all bg-white"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-[#002B5B] text-white text-[10px] px-2 py-0.5 rounded font-mono font-semibold">
                    {log.model}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{log.timestamp}</span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {log.latencyMs} ms
                  </span>
                  <span
                    className={`font-mono px-2 py-0.5 rounded text-[11px] font-semibold ${
                      log.similarity > 0.7
                        ? 'bg-green-100 text-green-800'
                        : log.similarity > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    Confiança: {(log.similarity * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Pergunta do Colaborador:
                </span>
                <p className="text-sm font-semibold text-slate-800">{log.question}</p>
              </div>

              <div className="mb-3 bg-slate-50 p-3 rounded border border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Resposta RAG Gerada:
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">{log.answer}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Fontes Utilizadas:</span>
                {log.sources.length > 0 ? (
                  log.sources.map(src => (
                    <button
                      key={src}
                      onClick={() => onSelectDocByName(src)}
                      className="text-[10px] font-mono text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-2.5 h-2.5" />
                      {src}
                    </button>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-400 italic">
                    Nenhuma fonte aplicável (pergunta fora do escopo corporativo)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
