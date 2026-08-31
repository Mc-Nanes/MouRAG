# Procedimento Operacional - Solicitação e Gestão de Acessos a Sistemas
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
1. **Canal Oficial:** Todas as solicitações devem ser abertas exclusivamente pelo portal de autoatendimento ITSM (*Moura Service Desk* - `servicedesk.moura.com.br`).
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
- O colaborador recebe automaticamente o "Kit Básico Digital Moura": e-mail institucional `@moura.com.br`, acesso ao Google Workspace / MS Teams, portal do colaborador e rede Wi-Fi corporativa.

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
- Portal Web: `servicedesk.moura.com.br`
- Central Telefônica 24x7: Ramal 2000 ou 0800-701-4400 (Opção 2 - TI)
