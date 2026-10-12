# VIPAZ — Entrada e seleção de contexto autorizado (especificação v0.1)
Data: 2026-10-12. Estado: **ESPECIFICAÇÃO DE PRODUTO, NÃO IMPLEMENTADA**.

## Problema e evidência
A autenticação institucional atual valida a identidade no Supabase Auth. O endpoint `api/data/institutionalScope.ts` devolve apenas `isGlobalAdmin`, organizações visíveis e `visibleCycleCount`; não devolve os papéis institucionais ou vínculos de parceiro confirmados. A inspeção de metadados no Supabase revelou `organization_memberships`, `vipaz_partner_memberships` e `vipaz_partner_organization_links`, mas nenhuma linha nessas tabelas segundo o resumo fornecido pela ferramenta. Os códigos confirmados por restrições do banco são `ADMIN_VIPAZ`, `PARTNER_ADMIN`, `PARTNER_OPERATOR`, `PARTNER_VIEWER`. Os códigos institucionais não foram homologados.

## Decisão de experiência
**A pessoa se autentica uma vez.** Após a autenticação, a VIPAZ identifica os contextos confirmados em que ela pode atuar. O contexto deve ser selecionado somente quando houver mais de uma possibilidade; quando houver exatamente uma, abrir diretamente o ambiente correspondente. Um perfil declarado no cadastro é informação para análise/convite, **não uma autorização**.

Fluxo de experiência:
1. Entrar com credenciais e validar identidade.
2. Consultar vínculos e papéis confirmados, sem confiar em `PilotContext.currentUser`.
3. Nenhum vínculo ativo: mostrar estado de acesso pendente/sem autorização, sem dados de instituições.
4. Um contexto ativo: entrar diretamente nele.
5. Mais de um contexto ativo: mostrar seletor simples **Atuar como** (papel + instituição ou parceiro) e **Instituição** quando aplicável; oferecer troca de contexto durante a sessão.
6. A cada consulta ou escrita, o servidor/banco revalida o escopo. Trocar contexto no cliente não concede privilégio.

## Contextos conceituais
- **Administração VIPAZ:** usuário com papel global `ADMIN_VIPAZ` válido.
- **Facilitação VIPAZ:** usuário designado pela operação VIPAZ a ciclos específicos. A estrutura técnica da designação **ainda precisa ser confirmada**.
- **Parceiro VIPAZ:** usuário com vínculo ativo a um parceiro, papel `PARTNER_ADMIN`, `PARTNER_OPERATOR` ou `PARTNER_VIEWER`; organizações dependem também de vínculos de carteira ativos e autorização efetiva.
- **Gestão institucional:** usuário com membership institucional confirmado e papel autorizado. Não presumir código `GESTOR` sem confirmação da taxonomia.
- **Participação / interlocução:** atribuição a investigação, não equivalente a permissão administrativa institucional.
- **Encarregado:** função organizacional, não papel técnico autônomo por padrão.

## Contrato proposto (não criar endpoint sem aprovação)
A resposta futura de contexto deve apresentar exclusivamente informações **autorizadas e necessárias à interface**: identificador opaco do contexto, tipo, papel confirmado, organização/parceiro visível, ações permitidas derivadas das regras do servidor e indicador de contexto selecionável. Nunca retornar vínculo pendente, revogado ou de outra instituição. O cliente pode utilizar permissões para orientar a navegação, mas o banco é a autoridade final.

## Critérios de aceite
- Um único contexto confirmado: acesso direto, sem tela intermediária.
- Dois contextos confirmados: escolha explícita, com troca de contexto sem novo cadastro.
- Autodeclaração de gestor não gera permissão.
- Parceiro A+B não visualiza C.
- Facilitador designado ao ciclo X não acessa Y automaticamente.
- Revogação/expiração é aplicada na próxima operação, mesmo que a interface ainda exiba o contexto antigo.
- Ausência de vínculo não revela dados institucionais.
- Interface acessível e inteligível para usuário pouco familiarizado com governança.

## Pendências antes de implementar
1. Recuperar a taxonomia original de papéis institucionais e a denominação aprovada para interlocutor/parceiro.
2. Verificar as funções de RLS `vipaz_private.*` e grants em ambiente autorizado (consulta bloqueada na sessão atual).
3. Definir quem confirma vínculos e designa facilitadores.
4. Homologar matriz de leitura/escrita para parceiro, gestor e interlocutor.
5. Testar contextos fictícios isolados antes de tocar produção.

## Segurança e limites
Não aplicar migrações DRAFT, não habilitar escrita, não alterar políticas RLS, não modificar pilotos. A execução GitHub Actions nº 43 passou, mas cobre o código existente, não este fluxo ainda não implementado.
