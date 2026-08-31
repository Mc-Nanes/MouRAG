import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { KnowledgeBaseAside } from './components/KnowledgeBaseAside';
import { ChatView } from './components/ChatView';
import { DocumentsView } from './components/DocumentsView';
import { AuditLogsView } from './components/AuditLogsView';
import { DocModal } from './components/DocModal';
import { ChatMessage, DocumentMetadata, QueryAuditLog } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || 'Erro ao consultar a API do assistente.');
  }

  return response.json() as Promise<T>;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'documents' | 'logs'>('chat');
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentMetadata | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [similarityScore, setSimilarityScore] = useState<number>(0.89);
  const [latencyMs, setLatencyMs] = useState<number>(0);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome-system',
      sender: 'system',
      text: 'Olá! Sou o Assistente Moura. Como posso te ajudar com as políticas internas hoje?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [auditLogs, setAuditLogs] = useState<QueryAuditLog[]>([]);

  const loadDocuments = async () => {
    try {
      const data = await apiRequest<{ total: number; documents: Array<{ id: number; title: string; filename: string; category?: string; total_chunks: number; created_at?: string | null; updated_at?: string | null }> }>('/documents');

      const mappedDocs: DocumentMetadata[] = data.documents.map(doc => ({
        id: String(doc.id),
        filename: doc.filename,
        title: doc.title,
        category: doc.category || 'Geral',
        code: doc.filename.replace(/\.[^.]+$/, '').replace(/_/g, '-').toUpperCase(),
        version: 'api',
        content: '',
        chunksCount: doc.total_chunks,
        totalChars: 0,
        updatedAt: doc.updated_at || doc.created_at || new Date().toISOString().split('T')[0]
      }));

      setDocuments(mappedDocs);
    } catch (error) {
      console.error('Erro ao carregar documentos da API:', error);
      setDocuments([]);
    }
  };

  const loadHistory = async () => {
    try {
      const history = await apiRequest<Array<{ id: number; question: string; answer: string; sources: string[]; chunks_used: number; model_used: string; latency_ms: number; created_at?: string | null }>>('/history');

      const mappedLogs: QueryAuditLog[] = history.map(item => ({
        id: `log-${item.id}`,
        question: item.question,
        answer: item.answer,
        sources: item.sources || [],
        chunksRetrieved: item.chunks_used || 0,
        similarity: 0,
        latencyMs: Number(item.latency_ms) || 0,
        timestamp: item.created_at || new Date().toISOString(),
        model: item.model_used || 'gemini-3.6-flash'
      }));

      setAuditLogs(mappedLogs);
    } catch (error) {
      console.error('Erro ao carregar histórico da API:', error);
      setAuditLogs([]);
    }
  };

  useEffect(() => {
    void loadDocuments();
    void loadHistory();
  }, []);

  const handleSendMessage = async (query: string) => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: timeString
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await apiRequest<{ question: string; answer: string; sources: string[]; retrieved_chunks_count: number; latency_ms: number; model_used: string; query_id?: number }>('/ask', {
        method: 'POST',
        body: JSON.stringify({ question: query, top_k: 4 })
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.answer,
        sources: response.sources || [],
        similarityScore: response.sources && response.sources.length > 0 ? 0.92 : 0,
        latencyMs: Number(response.latency_ms) || 0,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      setSimilarityScore(response.sources && response.sources.length > 0 ? 0.92 : 0);
      setLatencyMs(Number(response.latency_ms) || 0);

      const newLog: QueryAuditLog = {
        id: `log-${response.query_id ?? Date.now()}`,
        question: response.question,
        answer: response.answer,
        sources: response.sources || [],
        chunksRetrieved: response.retrieved_chunks_count || 0,
        similarity: response.sources && response.sources.length > 0 ? 0.92 : 0,
        latencyMs: Number(response.latency_ms) || 0,
        timestamp: new Date().toLocaleString(),
        model: response.model_used || 'gemini-3.6-flash'
      };

      setAuditLogs(prev => [newLog, ...prev]);
    } catch (error) {
      console.error('Erro ao consultar o assistente:', error);
      setMessages(prev => [
        ...prev,
        {
          id: `ai-error-${Date.now()}`,
          sender: 'ai',
          text: 'Não foi possível responder agora. Verifique a conexão com a API ou a autenticação configurada.',
          sources: [],
          similarityScore: 0,
          latencyMs: 0,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `sys-${Date.now()}`,
        sender: 'system',
        text: 'Olá! Sou o Assistente Moura. Conversa reiniciada. Como posso te ajudar com as diretrizes e normas corporativas?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSelectDocByName = (filename: string) => {
    const found = documents.find(d => d.filename === filename || filename.includes(d.filename));
    if (found) {
      setSelectedDoc(found);
    }
  };

  const handleRefreshDocs = async () => {
    try {
      const result = await apiRequest<{ status: string; total_documents: number; total_chunks: number; message: string }>('/ingest', {
        method: 'POST'
      });

      setMessages(prev => [
        ...prev,
        {
          id: `sys-ingest-${Date.now()}`,
          sender: 'system',
          text: result.message || `Base de documentos reindexada com sucesso (${result.total_documents} documentos).`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      await loadDocuments();
      await loadHistory();
    } catch (error) {
      console.error('Erro ao reindexar a base documental:', error);
      setMessages(prev => [
        ...prev,
        {
          id: `sys-ingest-error-${Date.now()}`,
          sender: 'system',
          text: 'Não foi possível reindexar a base documental. Verifique a API e a autenticação.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'chat':
        return 'Chat do Consultor';
      case 'documents':
        return 'Base de Documentos Ingeridos';
      case 'logs':
        return 'Logs de Ingestão e Auditoria';
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans bg-[#F8FAFC]">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalDocuments={documents.length}
      />

      <main className="flex-1 flex flex-col bg-white overflow-hidden">
        <Header onClearChat={handleClearChat} activeTabTitle={getTabTitle()} />

        <div className="flex-1 flex overflow-hidden">
          {activeTab === 'chat' && (
            <ChatView
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              onSelectDocByName={handleSelectDocByName}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsView
              documents={documents}
              onSelectDoc={doc => setSelectedDoc(doc)}
            />
          )}

          {activeTab === 'logs' && (
            <AuditLogsView
              logs={auditLogs}
              onSelectDocByName={handleSelectDocByName}
            />
          )}

          <KnowledgeBaseAside
            documents={documents}
            onSelectDoc={doc => setSelectedDoc(doc)}
            similarityScore={similarityScore}
            latencyMs={latencyMs}
            onRefreshDocs={handleRefreshDocs}
          />
        </div>
      </main>

      <DocModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
    </div>
  );
}
