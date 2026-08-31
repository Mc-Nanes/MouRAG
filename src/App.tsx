import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { KnowledgeBaseAside } from './components/KnowledgeBaseAside';
import { ChatView } from './components/ChatView';
import { DocumentsView } from './components/DocumentsView';
import { AuditLogsView } from './components/AuditLogsView';
import { DocModal } from './components/DocModal';
import { INITIAL_DOCUMENTS } from './data/corporateDocs';
import { RAGEngine } from './lib/ragEngine';
import { ChatMessage, DocumentMetadata, QueryAuditLog } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'documents' | 'logs'>('chat');
  const [documents, setDocuments] = useState<DocumentMetadata[]>(INITIAL_DOCUMENTS);
  const [selectedDoc, setSelectedDoc] = useState<DocumentMetadata | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [similarityScore, setSimilarityScore] = useState<number>(0.89);
  const [latencyMs, setLatencyMs] = useState<number>(1200);

  // RAG Engine instanciado
  const ragEngine = useMemo(() => new RAGEngine(documents), [documents]);

  // Mensagens pré-carregadas de demonstração e boas-vindas com o design Geometric Balance
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome-system',
      sender: 'system',
      text: 'Olá! Sou o Assistente Moura. Como posso te ajudar com as políticas internas hoje?',
      timestamp: '15:20'
    },
    {
      id: 'msg-demo-user',
      sender: 'user',
      text: 'Qual a política de férias e antecedência mínima?',
      timestamp: '15:21'
    },
    {
      id: 'msg-demo-ai',
      sender: 'ai',
      text: 'Com base na **Política de Férias (politica_de_ferias.md)**, o colaborador deve solicitar suas férias com antecedência mínima de 45 dias no sistema Moura Gente. As férias podem ser fracionadas em até 3 períodos (o primeiro não inferior a 14 dias e os demais não inferiores a 5 dias). O pagamento de férias e do terço constitucional é feito até 2 dias úteis antes do gozo.',
      sources: ['politica_de_ferias.md'],
      similarityScore: 0.94,
      latencyMs: 142.3,
      timestamp: '15:21'
    }
  ]);

  // Histórico de auditoria RAG
  const [auditLogs, setAuditLogs] = useState<QueryAuditLog[]>([
    {
      id: 'log-1',
      question: 'Qual a política de férias e antecedência mínima?',
      answer:
        'Com base na Política de Férias (politica_de_ferias.md), o colaborador deve solicitar suas férias com antecedência mínima de 45 dias no sistema Moura Gente...',
      sources: ['politica_de_ferias.md'],
      chunksRetrieved: 3,
      similarity: 0.94,
      latencyMs: 142.3,
      timestamp: '2026-08-30 15:21:04',
      model: 'gemini-3.7-flash'
    }
  ]);

  // Envio de nova dúvida corporativa
  const handleSendMessage = (query: string) => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: timeString
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    setTimeout(() => {
      const response = ragEngine.generateAnswer(query);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.answer,
        sources: response.sources,
        chunks: response.chunks,
        similarityScore: response.similarityScore,
        latencyMs: response.latencyMs,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      setSimilarityScore(response.similarityScore > 0 ? response.similarityScore : 0.89);
      setLatencyMs(response.latencyMs);

      // Registra no histórico de logs RAG
      const newLog: QueryAuditLog = {
        id: `log-${Date.now()}`,
        question: query,
        answer: response.answer,
        sources: response.sources,
        chunksRetrieved: response.chunks.length,
        similarity: response.similarityScore,
        latencyMs: response.latencyMs,
        timestamp: new Date().toLocaleString(),
        model: 'gemini-3.7-flash'
      };
      setAuditLogs(prev => [newLog, ...prev]);

      setIsLoading(false);
    }, 600);
  };

  // Limpar conversa
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

  // Selecionar documento pelo nome do arquivo (ex: vindo das fontes no chat)
  const handleSelectDocByName = (filename: string) => {
    const found = documents.find(d => d.filename === filename || filename.includes(d.filename));
    if (found) {
      setSelectedDoc(found);
    }
  };

  // Upload dinâmico de documento Markdown
  const handleUploadDoc = async (file: File) => {
    try {
      const text = await file.text();
      const filename = file.name;
      const title = text.split('\n')[0].replace(/^#+\s*/, '') || filename;
      const newDoc: DocumentMetadata = {
        id: `doc-${Date.now()}`,
        filename,
        title,
        category: 'Documento Adicionado',
        code: 'CORP-CUSTOM',
        version: '1.0',
        content: text,
        chunksCount: Math.ceil(text.length / 400),
        totalChars: text.length,
        updatedAt: new Date().toISOString().split('T')[0]
      };

      setDocuments(prev => [newDoc, ...prev]);
      ragEngine.indexDocuments([newDoc, ...documents]);

      // Mensagem de sistema notificando ingestão
      setMessages(prev => [
        ...prev,
        {
          id: `sys-upload-${Date.now()}`,
          sender: 'system',
          text: `Documento "${filename}" ingerido e indexado com sucesso no motor RAG (${newDoc.chunksCount} chunks gerados).`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error('Erro ao ler arquivo:', err);
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
      {/* Sidebar Esquerda (Geometric Balance Theme) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalDocuments={documents.length}
      />

      {/* Área Central Principal */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Header Corporativo */}
        <Header onClearChat={handleClearChat} activeTabTitle={getTabTitle()} />

        {/* Conteúdo Dinâmico com Barra Lateral Direita */}
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

          {/* Barra Lateral Direita (Base de Conhecimento e Métricas RAG) */}
          <KnowledgeBaseAside
            documents={documents}
            onSelectDoc={doc => setSelectedDoc(doc)}
            similarityScore={similarityScore}
            latencyMs={latencyMs}
            onUploadDoc={handleUploadDoc}
          />
        </div>
      </main>

      {/* Modal de Inspeção de Documento e Chunks */}
      <DocModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
    </div>
  );
}
