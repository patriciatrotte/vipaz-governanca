# VIPAZ — Decisão de acesso às confirmações (proposta para homologação)
Data: 2026-10-12. Estado: **PROPOSTA; requer validação de produto e segurança**.

## Problema comprovado
O banco concede SELECT em `interview_participants` a `authenticated` e a política RLS `participants_select_scope` permite ler a linha a quem pode acessar a sessão. A tabela guarda `metadata.confirmation_note` e `metadata.confirmed_by`. Logo, restringir somente a API `reconcile-participant` a `ADMIN_VIPAZ` **não impede consulta direta pela REST API do Supabase** por outros usuários autorizados a ler a sessão.

## Fronteira recomendada (a decidir)
- **Dados operacionais de participante** (nome, função, participação na sessão): visibilidade a perfis com acesso institucional à sessão, quando justificada pela função.
- **Justificativa da confirmação, identificador do confirmador e trilha de auditoria**: visibilidade restrita ao administrador e a futuros papéis de auditoria expressamente definidos.
- **Confirmação/escrita**: somente ator autorizado, com identidade verificada, nota e evidência rastreáveis.
- Não usar uma simples ocultação na interface como controle de segurança.

## Alternativas
1. **Segregação estrutural (preferível para evolução)**: separar os metadados sensíveis de confirmação em tabela de auditoria com RLS própria e leitura mínima de participantes; exige migração de dados, revisão da RPC de confirmação, endpoint de reconciliação e todos os consumidores de `metadata`. **Não implementar antes de inventariar dependências e aprovar contrato de dados.**
2. **RLS temporariamente restritiva**: limitar SELECT de participantes a `ADMIN_VIPAZ`; protege a linha inteira, mas pode impedir o uso legítimo por facilitadores/membros. Requer decisão expressa e testes de regressão.
3. **Manter RLS atual e restringir apenas o endpoint**: reduz exposição via esse endpoint, mas **não atende à separação entre dados operacionais e notas de auditoria**. Não declarar proteção completa.

## Próximos critérios verificáveis
- Inventariar chamadas REST/RPC, telas, relatórios e exportações que consomem `interview_participants` ou `metadata`.
- Definir matriz de acesso por papel: administrador, facilitador institucional, interlocutor, auditor e sem vínculo.
- Preparar migração e testes em PostgreSQL descartável, com dados sintéticos.
- Testar JWT/RLS reais **somente em ambiente de homologação independente aprovado**.
- Não aplicar política, alterar grants ou migrar notas no projeto Supabase dos pilotos.

## Registro metodológico
**Achado de governança e autorização**, não bug isolado de interface: a rastreabilidade exige distinguir quem pode registrar, consultar e auditar uma confirmação. Potencial item da Agenda de Pesquisa, sujeito a revisão de literatura sobre proveniência, accountability e controle de acesso baseado em atributos.
