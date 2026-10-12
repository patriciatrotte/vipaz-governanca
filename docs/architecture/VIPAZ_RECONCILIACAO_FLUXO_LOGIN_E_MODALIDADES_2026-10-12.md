# VIPAZ — Reconciliação do fluxo de entrada e das modalidades
Data: 2026-10-12. Estado: registro de decisões conceituais, não implementação.

## Fluxo anteriormente definido
LOGIN → USUÁRIO → ORGANIZAÇÃO → PAPEL/PERFIL → PERMISSÕES → EXPERIÊNCIA.

A seleção do contexto após autenticação operacionaliza esse fluxo; não cria um perfil novo. Uma pessoa pode atuar em mais de uma instituição, sob vínculos e papéis distintos. Quando existe um único contexto confirmado, a interface pode entrar diretamente; quando há vários, deve oferecer troca explícita.

## Perfis e funções
A arquitetura conceitual D1 descreve Participante, Gestor Institucional, Facilitador e Administrador da Plataforma como perfis da experiência. Refinamentos posteriores distinguem o Facilitador VIPAZ e Administrador VIPAZ como operação da plataforma, o Gestor Institucional como vínculo institucional e o parceiro como operador de uma carteira de organizações. Interlocutor Principal é papel de participação na investigação; Encarregado é função organizacional e não autorização técnica automática.

Os códigos efetivamente confirmados no banco são ADMIN_VIPAZ, PARTNER_ADMIN, PARTNER_OPERATOR e PARTNER_VIEWER. Não há confirmação suficiente de códigos técnicos para Gestor Institucional, Facilitador e Participante. Não inventar códigos nem autorizar por autodeclaração.

## Modalidades de aplicação
M1 Assistida/Mediada; M2 Individual/Autônoma; M3 Distribuída/Colaborativa; M4 Híbrida. Modalidade metodológica não é papel de autorização.

## Segurança e implementação
A identidade é autenticada; vínculos ativos e atribuições determinam contextos; o banco confirma cada permissão. Revogação deve interromper acesso sem apagar memória institucional. Não derivar permissões do perfil simulado do piloto. A especificação detalhada permanece em VIPAZ_FLUXO_LOGIN_PAPEIS_CONFIRMADOS_ESPECIFICACAO_2026-10-12.md.

Este registro não aprova migração, ativação de escrita, alteração de RLS nem mudanças nos cinco pilotos.
