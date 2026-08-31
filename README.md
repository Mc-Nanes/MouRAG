# 🔋 Assistente Inteligente Corporativo - Grupo Moura (RAG System)

Sistema corporativo de **Perguntas e Respostas baseado em RAG (Retrieval-Augmented Generation)** desenvolvido em **Python** e **FastAPI**, com persistência relacional em **SQLite/SQLAlchemy** e integração com modelos de **IA Generativa (Google Gemini API)**.

O assistente permite que colaboradores do Grupo Moura tirem dúvidas sobre normas internas, políticas de Recursos Humanos, diretrizes de Saúde e Segurança do Trabalho (SESMT), Segurança da Informação, Viagens/Reembolsos e Benefícios com respostas fundamentadas e com citação explícita dos documentos fonte.

---

## 🏛️ Arquitetura do Sistema e Fluxo RAG

```
                                  [ Documentos Markdown em data/ ]
                                                 │
                                                 ▼
                                     [ ingestion.py (Chunking) ]
                                                 │
                                                 ▼
                                     [ Banco SQL: moura_rag.db ]
                                     (Tabelas: documents, chunks)
                                                 │
[ Pergunta do Usuário ] ──► [ POST /ask ] ───────┤
                                                 ▼
                                     [ retriever.py (BM25 + Ranking) ]
                                                 │
                                                 ▼
                                    (Top-K Trechos Relevantes)
                                                 │
                                                 ▼
                              [ llm_service.py (Prompt Restritivo RAG) ]
                                                 │
                                                 ▼
                                      [ Google Gemini API ]
                                                 │
                                                 ▼
                                 [ Resposta Estruturada + Fontes ]
                                                 │
                                                 ▼
                                   [ Registro em QueryHistory ]
```

### Principais Decisões Arquiteturais

1. **Estratégia de Chunking Inteligente (`ingestion.py`):**
   - Fragmentação por seções semânticas (`#`, `##`, `###`) e parágrafos coerentes.
   - Janela de tamanho alvo entre **300 e 500 caracteres**, com sobreposição controlada (*chunk overlap* de 50 caracteres) para preservar o contexto nas transições de ideias.
   - Remoção de ruídos (como divisores horizontais vazios) para maximizar a densidade informacional de cada bloco.

2. **Mecanismo de Recuperação de Alta Precisão (`retriever.py`):**
   - Algoritmo de busca por relevância baseado em **Okapi BM25** com normalização de texto em português, remoção de stopwords e pontuação.
   - Ponderação com reforço (*boosting*) para termos presentes nos títulos dos documentos e cabeçalhos de seções.
   - Retorno estruturado com metadados completos (arquivo fonte, título do documento, seção e score de relevância).

3. **Prompt Restritivo de RAG (*Grounding Estrito* - `llm_service.py`):**
   - O prompt do sistema impõe regras claras contra alucinações: a IA só responde utilizando estritamente os trechos corporativos injetados.
   - Citação obrigatória dos arquivos de origem (ex: `politica_de_ferias.md`).
   - Resposta padrão obrigatória quando a informação não estiver no contexto: *"Informação não encontrada nos documentos corporativos."*

4. **Persistência SQL Estruturada (`models.py` & `database.py`):**
   - **`documents`**: Metadados do documento fonte (título, categoria, nome do arquivo, hash de conteúdo).
   - **`document_chunks`**: Fragmentos de texto indexados vinculados via chave estrangeira.
   - **`query_history`**: Auditoria e histórico completo de todas as perguntas, respostas geradas, fontes consultadas, modelo e tempo de resposta (latência).

---

## 📁 Estrutura de Diretórios

