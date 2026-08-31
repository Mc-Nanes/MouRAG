import { DocumentMetadata } from '../types';

export const INITIAL_DOCUMENTS: DocumentMetadata[] = [
  {
    id: 'doc-1',
    filename: 'politica_de_ferias.md',
    title: 'Diretriz Corporativa - Política de Férias do Grupo Moura',
    category: 'Recursos Humanos',
    code: 'RH-POL-014',
    version: '3.2',
    updatedAt: '2026-08-30',
    chunksCount: 8,
    totalChars: 3528,
    content: `# Diretriz Corporativa - Política de Férias do Grupo Moura
**Código:** RH-POL-014 | **Versão:** 3.2 | **Vigência:** 2026/2027  
**Público-alvo:** Todos os colaboradores (Plantas Industriais de Belo Jardim, Filiais Comerciais e Moura Tech)

---

## 1. Objetivo e Âmbito de Aplicação
Esta política estabelece os critérios, prazos e fluxos operacionais para programação, concessão e gozo de férias individuais e coletivas para todos os colaboradores do Grupo Moura, em conformidade com a Consolidação das Leis do Trabalho (CLT) e os acordos coletivos vigentes.

---

## 2. Aquisição do Direito a Férias
1. **Período Aquisitivo:** O colaborador adquire o direito a 30 (trinta) dias de férias a cada 12 meses de vigência do contrato de trabalho.
2. **Período Concessivo:** As férias devem ser usufruídas nos 12 meses subsequentes à conclusão do período aquisitivo. É expressamente vedado o acúmulo de dois períodos concessivos vencidos.

---

## 3. Regras para Fracionamento de Férias
Desde que haja concordância prévia entre o colaborador e a liderança imediata, as férias poderão ser usufruídas em até **3 (três) períodos**, observando rigorosamente as seguintes exigências:
- **Primeiro período:** Não poderá ser inferior a **14 (quatorze) dias corridos**;
- **Demais períodos:** Nenhum dos outros períodos poderá ser inferior a **5 (cinco) dias corridos**;
- **Início do gozo:** É vedado o início das férias no período de 2 (dois) dias que antecede feriados ou dias de repouso semanal remunerado (RSR) – portanto, para quem trabalha de segunda a sexta, as férias não devem iniciar em quintas ou sextas-feiras.

---

## 4. Abono Pecuniário ("Venda" de Férias)
- É facultado ao colaborador converter **1/3 (um terço)** do período de férias a que tiver direito em abono pecuniário (até 10 dias).
- A solicitação do abono pecuniário deve ser registrada no portal de autoatendimento do RH (**Moura Gente**) com no mínimo **30 (trinta) dias de antecedência** ao término do período aquisitivo correspondente.

---

## 5. Prazos e Fluxo de Solicitação
1. **Cronograma Anual:** No mês de outubro de cada ano, as lideranças devem consolidar a escala de férias de suas equipes para o ano seguinte.
2. **Registro de Solicitação:** A solicitação individual no sistema *Moura Gente* deve ocorrer com antecedência mínima de **45 (quarenta e cinco) dias** da data prevista para o início.
3. **Aprovação:** A liderança imediata tem até 5 dias úteis para aprovar ou solicitar ajustes.
4. **Aviso de Férias:** O RH emitirá o comunicado formal e o recibo com no mínimo **30 dias de antecedência** do início do gozo.
5. **Pagamento:** O pagamento da remuneração das férias e do adicional de 1/3 constitucional será creditado em conta bancária até **2 (dois) dias úteis antes** do início do respectivo período de gozo.

---

## 6. Férias Coletivas
- O Grupo Moura poderá determinar férias coletivas a todos os colaboradores de um setor, fábrica ou unidade comercial, especialmente durante manutenções programadas de fim de ano.
- As férias coletivas poderão ser gozadas em até 2 períodos anuais, desde que nenhum deles seja inferior a 10 dias corridos, com aviso prévio ao Ministério do Trabalho e sindicatos conforme legislação.

---

## 7. Contatos de Suporte
- **Central de Atendimento RH (Moura Gente):** ramal 4400 ou e-mail \`gente.gestao@moura.com.br\`
- **Horário de Atendimento:** Segunda a sexta-feira, das 08h00 às 17h30.`
  },
  {
    id: 'doc-2',
    filename: 'seguranca_da_informacao.md',
    title: 'Política de Segurança da Informação e Privacidade - Grupo Moura',
    category: 'Tecnologia da Informação & Moura Tech',
    code: 'TI-PSI-001',
    version: '4.0',
    updatedAt: '2026-08-30',
    chunksCount: 7,
    totalChars: 3392,
    content: `# Política de Segurança da Informação e Privacidade - Grupo Moura
**Código:** TI-PSI-001 | **Versão:** 4.0 | **Classificação:** Uso Interno  
**Responsável:** Diretoria de Tecnologia e Governança Digital (Moura Tech)

---

## 1. Princípios Gerais
A informação é um dos ativos mais valiosos do Grupo Moura. Todos os colaboradores, terceiros e parceiros devem zelar pela **Confidencialidade**, **Integridade** e **Disponibilidade** dos dados corporativos, sistemas industriais (SCADA/MES) e registros de clientes e fornecedores.

---

## 2. Gestão de Contas, Senhas e Autenticação
1. **Credenciais Individuais:** O acesso a computadores, estações fabris, sistemas SAP e plataformas de e-mail é estritamente pessoal e intransferível. É proibido o compartilhamento de logins.
2. **Padrão de Complexidade de Senhas:**
   - Tamanho mínimo de **12 caracteres**;
   - Obrigatoriedade de conter letras maiúsculas, minúsculas, números e caracteres especiais (\`!@#$%&*\`);
   - Expiração obrigatória a cada **90 dias**;
   - Histórico de restrição: não é permitido reutilizar as últimas 6 senhas cadastradas.
3. **Autenticação em Dois Fatores (MFA):** O uso de MFA via aplicativo autenticador corporativo (Microsoft Authenticator) é mandatório para todos os acessos remotos (VPN) e serviços de nuvem (Google Workspace, Microsoft 365, Jira, SAP).

---

## 3. Uso de Dispositivos e Política de Mesa Limpa
- **Bloqueio Automático:** Estações de trabalho devem ser configuradas para bloqueio de tela automático após **5 minutos de inatividade**.
- **Bloqueio Manual:** Ao se ausentar da mesa de trabalho, mesmo que por breves instantes, o colaborador deve pressionar \`Windows + L\` ou bloquear a sessão.
- **Mesa Limpa:** Documentos impressos que contenham dados confidenciais ou dados pessoais de colaboradores/clientes não devem permanecer sobre mesas ou impressoras desacompanhados. Ao final do expediente, devem ser guardados em gavetas trancadas.

---

## 4. Classificação da Informação
Os dados do Grupo Moura dividem-se em quatro níveis de confidencialidade:
- **Pública:** Informações divulgadas no site institucional e relatórios de sustentabilidade.
- **Interna:** Comunicados gerais, manuais de procedimentos e ramais telefônicos.
- **Confidencial:** Fórmulas de ligas de chumbo, designs de células de baterias, relatórios financeiros e dados de clientes (B2B/Montadoras).
- **Restrita:** Dados estratégicos de M&A, dados de remuneração executiva e dados pessoais sensíveis (LGPD).

---

## 5. Uso Aceitável de Inteligência Artificial e Ferramentas Externas
- É terminantemente proibido colar códigos-fonte proprietários, dados de projetos industriais, dados financeiros ou dados protegidos pela LGPD em ferramentas públicas de IA Generativa não homologadas pela TI corporativa.
- O uso de assistentes de IA internos homologados (como o *Assistente Inteligente Corporativo Moura*) é incentivado para consulta a normativos institucionais.

---

## 6. Notificação de Incidentes de Segurança e Phishing
Qualquer suspeita de e-mail malicioso (phishing), perda de notebook corporativo, vazamento de credenciais ou anomalia operacional deve ser reportada imediatamente:
- **Canal de Incidentes SOC Moura:** \`soc@moura.com.br\` ou ramal de emergência **5555**.
- **Canal do DPO / Encarregado LGPD:** \`privacidade@moura.com.br\`.`
  },
  {
    id: 'doc-3',
    filename: 'faq_beneficios.md',
    title: 'Guia de Benefícios Corporativos - FAQ Grupo Moura',
    category: 'Recursos Humanos & Benefícios',
    code: 'RH-BEN-008',
    version: '2026',
    updatedAt: '2026-08-30',
    chunksCount: 6,
    totalChars: 3581,
    content: `# Guia de Benefícios Corporativos - FAQ Grupo Moura
**Código:** RH-BEN-008 | **Ano de Referência:** 2026  
**Responsável:** Gerência Executiva de Pessoas e Cultura

---

## 1. Plano de Saúde e Odontológico
**P: Qual é a operadora do plano de saúde e como funciona a coparticipação?**  
R: O Grupo Moura oferece plano de saúde da operadora Bradesco Saúde / Unimed Nacional (conforme a localidade da filial/fábrica). A cobertura é ambulatorial e hospitalar com acomodação em enfermaria (padrão operacional) ou apartamento (cargos de liderança e especialistas). A coparticipação em consultas e exames simples é de 20%, limitada ao teto de R$ 45,00 por procedimento.

**P: Posso incluir dependentes no plano de saúde?**  
R: Sim. São considerados dependentes legais: cônjuge ou companheiro(a) em união estável e filhos solteiros até 21 anos (ou até 24 anos se comprovadamente matriculados em curso superior). A inclusão deve ser solicitada no prazo de até 30 dias após a admissão ou ocorrência do fato gerador (casamento, nascimento).

---

## 2. Vale Refeição (VR) e Vale Alimentação (VA)
**P: Como funciona o cartão de alimentação/refeição?**  
R: Os colaboradores recebem cartão flexível (Flash / Sodexo).
- **Para unidades industriais (Belo Jardim):** Alimentação fornecida no restaurante próprio da empresa para o turno de trabalho + crédito mensal de VA no valor de R$ 680,00.
- **Para escritórios corporativos e unidades comerciais:** Cartão com valor diário de R$ 42,00 por dia útil trabalhado (VR) mais crédito fixo de VA de R$ 550,00.
- O benefício é recarregado no primeiro dia útil de cada mês.

---

## 3. Programa de Participação nos Lucros e Resultados (PPR)
**P: Como é calculado e pago o PPR Moura?**  
R: O PPR é atrelado a metas corporativas globais (EBITDA, produção de acumuladores e índice de qualidade PPM) e metas departamentais da equipe.
- **Periodicidade de pagamento:** Dividido em duas parcelas anuais. A 1ª parcela de adiantamento ocorre no mês de **agosto** e a 2ª parcela de apuração final ocorre no mês de **fevereiro** do ano subsequente.
- Colaboradores admitidos durante o ano fiscal recebem o benefício proporcional aos meses trabalhados (fração igual ou superior a 15 dias trabalhados no mês conta como mês integral).

---

## 4. Auxílio Educação e Idiomas (Programa Crescer Moura)
**P: A empresa subsidia cursos de graduação, pós-graduação ou inglês?**  
R: Sim, através do programa *Crescer Moura*:
- **Graduação e Pós-graduação:** Reembolso de até 60% do valor da mensalidade (limitado a R$ 850,00/mês), condicionado à aderência do curso com a função exercida e avaliação de desempenho semestral positiva.
- **Plataforma de Idiomas:** Licença gratuita ilimitada de inglês/espanhol para colaboradores elegíveis na plataforma corporativa *Voxy / EF English Live*.

---

## 5. Bem-estar, Academia e Seguro de Vida
**P: Há convênio com academias ou auxílio esporte?**  
R: Todos os colaboradores ativos têm direito à assinatura do **TotalPass / Gympass (Wellhub)** no plano Silver subsidiado em 50% pela Moura, extensível a até 2 dependentes legais.
**P: O seguro de vida é gratuito?**  
R: Sim, o seguro de vida em grupo Tokio Marine é 100% custeado pela empresa, cobrindo morte acidental, invalidez por acidente e assistência funeral 24h para o titular e cônjuge.

---

## 6. Dúvidas e Inclusões
- Acesse o portal *Moura Gente* -> Menu "Meus Benefícios".
- E-mail direto: \`beneficios@moura.com.br\` | WhatsApp RH: (81) 98123-4400.`
  },
  {
    id: 'doc-4',
    filename: 'solicitacao_de_acessos.md',
    title: 'Procedimento Operacional - Solicitação e Gestão de Acessos a Sistemas',
    category: 'Tecnologia da Informação & IAM',
    code: 'TI-PRO-022',
    version: '2.8',
    updatedAt: '2026-08-30',
    chunksCount: 8,
    totalChars: 3230,
    content: `# Procedimento Operacional - Solicitação e Gestão de Acessos a Sistemas
**Código:** TI-PRO-022 | **Versão:** 2.8 | **Vigência:** 2026/2027  
**Área Gestora:** Service Desk e Governança de Identidades (IAM Moura)

---

## 1. Finalidade do Processo
Padronizar as solicitações, aprovações, revisões e revogações de perfis de acesso a sistemas de informação, redes locais, bancos de dados, ERP SAP S/4HANA, Salesforce CRM, ambientes fabris MES e pastas de rede corporativas.

---

## 2. Princípio do Privilégio Mínimo (Least Privilege)
Todo colaborador ou terceiro receberá apenas as permissões estritamente necessárias para o desempenho de suas atividades contratuais. Acessos elevados (administrador local, acesso de banco direto, transações financeiras críticas) requerem justificativa técnica formal e aprovação da Gerência Executiva de Segurança da Informação.

---

## 3. Fluxo de Solicitação de Novo Acesso ou Alteração de Perfil
1. **Canal Oficial:** Todas as solicitações devem ser abertas exclusivamente pelo portal de autoatendimento ITSM (*Moura Service Desk* - \`servicedesk.moura.com.br\`).
2. **Preenchimento Obrigatório:**
   - Nome completo e matrícula do beneficiário;
   - Unidade / Setor de atuação;
   - Sistema desejado (ex: SAP Módulo MM/FI/PP, Salesforce, VPN, Pastas Compartilhadas);
   - Perfil de acesso solicitado (ou espelho de usuário similar de mesma função);
   - Justificativa clara de negócio.
3. **Alçada de Aprovação:**
   - Acessos padrão: Aprovação obrigatória do Gestor Imediato (Gerente ou Coordenador).
   - Acessos críticos (financeiro, fiscal, folha de pagamento, chaves de API): Aprovação do Gestor Imediato + Dono do Sistema (Business Owner) + Governança de Segurança (SOC).
4. **Prazo de Atendimento (SLA):**
   - Acessos padrão: até **24 horas úteis** após aprovação.
   - Acessos a perfis complexos ou integrações especiais: até **48 horas úteis**.

---

## 4. Processo de Onboarding (Novos Colaboradores)
- Ao cadastrar a admissão no sistema *Moura Gente*, o RH gera automaticamente o ticket de integração com 5 dias úteis de antecedência do primeiro dia de trabalho.
- O colaborador recebe automaticamente o "Kit Básico Digital Moura": e-mail institucional \`@moura.com.br\`, acesso ao Google Workspace / MS Teams, portal do colaborador e rede Wi-Fi corporativa.

---

## 5. Processo de Offboarding (Desligamento)
- Em casos de rescisão contratual, o RH dispara notificação automática de prioridade máxima ao time de TI/IAM.
- Todos os acessos lógicos e VPNs são revogados em até **1 (uma) hora** após o comunicado de desligamento oficial.
- Notebooks e crachás físicos com chip RFID devem ser devolvidos à recepção da unidade no ato do desligamento.

---

## 6. Revisão Periódica de Acessos (User Access Review)
- Trimestralmente, cada liderança departamental recebe a lista consolidada de usuários ativos e seus respectivos perfis para validação e auditoria. Perfis não revalidados em 10 dias corridos são suspensos preventivamente.

---

## 7. Contato e Chamados Urgentes
- Portal Web: \`servicedesk.moura.com.br\`
- Central Telefônica 24x7: Ramal 2000 ou 0800-701-4400 (Opção 2 - TI)`
  },
  {
    id: 'doc-5',
    filename: 'politica_de_viagens_e_reembolso.md',
    title: 'Política Corporativa de Viagens e Reembolso de Despesas',
    category: 'Controladoria & Finanças',
    code: 'FIN-POL-005',
    version: '3.0',
    updatedAt: '2026-08-30',
    chunksCount: 8,
    totalChars: 3400,
    content: `# Política Corporativa de Viagens e Reembolso de Despesas
**Código:** FIN-POL-005 | **Versão:** 3.0 | **Vigência:** 2026/2027  
**Responsável:** Controladoria e Diretoria Financeira

---

## 1. Objetivo
Regulamentar os procedimentos para viagens a trabalho (nacionais e internacionais) a serviço do Grupo Moura, assegurando o conforto e a segurança dos colaboradores, bem como a transparência, conformidade fiscal e otimização dos custos corporativos.

---

## 2. Solicitação e Aprovação de Viagem
1. **Antecedência Mínima:**
   - **Viagens Nacionais (Aéreas):** A solicitação deve ser registrada na plataforma de viagens corporativas (*Moura Travel*) com no mínimo **14 (quatorze) dias de antecedência**.
   - **Viagens Internacionais:** Mínimo de **30 (trinta) dias de antecedência**.
   - Viagens em caráter emergencial (chamados de parada de fábrica ou suporte crítico a cliente montadora) dispensam a antecedência mínima, mediante autorização do Diretor da área.
2. **Alçada de Aprovação:** Gestor imediato para viagens nacionais; Diretor de Unidade de Negócio e CFO para viagens internacionais.

---

## 3. Passagens Aéreas e Hospedagem
- **Passagens:** Sempre na classe econômica padrão. O sistema selecionará automaticamente a tarifa mais econômica disponível com janela de até 2 horas de tolerância em relação ao horário solicitado.
- **Hospedagem:** Hotéis credenciados da rede conveniada (padrão 3 a 4 estrelas executivo com café da manhã incluso). 
  - Limite diário para capitais (SP, RJ, Recife, Brasília, Curitiba): até R$ 420,00 por diária.
  - Demais cidades do interior: até R$ 280,00 por diária.
- Despesas pessoais no hotel (frigobar com bebidas alcoólicas, lavanderia para estadias inferiores a 5 dias, filmes pay-per-view) não são reembolsáveis.

---

## 4. Despesas com Alimentação e Locomoção Urbana
1. **Teto de Alimentação (Almoço / Jantar por dia sem diária pré-fixada):**
   - Capitais e grandes centros: até R$ 110,00 por dia (almoço + jantar).
   - Interior e cidades de médio porte: até R$ 85,00 por dia.
   - É estritamente vedado o reembolso de bebidas alcoólicas.
2. **Deslocamento:**
   - Preferência pelo uso de aplicativos corporativos homologados (Uber Business / 99 Empresas faturados diretamente para a conta corporativa).
   - Uso de veículo próprio: Reembolso por quilometragem rodada (KM rodado) no valor fixo de **R$ 1,45 por km**, cobrindo combustível, desgaste do veículo e depreciação. O trajeto deve ser comprovado via relatório do Google Maps.

---

## 5. Prestação de Contas e Prazos de Reembolso
1. **Envio de Relatório de Despesas (RD):** O colaborador deve submeter a prestação de contas no sistema *Moura Travel / SAP Concur* em até **5 (cinco) dias úteis** após o retorno da viagem.
2. **Comprovantes Válidos:** Somente serão aceitas Notas Fiscais Eletrônicas (NFC-e / NF-e) ou Cupom Fiscal com discriminação detalhada dos itens e CNPJ do estabelecimento. Comprovantes de cartão de débito/crédito (filipeta da máquina) sem nota fiscal não são válidos perante a Receita Federal.
3. **Pagamento:** Após aprovação do relatório pela Controladoria, o valor é depositado na folha de pagamento ou creditado em conta corrente em até 7 dias úteis.

---

## 6. Dúvidas e Atendimento
- E-mail: \`viagens.corporativas@moura.com.br\` | Ramal: 3320.`
  },
  {
    id: 'doc-6',
    filename: 'normas_de_seguranca_do_trabalho.md',
    title: 'Manual de Normas de Segurança do Trabalho e Saúde Ocupacional',
    category: 'Saúde & Segurança Ocupacional (SESMT)',
    code: 'SESMT-MAN-003',
    version: '5.1',
    updatedAt: '2026-08-30',
    chunksCount: 8,
    totalChars: 3859,
    content: `# Manual de Normas de Segurança do Trabalho e Saúde Ocupacional
**Código:** SESMT-MAN-003 | **Versão:** 5.1 | **Ano:** 2026  
**Área Gestora:** Engenharia de Segurança, Medicina do Trabalho e Meio Ambiente (SESMT)

---

## 1. Compromisso com a Vida e Tolerância Zero a Riscos
No Grupo Moura, a segurança das pessoas é o valor inegociável número um. Todo colaborador tem o dever e o direito de interromper imediatamente qualquer atividade que ofereça risco iminente à sua integridade física ou à de seus colegas (**Direito de Recusa**).

---

## 2. Equipamentos de Proteção Individual (EPI) e Coletiva (EPC)
1. **Obrigatoriedade de EPIs por Área:**
   - **Áreas Industriais e Linhas de Montagem de Baterias:** Uso contínuo de óculos de segurança com proteção lateral, calçado de segurança com biqueira de composite/aço, protetor auricular tipo plug ou concha e uniforme antichamas/antiácido 100% algodão.
   - **Áreas de Fundição e Óxido de Chumbo:** Uso mandatório de máscara respiratória com filtro P3/Vapores Ácidos, luvas de borracha nitrílica de cano longo e avental de PVC reforçado.
   - **Áreas de Logística e Armazéns de Baterias Carregadas:** Bota de proteção, colete refletivo de alta visibilidade e capacete de segurança em áreas de movimentação de empilhadeiras.
2. **Substituição de EPIs:** Qualquer EPI danificado ou saturado deve ser trocado imediatamente no almoxarifado de segurança do SESMT sem qualquer custo ao colaborador.

---

## 3. Regras de Ouro de Segurança Moura
1. **Bloqueio e Etiquetagem (LOTO - Lockout/Tagout):** Nunca realize manutenção em máquinas, pontes rolantes ou painéis elétricos sem aplicar o cadeado de bloqueio e a etiqueta de identificação individual no ponto de energia zero.
2. **Trabalho em Altura (NR-35):** Qualquer atividade acima de 2,00 metros requer Permissão de Trabalho (PT), Análise Preliminar de Risco (APR) e uso de cinto tipo paraquedista conectado a linha de vida inspecionada.
3. **Espaço Confinado (NR-33):** Entrada em tanques de diluição de eletrólito ou moinhos somente com vigia dedicado, medição contínua de gases e autorização expressa do SESMT.
4. **Circulação Segura e Empilhadeiras:** Respeite rigorosamente as faixas de pedestres demarcadas em amarelo e a velocidade máxima de 10 km/h para veículos industriais no pátio. Uso de celular caminhando pelas fábricas é expressamente proibido.

---

## 4. Prevenção ao Contato com Chumbo e Monitoramento Biológico
- **Higiene Pessoal:** É proibido comer, beber ou fumar em qualquer área operacional da fábrica. A alimentação deve ocorrer estritamente nos refeitórios após lavagem completa de mãos e rosto e troca do vestuário operacional.
- **Exames Periódicos de Plumbemia (Chumbo no Sangue):** Todos os colaboradores das áreas operacionais realizam dosagem semestral de plumbemia. Valores de referência seguem rigorosamente a NR-7 e padrões internacionais da OMS. Colaboradores com índices em elevação são temporariamente remanejados para setores administrativos.

---

## 5. Procedimentos em Caso de Acidentes e Emergências
1. **Primeiros Socorros:** Acione o ramal de emergência **192** (Ambulatório Médico Central Moura) ou informe o brigadista mais próximo.
2. **Chuveiros de Emergência e Lava-Olhos:** Em caso de contato acidental com ácido sulfúrico / eletrólito, utilize o lava-olhos/chuveiro de emergência mais próximo lavando a região afetada por no mínimo 15 minutos contínuos.
3. **Comunicação:** Qualquer incidente, mesmo sem afastamento (quase-acidente), deve ser registrado no portal *Moura Gente - Módulo Segurança* em até 24 horas.

---

## 6. Canais do SESMT
- **Ambulatório Médico 24h (Belo Jardim):** Ramal 1920 / Ramal 192
- **Engenharia de Segurança:** \`seguranca.trabalho@moura.com.br\` | Ramal 4100.`
  }
];
