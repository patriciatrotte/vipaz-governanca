# VIPAZ — Auditoria estrutural do núcleo | Decisão técnica v0.1
Data: 2026-10-12 · Escopo: branch `fix/vipaz-authz-catalog-integration-20261012` e banco Supabase (consultas somente leitura).

## 1. Decisão
**Refatorar o núcleo; preservar PostgreSQL/Supabase, metodologia, dados dos cinco pilotos e interface funcional.** Decisão provisória, sujeita à validação automatizada. Nenhuma migração, merge ou deploy está autorizada por este documento.

## 2. Mapa de dependências
```
InstitutionalLogin
  -> institutionalAuth (JWT apenas em memória; sem refresh/restauração)
  -> institutionalScope (escopo apresentado, não seleciona contexto)
  -> PilotContext (organizações/ciclos locais + catálogo remoto)
     -> /api/data/organizations (JWT -> PostgREST/RLS)
     -> /api/data/cycles (JWT -> PostgREST/RLS)
     -> /api/data/investigation-session (JWT -> sessão -> participante)
     -> /api/data/cycle-bundle (JWT -> respostas/evidências)
     -> armazenamento local PILOTO_* (mistura registros locais/remotos)
```

## 3. Achados confirmados
| ID | Achado | Evidência | Risco | Prioridade |
|---|---|---|---|---|
| A1 | Token institucional em memória, perdido no reload e sem refresh | `src/services/institutionalAuth.ts` | login repetido; estado visual divergente | P1 |
| A2 | Login apresenta escopo mas não seleciona instituição/ciclo autorizado | `src/components/InstitutionalLogin.tsx` | usuário autenticado sem contexto central | P0 |
| A3 | Catálogo central é mesclado ao local e persistido em `PILOTO_*` | `src/context/PilotContext.tsx` | dados remotos permanecem no navegador após logout | P0 |
| A4 | Criação de ciclo e sessão/participante são chamadas separadas | `startD1Cycle` e `api/data/investigation-session.ts` | sucesso parcial, reexecução difícil | P0 |
| A5 | `merge-duplicates` em POST de organizações/ciclos | `api/data/organizations.ts`, `api/data/cycles.ts` | atualização implícita de registros existentes | P0 |
| A6 | Falta RLS/grants INSERT em organizações, ciclos, participantes | consulta `pg_policies` e grants | fluxo com JWT não conclui | P0 |
| A7 | `organization_memberships` sem registros; 2 `ADMIN_VIPAZ` cadastrados | agregação SQL em 2026-10-12 | usuários sem vínculo não terão escopo institucional | P0 |
| A8 | Índices UNIQUE em ciclo/sessão legacy_id, não em participante legacy_id | `pg_indexes` | duplicação de participantes em retry | P1 |
| A9 | `package.json` não define script de testes | `package.json` | regressões não bloqueadas no CI | P0 |
| A10 | Após criar ciclo, aplicação já adota UUID central, mas não há homologação end-to-end | commit `72c030f` | estado/seleção pode divergir | P0 |

## 4. Contrato do núcleo (alvo)
1. **Identidade:** autenticação Supabase real; estado de sessão explícito (carregando, autenticado, expirado, desconectado). Perfil simulado não concede permissões.
2. **Escopo:** seleção obrigatória de organização/ciclo autorizados; JWT + RLS + papel para cada escrita; ausência de vínculo não cria acesso implícito.
3. **Identificadores:** UUID central canônico; legacy_id somente ponte de migração, nunca chave operacional principal.
4. **Persistência:** escrita idempotente e atômica de ciclo/sessão/participante; erro não pode ser confundido com sucesso; evitar UPSERT genérico de registros institucionais.
5. **Estado:** dados centrais de organizações/ciclos não são copiados para `localStorage`; contingência local dos pilotos permanece segregada e preservada.
6. **Autorização:** papel global ADMIN_VIPAZ ativo pode cadastrar instituições; papéis institucionais de escrita serão especificados antes de ampliar RLS. Acesso de leitura não implica escrita.
7. **Observabilidade:** erros identificáveis por etapa, sem log de JWT, senhas ou dados pessoais desnecessários.
8. **Migração:** nenhum piloto sobrescrito, apagado ou importado automaticamente; reconciliação explícita, reversível e auditável.

## 5. Plano executável, em ordem
**Fase 0 — Proteção:** snapshot dos cinco backups e branch; inventário de IDs centrais/legados; nenhum dado de produção alterado.

**Fase 1 — Contratos e testes:** adicionar runner de testes, testes de autorização 401/403, escopo cruzado, ciclo/sessão/participante, retry, logout e reload; mocks não substituem homologação real.

**Fase 2 — Núcleo:** separar `InstitutionalSession`, `InstitutionalScope`, `InstitutionalCatalog`, `PilotLocalCache`; proibir fusão persistente de catálogo remoto em armazenamento local; contexto institucional selecionado de forma explícita.

**Fase 3 — Escrita segura:** migração revisada para grants/RLS por papel; operação transacional idempotente (RPC no PostgreSQL sob JWT e autorização, ou equivalente comprovado); retirar `resolution=merge-duplicates` de criações não explicitamente reconciliadas.

**Fase 4 — Homologação:** em ambiente isolado, testar admin, gestor autorizado, sem vínculo, troca de organização, reload, falha intermediária e recuperação; conferir integridade dos cinco backups sem reaplicar pilotos.

**Fase 5 — Publicação:** somente com testes automatizados verdes, homologação e plano de rollback; PR #10 permanece draft até então.

## 6. Critérios de saída
- Usuário sem vínculo não consulta/escreve dados de outra instituição.
- Usuário autorizado seleciona ciclo central inequívoco e grava resposta que reaparece após novo login.
- Falha na criação de participante não deixa ciclo/sessão parcialmente confirmados.
- Retry não duplica registros nem sobrescreve dados de outra instituição.
- Logout remove visibilidade do catálogo remoto e não apaga backups locais.
- Testes automáticos executados com resultado documentado.
- Não há migração silenciosa dos cinco pilotos.

## 7. Limites da auditoria
Inspeção estática de arquivos e consultas SQL de metadados; **não** foram executados testes HTTP autenticados, build/CI, operações de escrita ou migrações. As decisões acima são propostas para validação, não funcionalidades homologadas.

## 8. Pesquisa e PI
Registrar como hipótese de pesquisa a transição de instrumento de diagnóstico para sistema de governança contínua, com preservação de rastreabilidade e autonomia. Não alegar originalidade sem revisão de literatura. Preservar a metodologia e seus crosswalks como ativos versionados, separados da infraestrutura.