```
├── data/                                 # Base de conhecimento documental (Markdown)
│   ├── politica_de_ferias.md             # RH: Diretrizes e prazos de férias
│   ├── seguranca_da_informacao.md        # TI: Senhas, VPN, sigilo e LGPD
│   ├── faq_beneficios.md                 # RH: Plano de saúde, VR, Gympass, PPR
│   ├── solicitacao_de_acessos.md         # TI: ERP SAP, perfis e aprovações
│   ├── politica_de_viagens_e_reembolso.md# Finanças: Diárias, hotéis e km rodado
│   └── normas_de_seguranca_do_trabalho.md# SESMT: EPIs, chumbo, CIPA e emergências
├── database.py                           # Conexão e gerenciamento de sessões SQLAlchemy
├── models.py                             # Modelos ORM (Document, DocumentChunk, QueryHistory)
├── schemas.py                            # Schemas de validação de entrada/saída Pydantic V2
├── ingestion.py                          # Pipeline de leitura, chunking e indexação no banco
├── retriever.py                          # Mecanismo de busca e relevância lexical/vetorial
├── llm_service.py                        # Serviço de integração com Google Gemini API e Prompt RAG
├── routes/                               # Rotas modulares da API FastAPI
│   ├── health.py                         # Endpoint GET /health
│   ├── documents.py                      # Endpoints GET /documents, GET /documents/{id}, POST /ingest
│   └── ask.py                            # Endpoints POST /ask e GET /history
├── tests/                                # Bateria completa de testes automatizados (Pytest)
│   ├── test_database.py                  # Testes dos modelos e persistência SQL
│   ├── test_ingestion.py                 # Testes de chunking e extração de metadados
│   ├── test_retriever.py                 # Testes de relevância e busca de trechos
│   ├── test_llm_service.py               # Testes de prompting e geração RAG
│   └── test_api.py                       # Testes de integração dos endpoints FastAPI
├── main.py                               # Ponto de entrada FastAPI e Swagger OpenAPI
├── requirements.txt                      # Dependências do projeto Python
└── README.md                             # Documentação técnica completa
```

---

## 🚀 Instalação e Execução

### 1. Pré-requisitos
- **Python 3.10+** (recomendado Python 3.11)
- Git

### 2. Instalação das Dependências

Crie um ambiente virtual (opcional) e instale os pacotes necessários:

```bash
# Criar e ativar ambiente virtual (Linux/macOS)
python3 -m venv venv
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

### 3. Configuração de Variáveis de Ambiente

Crie o arquivo `.env` a partir do `.env.example`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com a sua chave de API:
```env
GEMINI_API_KEY=sua_chave_gemini_aqui
DATABASE_URL=sqlite:///./moura_rag.db
PORT=8000
```

> 💡 *Nota:* Se nenhuma chave for configurada ou em modo offline/testes, o sistema utiliza o sintetizador determinístico de RAG integrado, garantindo 100% de disponibilidade.

### 4. Executar Ingestão de Documentos

Para popular ou atualizar a base de dados com os arquivos da pasta `data/`:

```bash
python3 ingestion.py
```

### 5. Iniciar o Servidor FastAPI

Execute a aplicação com o Uvicorn:

```bash
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

A documentação interativa Swagger UI estará disponível em: **`http://localhost:8000/docs`** e ReDoc em **`http://localhost:8000/redoc`**.

### 6. Executar o Frontend (React/Vite)

No diretório raiz do projeto, instale as dependências do frontend e inicie o ambiente de desenvolvimento:

```bash
npm install
npm run dev -- --host
```

O frontend será servido em:

- `http://localhost:3000` (se disponível)
- ou `http://localhost:3001` se a porta 3000 estiver ocupada

> 💡 O frontend faz requisições para a API FastAPI em `http://localhost:8000`, então o backend precisa estar rodando antes de usar o chat.

---

## 🧪 Execução de Testes Automatizados

O projeto conta com uma suíte de 19 testes automatizados com cobertura completa de banco de dados, chunking, recuperação e endpoints HTTP:

```bash
# Executar todos os testes com Pytest
TESTING=1 pytest -v
```

---

## 📡 Exemplos de Requisições (cURL)

### 1. Verificação de Saúde do Sistema (`GET /health`)

```bash
curl -X GET "http://localhost:8000/health" \
  -H "Accept: application/json"
```

