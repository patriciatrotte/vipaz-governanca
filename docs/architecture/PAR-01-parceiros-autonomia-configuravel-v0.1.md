# VIPAZ — PAR-01 | Autonomia configurável de parceiros
Status: decisão funcional consolidada; especificação técnica preliminar
Versão: 0.1 | 2026-10-10

## Problema e evidência
A Invicta contrata serviços da VIPAZ e intermedeia a relação com Câmaras Municipais, mas não é a VIPAZ nem representa automaticamente as Câmaras. Deve operar a oferta contratada e demonstrá-la a novos clientes. A possibilidade de cadastrar Câmaras foi definida como opcional, não obrigatória. Consulta inicial ao banco: existem global_user_roles e organization_memberships, mas nenhuma tabela pública com nome contendo partner, contract ou tenant.

## Decisão PAR-01
Criar uma camada de parceiro com permissões configuráveis, separada de ADMIN_VIPAZ e dos papéis institucionais. Uma instituição pode ser atendida diretamente pela VIPAZ, sem parceiro. Cadastro da instituição, vínculo comercial, ativação de serviço e autorização de acesso aos dados são eventos distintos.

## Modelo conceitual proposto (não implementado)
- partners: identidade e status do parceiro.
- partner_memberships: usuário, parceiro, papel operacional, validade e revogação.
- partner_organization_links: vínculo entre parceiro e instituição, escopo, início/fim, situação e auditoria.
- partner_capabilities: permissões explícitas por parceiro, como CAN_CREATE_ORGANIZATION, CAN_REQUEST_ACTIVATION, CAN_MANAGE_OWN_TEAM, CAN_VIEW_AUTHORIZED_CYCLES, CAN_RUN_DEMO.
- service_entitlements: módulos/serviços habilitados por instituição e origem contratual; não inferir contratação a partir de cadastro.
- audit_events: reutilizar mecanismo existente, com revisão dos campos e regras antes da implementação.

## Regras de autorização propostas
1. ADMIN_VIPAZ administra parceiros, escopos e vínculos; não se torna GESTOR institucional por isso.
2. Usuário de parceiro só opera dentro do parceiro ao qual está formalmente vinculado e enquanto o vínculo estiver ativo.
3. Instituição vinculada a parceiro não implica acesso irrestrito aos dados: exigir escopo e permissão para cada operação.
4. Permissão CAN_CREATE_ORGANIZATION é opcional; a VIPAZ também pode cadastrar ou ativar instituições.
5. Demonstrações devem usar dados fictícios ou explicitamente autorizados, nunca dados reais de outra instituição.
6. Deliberação e ratificação continuam reservadas a papéis institucionais competentes.
7. O backend verifica JWT, papéis, escopos e validade; perfil simulado não é fonte de autorização.
8. Revogação deve impedir acesso futuro e manter histórico de auditoria.

## Próxima sequência técnica
1. Auditar modelo atual de usuários, organizações, RLS e trilha de auditoria.
2. Definir cardinalidades, estados, convites e autorização para gestão de vínculos.
3. Escrever migração SQL versionada com políticas RLS e testes de isolamento.
4. Testar com parceiro fictício e instituições fictícias, sem alterar pilotos.
5. Integrar painel do parceiro e fluxo opcional de cadastro.
6. Avaliar responsabilidades contratuais e papéis LGPD por operação.

## Cenários mínimos de aceitação
- Parceiro A não acessa carteira do parceiro B.
- Parceiro sem CAN_CREATE_ORGANIZATION não cria instituição.
- Parceiro com CAN_CREATE_ORGANIZATION pode cadastrar, mas não ativar serviço sem autorização correspondente.
- Administrador VIPAZ enxerga escopo global conforme política.
- Parceiro não ratifica deliberação institucional.
- Revogação de vínculo ou permissão bloqueia acesso subsequente.
- Instituição sem parceiro permanece plenamente operável pela VIPAZ.

## Separação de ativos e pesquisa
Metodologia, regras proprietárias e software VIPAZ permanecem separados dos entregáveis contratados à Invicta. A observação de como intermediários afetam autonomia institucional e continuidade do uso é hipótese de pesquisa aplicada a investigar, não resultado científico demonstrado.
