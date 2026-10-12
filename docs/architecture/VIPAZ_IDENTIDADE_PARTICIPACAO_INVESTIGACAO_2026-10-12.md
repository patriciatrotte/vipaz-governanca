# VIPAZ — Identidade de pessoa versus registro de participação
Data: 2026-10-12. Status: **proposta de arquitetura, não decisão homologada**.

## Evidências verificadas no Supabase (leitura)
- `interview_participants` possui `id uuid` como chave primária, `legacy_id text` opcional, `session_id uuid` obrigatório com FK para `investigation_sessions`, e campos de nome/papel/departamento/tipo.
- `responses.participant_id` é FK para `interview_participants.id`, ligando respostas ao registro de participante.
- Não foi identificado campo `person_id` nas colunas públicas examinadas; **não está demonstrada** a existência de uma entidade canônica de pessoa no modelo de investigação.
- `interview_participants.legacy_id` não possui UNIQUE; a consulta agregada de preflight encontrou 6 IDs não nulos e 0 grupos duplicados.
- `investigation_sessions.legacy_id` e `responses.legacy_id` possuem UNIQUE.
- O teste CI #67 passou: a RPC DRAFT rejeita reutilização de `legacy_id` de participante em sessão distinta e mantém atomicidade. Isso testa o contrato da função proposta, não a regra de negócio definitiva.

## Distinções propostas
1. **Pessoa**: identidade humana potencialmente persistente e transversal a sessões. Não presumir que nome, e-mail ou cargo sejam identificadores únicos; não criar cadastro transversal sem justificativa de finalidade, minimização e autorização.
2. **Participação**: vínculo contextual de um respondente/interlocutor com uma sessão de investigação. O `interview_participants.id` atual identifica esse registro contextual.
3. **Resposta**: contribuição ligada à participação via `responses.participant_id`; não implica, por si, cadastro permanente de pessoa.

## Decisão pendente
Definir o significado e o domínio de unicidade de `interview_participants.legacy_id`:
- A) identificador global do registro de participação: permitir múltiplas participações da mesma pessoa, cada uma com ID distinto; UNIQUE global pode ser avaliado após validar geração de IDs.
- B) identificador único dentro da sessão: requer chave composta `(session_id, legacy_id)` e adaptação da busca/lock da RPC; risco de colisão fora do escopo.
- C) identificador de pessoa: **não compatível** com a semântica atual da RPC, que proíbe reutilização em outra sessão; requer entidade e política de tratamento de dados próprias.

## Orientação provisória
Preservar `interview_participants.id` como identificador do registro de participação e **não equiparar `legacy_id` a identidade da pessoa**. Não criar restrição UNIQUE nem modificar dados até confirmar como os IDs são gerados no frontend/importação dos pilotos. A RPC DRAFT permanece desabilitada; seus testes atuais refletem uma proteção provisória e deverão ser ajustados se o domínio de unicidade aprovado mudar.

## Critérios de homologação
- Mesmo indivíduo em duas sessões, com duas participações distintas, sem conflito.
- Retry da mesma participação é idempotente.
- Participação não é transferida silenciosamente entre sessões.
- Respostas continuam referenciando a participação correta.
- Ausência de vinculação transversal desnecessária de dados pessoais.
- Migração/rollback avaliados em banco descartável antes de aprovação de produção.

Nenhuma migração aplicada e nenhum dado de piloto alterado.

## Achado de implementação e correção limitada (2026-10-12)
Inspeção do `src/context/PilotContext.tsx`, função `startD1Cycle`:
- Antes: `participantLegacyId = interview-respondent-${organizationId}`, constante entre ciclos da mesma instituição.
- A sessão já usava `session-${newCycle.id}`; portanto, um segundo ciclo poderia gerar sessão diferente com o mesmo identificador de participante e provocar `participant_identity_conflict` na RPC DRAFT.
- Correção no frontend: `participantLegacyId = interview-respondent-${newCycle.id}`. É uma identidade **do registro de participação no ciclo**, não da pessoa; mantém a estabilidade para tentativas com o mesmo ID de ciclo.
- Limite: o identificador de ciclo ainda incorpora `Date.now()`, e o fluxo confirma ciclo antes de criar sessão. Em caso de retry de **toda a operação** após falha, um novo ID de ciclo pode ser gerado. Isso permanece uma lacuna separada de idempotência ponta a ponta.
- A RPC continua desabilitada por flag e as migrações continuam DRAFT; nenhuma alteração retroativa dos IDs legados nos cinco pilotos.
- A alteração não resolve por si a escolha futura de unicidade global versus por sessão, mas remove a colisão determinística entre ciclos criada pelo código atual.