**Resposta:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "service": "Assistente Inteligente Corporativo - Grupo Moura",
  "database": "connected",
  "total_documents": 6,
  "total_chunks": 55
}
```

---

### 2. Listagem de Documentos Corporativos (`GET /documents`)

```bash
curl -X GET "http://localhost:8000/documents" \
  -H "Accept: application/json"
```

**Resposta:**
```json
{
  "total": 6,
  "documents": [
    {
      "id": 1,
      "title": "Diretriz Corporativa - Política de Férias do Grupo Moura",
      "filename": "politica_de_ferias.md",
      "category": "Recursos Humanos",
      "total_chunks": 9,
      "created_at": "2026-08-30T22:21:40.781878"
    },
    {
      "id": 2,
      "title": "Manual de Normas de Segurança do Trabalho e Saúde Ocupacional",
      "filename": "normas_de_seguranca_do_trabalho.md",
      "category": "Saúde & Segurança Ocupacional (SESMT)",
      "total_chunks": 9,
      "created_at": "2026-08-30T22:21:40.783452"
    }
  ]
}
```

---

### 3. Consulta ao Assistente RAG (`POST /ask`)

#### Exemplo A: Dúvida sobre Política de Férias
```bash
curl -X POST "http://localhost:8000/ask" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Como posso dividir minhas férias e qual a antecedência para solicitar?"
  }'
```

**Resposta:**
```json
{
  "question": "Como posso dividir minhas férias e qual a antecedência para solicitar?",
  "answer": "Conforme a **Política de Férias do Grupo Moura (`politica_de_ferias.md`)**, as férias podem ser fracionadas em até 3 períodos, desde que um não seja inferior a 14 dias e nenhum inferior a 5 dias. A solicitação deve ser feita com no mínimo 60 dias de antecedência no Portal RH.",
  "sources": [
    "politica_de_ferias.md"
  ],
  "retrieved_chunks_count": 2,
  "model_used": "gemini-3.6-flash",
  "latency_ms": 142.3,
  "query_id": 1,
  "timestamp": "2026-08-30T22:30:00.123456"
}
```

#### Exemplo B: Dúvida sobre Reembolso de KM
```bash
curl -X POST "http://localhost:8000/ask" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Qual é o valor do reembolso por quilômetro rodado com carro particular?"
  }'
```

**Resposta:**
```json
{
  "question": "Qual é o valor do reembolso por quilômetro rodado com carro particular?",
  "answer": "De acordo com a **Política de Viagens e Reembolso (`politica_de_viagens_e_reembolso.md`)**, o reembolso por uso de veículo próprio é fixado em **R$ 1,45 por km rodado**, cobrindo combustível, manutenção e depreciação.",
  "sources": [
    "politica_de_viagens_e_reembolso.md"
  ],
  "retrieved_chunks_count": 2,
  "model_used": "gemini-3.6-flash",
  "latency_ms": 115.8,
  "query_id": 2,
  "timestamp": "2026-08-30T22:31:12.456789"
}
```

#### Exemplo C: Pergunta Fora do Contexto (Anti-Alucinação)
```bash
curl -X POST "http://localhost:8000/ask" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Qual a receita oficial do bolo de chocolate da diretoria?"
  }'
```

**Resposta:**
```json
{
  "question": "Qual a receita oficial do bolo de chocolate da diretoria?",
  "answer": "Informação não encontrada nos documentos corporativos.",
  "sources": [],
  "retrieved_chunks_count": 0,
  "model_used": "gemini-3.6-flash",
  "latency_ms": 25.1,
  "query_id": 3,
  "timestamp": "2026-08-30T22:32:05.987654"
}
```

---

### 4. Histórico de Consultas (`GET /history`)

```bash
curl -X GET "http://localhost:8000/history?limit=10" \
  -H "Accept: application/json"
```

---

## 🛡️ Segurança e Boas Práticas
- **Auditoria Completa:** Todas as perguntas, respostas e latências são registradas de forma persistente para governança e monitoramento de conformidade.
