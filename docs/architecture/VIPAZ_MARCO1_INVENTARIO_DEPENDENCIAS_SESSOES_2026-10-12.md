# VIPAZ — Dependências encontradas na auditoria de participantes e sessões
Data: 2026-10-12. Estado: **levantamento preliminar por leitura do código; sem homologação**.

## Consumo e exposição
- `api/data/reconcile-participant.ts`: lê `interview_participants` incluindo `metadata.confirmation_note` e `confirmed_by`. Verificação ADMIN_VIPAZ adicionada no endpoint, mas a política RLS da tabela permanece mais ampla.
- `api/data/confirm-participant.ts`: chama RPC `vipaz_confirm_investigation_participant` e devolve objeto completo de participante com `metadata`. A RPC DRAFT é ADMIN_VIPAZ.
- `supabase/migrations/20261012_vipaz_confirm_participant_DRAFT.sql`: guarda justificativa e identificador do confirmador em `interview_participants.metadata`. Segregação futura exige alteração coordenada de RPC e recuperação.
- `src/components/ConfirmParticipantPanel.tsx`: compara nome, função, nota e confirmador ao reconciliar operação pendente; não pode perder esse comportamento sem contrato substituto.

## Outro risco identificado durante o inventário
`api/data/interview-record.ts` consulta sessões de um ciclo ordenadas por criação com `limit=1`, escolhe a primeira ou cria uma sessão quando nenhuma aparece. Isso é incompatível com a decisão recente de não selecionar arbitrariamente uma sessão entre várias. Também grava perguntas e respostas em chamadas REST separadas, sujeitas a escrita parcial em falhas intermediárias.

**Decisão provisória:** não declarar o fluxo completo de investigação homologado com base apenas nos testes de abertura de ciclo e confirmação. É necessário especificar sessão explícita na gravação de respostas e avaliar atomicidade/recuperação de pergunta + resposta antes da homologação integrada.

## Próximo passo técnico
Definir contrato `sessionId` canônico no endpoint de registro, rejeitar ausência/ambiguidade sem criar sessão implicitamente, verificar acesso com JWT/RLS e adicionar testes de integração e falhas parciais. Não modificar o Supabase real nem os cinco pilotos.
