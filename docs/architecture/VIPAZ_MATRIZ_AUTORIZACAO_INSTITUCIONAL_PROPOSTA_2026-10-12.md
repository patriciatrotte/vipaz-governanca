# VIPAZ — Matriz de perfis e autorização (reconciliação v0.2)
Data: 2026-10-12. Estado: **RECONCILIAÇÃO DE DECISÕES; NÃO É MIGRAÇÃO**.

## Correção de rumo
Esta versão substitui a hipótese genérica da v0.1 de que o facilitador seria um papel institucional. Conforme esclarecimento da direção do produto, **Facilitador VIPAZ e Administrador VIPAZ são papéis da operação VIPAZ**, enquanto **Gestor Institucional** representa a organização. Uma empresa como a Invicta atua como **parceiro multi-institucional**, não como gestor de todas as organizações atendidas.

A nomenclatura exata e os códigos técnicos dos papéis de parceiro e interlocutor devem ser confirmados nos registros metodológicos originais; não se deve presumir que o nome de exibição seja o valor de `role_code` no banco.

## Identidade, declaração e autorização
1. Cadastro/login: autentica a identidade; pode registrar a função declarada e a instituição informada.
2. Vínculo: convite, aprovação ou atribuição confirmam quem a pessoa representa e quais instituições/ciclos pode acessar.
3. Autorização: regras no banco validam papel, escopo, situação ativa, validade e revogação em **cada operação**.
4. Experiência: exibir o ambiente pertinente ao papel confirmado, sem transformar a complexidade dos vínculos em etapas desnecessárias.

**Autodeclaração não é concessão de privilégio.** Uma pessoa pode acumular vínculos e papéis; a autorização deve considerar o contexto da operação.

## Perfis conceituais já definidos — reconciliação
| Perfil | Âmbito | Observação |
|---|---|---|
| Administrador VIPAZ | Global/plataforma | Código `ADMIN_VIPAZ` já referenciado no código; exige vínculo global válido |
| Facilitador VIPAZ | Operação VIPAZ | Atua nos ciclos atribuídos; **não é papel institucional autodeclarado** |
| Parceiro da VIPAZ (ex.: Invicta) | Parceiro e carteira de organizações vinculadas | Não confundir carteira com administração institucional; confirmar denominação/código anteriores |
| Gestor Institucional | Organização específica | Papel declarado no cadastro requer vínculo confirmado com a organização |
| Participante / Interlocutor Principal | Investigação institucional | Papel de participação na investigação não implica administração de usuários ou organização |
| Encarregado | Função institucional | Não presumir perfil de acesso autônomo sem decisão expressa |

## Matriz funcional para especificação (não implementada)
| Ação | Administrador VIPAZ | Facilitador VIPAZ | Parceiro VIPAZ | Gestor institucional | Interlocutor |
|---|---|---|---|---|---|
| Configurar operação e vínculos globais | Sim | Não | Não | Não | Não |
| Visualizar instituições | Conforme escopo global autorizado | Apenas as atribuídas | Apenas as vinculadas à carteira | Apenas sua instituição | Apenas o necessário à participação |
| Visualizar ciclos | Conforme escopo global autorizado | Apenas os atribuídos | Apenas os autorizados na carteira | Apenas sua instituição | Apenas os pertinentes à participação |
| Criar ciclo/sessão | **Pendente regra operacional** | **Pendente regra operacional** | **Pendente delegação** | **Pendente decisão** | Não por padrão |
| Inserir resposta/evidência | Conforme atribuição específica | Conforme atribuição específica | Conforme atribuição específica | Conforme atribuição específica | Conforme participação autorizada |
| Gerir vínculos institucionais | Conforme atribuição administrativa | Não por padrão | Não por padrão | **Pendente regra de confirmação/delegação** | Não |

As células pendentes **não autorizam escrita**. A função RPC DRAFT existente permite apenas administrador global e não representa a matriz completa.

## Evidência de implementação já observada
- `api/data/institutionalScope.ts` consulta organizações, ciclos e papel `ADMIN_VIPAZ` usando JWT do solicitante, deixando RLS decidir visibilidade.
- `src/services/institutionalAuth.ts` autentica via Supabase Auth e verifica identidade; token em memória.
- O banco possui `global_user_roles` (2 registros no resumo de metadados), `organization_memberships` (0), `vipaz_partner_memberships` (0) e `vipaz_partner_organization_links` (0); todas com RLS habilitada. Contagens são informadas por metadados e não substituem homologação transacional.
- Os campos `role_code` existem, mas **a lista exata de valores aceitos e suas políticas efetivas ainda não foi verificada**.
- Atribuição de facilitador a ciclo não foi comprovada pela inspeção realizada.

## Critérios de aceite para testes futuros
1. Autodeclarar `Gestor Institucional` sem vínculo confirmado não concede acesso.
2. Gestor A não lê ou escreve dados de B.
3. Parceiro com carteira A+B não vê C.
4. Facilitador VIPAZ atribuído ao ciclo A1 não acessa automaticamente A2.
5. Interlocutor responde apenas no escopo autorizado e não administra a instituição.
6. Revogação/expiração corta acesso, mesmo com token previamente emitido.
7. Perfil simulado no frontend não altera autorização no banco.
8. Falha de autorização não deixa escrita parcial.

## Decisões e limites
**Confirmado pela direção:** facilitador e administrador pertencem à operação VIPAZ; gestor pertence à instituição; parceiro pode atender múltiplas instituições. **Ainda a verificar:** nomes/códigos exatos, procedimento de confirmação de vínculos, delegações e regras finas de escrita. Nenhuma política RLS foi alterada. Não executar migrações DRAFT nem alterar os cinco pilotos.
