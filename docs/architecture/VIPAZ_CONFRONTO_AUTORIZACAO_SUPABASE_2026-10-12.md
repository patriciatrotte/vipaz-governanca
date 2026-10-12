# VIPAZ — Confronto da matriz de autorização com o esquema Supabase
Data: 2026-10-12. Fonte: inspeção **somente leitura** dos metadados de tabelas do projeto Supabase. Sem consulta a dados pessoais ou alteração de produção.

## Achados confirmados
| Objeto | RLS | Registros informados na inspeção | Campos de autorização relevantes |
|---|---|---:|---|
| public.global_user_roles | habilitada | 2 | user_id, role_code, status, valid_from, valid_until, revoked_at |
| public.organization_memberships | habilitada | 0 | user_id, organization_id, role_code, status, valid_from, valid_until, revoked_at |
| public.vipaz_partner_memberships | habilitada | 0 | partner_id, user_id, role_code, status, valid_from, valid_until, revoked_at |
| public.vipaz_partner_organization_links | habilitada | 0 | partner_id, organization_id, status, valid_from, valid_until |

Os números de registros são metadados informados pelo serviço; não substituem uma contagem transacional, mas são suficientes para apontar a ausência aparente de vínculos institucionais para homologação com usuários reais.

## Confronto com a matriz v0.1
- **Administrador global:** existe tabela própria e há dois registros de papel global; **não foi verificado** se estão ativos, válidos, qual o role_code ou se correspondem a usuários distintos.
- **Gestor institucional:** o esquema permite vincular usuário a organização e papel, mas não há vínculos institucionais registrados no resumo; autorização efetiva não demonstrada.
- **Facilitador de ciclo:** não há, nos campos de membership examinados, vínculo direto a ciclo; requer regra explícita ou tabela de atribuição específica antes de conceder escopo por ciclo.
- **Membro somente leitura:** o campo role_code permite representação, mas não confirma existência nem política de acesso.
- **Parceiro:** tabelas próprias existem, sem vínculos registrados. Acesso do parceiro não deve ser confundido com membership institucional.

## Riscos e decisões pendentes
1. RLS habilitada não significa isolamento correto: auditar expressões USING/WITH CHECK, grants e funções SECURITY DEFINER.
2. Não presumir que qualquer membership ativo permita criar sessões; leitura e escrita são permissões distintas.
3. O RPC DRAFT atual exige administrador global, portanto não implementa os papéis de gestor e facilitador propostos.
4. Definir como facilitadores são atribuídos a ciclos, inclusive revogação e validade.
5. Para homologar isolamento real, usar duas organizações e identidades de teste isoladas, sem criar memberships fictícios na produção.
6. A inspeção de metadados não validou conteúdo das políticas nem funções auxiliares; estas exigem auditoria separada.

## Classificação do achado
**Achado de arquitetura/autorização**: ausência de vínculos institucionais utilizáveis para testes reais de isolamento; não é, por si só, bug técnico nem prova de falha de RLS.

## Próxima decisão
Antes de codificar papéis institucionais: aprovar semântica de gestor, facilitador, leitor e parceiro, identificar atribuições por ciclo e construir testes RLS com dois tenants fictícios em ambiente isolado. Não aplicar migrações DRAFT nem alterar pilotos.
