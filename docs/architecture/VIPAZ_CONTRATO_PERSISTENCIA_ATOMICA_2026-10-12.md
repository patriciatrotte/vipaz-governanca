# VIPAZ — contrato de persistência atômica (proposta, não aplicada)

Status: **especificação para revisão**. Não há migração SQL aplicada, alteração em produção ou escrita em dados de pilotos.

## Problema observado
O endpoint `POST /api/data/investigation-session` consulta o ciclo, grava `investigation_sessions` e, quando há interlocutor, grava `interview_participants` em chamadas REST distintas. Uma falha na última chamada deixa a sessão persistida sem o participante. O teste `tests/security/partial-write.test.ts` caracteriza esse comportamento atual; não demonstra atomicidade.

## Contrato proposto
1. Receber `cycleId` canônico, `sessionLegacyId` estável e, quando houver participante, `participantLegacyId` estável, além de dados necessários à sessão e ao participante.
2. Validar a identidade institucional e a autorização de escrita para o ciclo **no banco**, sem confiar somente na interface ou em consulta anterior.
3. Executar uma única transação PostgreSQL para criar/recuperar sessão e participante. Em qualquer falha, desfazer todas as alterações da transação.
4. Repetir a mesma requisição com os mesmos identificadores e conteúdo deve devolver os mesmos IDs, sem criar duplicatas; repetir identificadores com conteúdo incompatível deve produzir conflito explícito (409).
5. Retornar `session`, `participant` e um indicador confiável de criação ou reaproveitamento, sem incluir dados de outra instituição.
6. Não usar `service_role` em endpoint de usuário, nem `upsert merge-duplicates` que possa sobrescrever registros de terceiros.

## Pré-condições para implementação
- Confirmar colunas obrigatórias, chaves e restrições reais de `investigation_sessions` e `interview_participants`.
- Definir índice único de idempotência para participantes no escopo correto e avaliar colisões com registros existentes antes de migrar.
- Especificar a política RLS e as permissões de execução de uma função RPC transacional (`SECURITY INVOKER` preferencialmente; se `SECURITY DEFINER` for necessário, justificar e testar isolamento entre instituições).
- Definir quais papéis institucionais podem iniciar investigações. A concessão a ADMIN_VIPAZ não substitui essa decisão.
- Elaborar plano de reversão e migração sem apagar, reatribuir ou duplicar os cinco pilotos.

## Evidências de aceite necessárias
- Falha de criação de participante implica zero novos registros de sessão.
- Retry idêntico produz um único conjunto sessão/participante.
- Retry divergente retorna conflito sem sobrescrever dados.
- Usuário sem autenticação recebe 401; usuário sem autorização recebe 403.
- Usuário de outra instituição não consegue ler nem gravar no ciclo.
- Recarregamento e recuperação devolvem IDs canônicos e dados corretos.
- Cada teste registra execução, resultado e versão do código/SQL.

**Decisão:** não liberar persistência central para produção até cumprir esses critérios.
