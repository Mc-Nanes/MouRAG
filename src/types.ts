export interface DocumentMetadata {
  id: string;
  filename: string;
  title: string;
  category: string;
  code: string;
  version: string;
  content: string;
  chunksCount: number;
  totalChars: number;
  updatedAt: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  filename: string;
  sectionTitle: string;
  content: string;
  chunkIndex: number;
  score?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'system' | 'user' | 'ai';
  text: string;
  timestamp: string;
  sources?: string[];
  chunks?: DocumentChunk[];
  similarityScore?: number;
  latencyMs?: number;
}

export interface QueryAuditLog {
  id: string;
  question: string;
  answer: string;
  sources: string[];
  chunksRetrieved: number;
  similarity: number;
  latencyMs: number;
  timestamp: string;
  model: string;
}

export interface RAGStats {
  totalDocuments: number;
  totalChunks: number;
  avgSimilarity: number;
  lastLatencyMs: number;
  totalQueries: number;
}
