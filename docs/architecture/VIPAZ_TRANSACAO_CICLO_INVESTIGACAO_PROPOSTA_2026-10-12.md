# VIPAZ — transação integral de abertura do ciclo e investigação
Data: 2026-10-12. Status: **proposta de contrato; não implementada nem homologada**.

## Problema confirmado no código
`src/context/PilotContext.tsx::startD1Cycle` cria `newCycle.id` com `Date.now()`, chama `POST /api/data/cycles` e só depois `POST /api/data/investigation-session`. A segunda rota, mesmo quando usar sua RPC atômica DRAFT, cobre apenas sessão + participante. O `POST /api/data/cycles` usa `resolution=merge-duplicates` e não constitui idempotência da operação integral. Uma falha entre chamadas pode deixar ciclo sem investigação; reiniciar `startD1Cycle` cria outro identificador.

## Contrato-alvo, sujeito a revisão
Uma operação autenticada de **abertura de ciclo D1 com sessão e interlocutor opcional**, executada em uma única transação PostgreSQL. Entrada: `operation_id` estável gerado uma vez no início da intenção de abertura, organização canônica, dimensão, versão metodológica, dados do ciclo, identificadores legados de sessão/participação e facilitador. Saída: UUIDs canônicos do ciclo, sessão e participante; indicador de criação/reaproveitamento; nenhum dado de instituição fora do escopo.

A identidade da operação não é o `Date.now()` do ciclo. Em retry idêntico, os UUIDs retornados devem ser os mesmos; em retry com dados institucionais ou conteúdo divergente, conflito explícito sem sobrescrita.

## Regras mínimas
1. Autenticação via `auth.uid()` e autorização de **escrita** para a organização dentro da RPC; não inferir permissão de `SELECT` nem aceitar `organizationId` do cliente como autorização.
2. Lock/índice de idempotência em `operation_id`, com verificação de payload; não depender apenas de advisory lock cooperativo.
3. Criar ou recuperar ciclo, sessão e participação na mesma transação. Erro em qualquer etapa implica rollback integral.
4. Se o interlocutor não for informado, aplicar explicitamente a política de criação sem participante; não fabricar identidade.
5. `interview_participants.id` identifica participação contextual; `legacy_id` não é identidade canônica de pessoa.
6. Restringir EXECUTE aos papéis autorizados; `SECURITY DEFINER` somente com validação completa, search_path restrito e testes de isolamento.
7. Remover a sequência de dois POSTs do frontend **somente após** a RPC integral e testes serem homologados. Manter fail-closed até lá.

## Lacunas de homologação
- Taxonomia de papéis com permissão para abrir ciclos, inclusive facilitador e parceiro vinculado.
- Significado e unicidade de `operation_id`, estratégia de armazenamento e limpeza, hash de conteúdo e política de retry após reload.
- Confronto das colunas obrigatórias e índices reais de `governance_cycles` e `organizations`.
- Regras de concorrência para múltiplas aberturas legítimas de ciclo na mesma organização.
- Plano de transição dos ciclos eventualmente incompletos sem modificar os cinco pilotos.
- Testes no PostgreSQL descartável: retry igual, divergente, concorrência, rollback na terceira etapa, usuário sem acesso, troca de organização, sessão sem participante.
- Verificação de JWT/RLS real em ambiente de homologação autorizado, distinta dos testes sintéticos.

## Gate atual
O endpoint `POST /api/data/cycles` recusa escrita quando `VIPAZ_ATOMIC_INVESTIGATION_ENABLED` não está ativa. É uma proteção contra um tipo de escrita parcial, **não é atomicidade integral**. A flag atual não deve ser usada como autorização automática para ativar a operação integral. Nenhuma migração deve ser aplicada em produção sem aprovação explícita.

## Recomendação de sequência
1. Preparar testes de contrato e fixture de banco descartável para operação integral.
2. Implementar uma **nova** RPC DRAFT para ciclo + sessão + participação, preservando a RPC anterior como artefato de comparação.
3. Validar concorrência e permissões, revisar contrato e plano de reversão.
4. Só então substituir o fluxo frontend e solicitar aprovação de implantação.

Sem alterações no Supabase real nem nos pilotos.
