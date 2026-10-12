# VIPAZ — Marco 1: roteiro de homologação ponta a ponta
Data de preparação: 2026-10-12. Status: **PLANEJADO, NÃO EXECUTADO NO SUPABASE REAL**.
Escopo: abertura atômica de ciclo D1, sessão de investigação, confirmação explícita de participante, recuperação e isolamento de acesso.

## 1. Critério de conclusão do Marco 1
Um administrador institucional autorizado consegue autenticar-se, selecionar uma organização canônica de teste, abrir um ciclo D1 e sua sessão em uma única transação, retornar à aplicação, recuperar o ciclo e a sessão diretamente do banco, registrar uma confirmação explícita de participante e reencontrar os registros após sair e entrar novamente. A plataforma não deve inferir participação a partir do contato do piloto, nem transformar dados locais em prova institucional.

**Não afirmar homologação completa enquanto cada etapa não tiver evidência de execução em ambiente isolado.**

## 2. Evidências automatizadas já obtidas
- GitHub Actions Core Quality Gate nº 159: **success** em 2026-10-12; inclui TypeScript, regressões de segurança e PostgreSQL descartável.
- Testes PostgreSQL descartáveis: abertura de ciclo atômica e idempotente; confirmação explícita de participante com trilha de confirmação; negação a ator não autorizado.
- Testes de API: JWT encaminhado à consulta de sessão; falha segura em 401/403, sessão ausente, ambiguidade, payload inválido.
- Testes de cliente: identificador opaco de confirmação reaproveitado em tentativas, separado por usuário/sessão; falha de armazenamento bloqueia escrita.
- **Limites:** JWT/RLS reais, comportamento em rede real, navegação após login e compatibilidade com dados persistidos não foram demonstrados por esses testes.

## 3. Pré-condições — portão obrigatório
- [ ] Aprovação expressa de ambiente de homologação separado dos cinco pilotos; não usar produção como ambiente de ensaio.
- [ ] Snapshot/backup verificável e plano de reversão; inventário de dados de teste.
- [ ] Revisão técnica das funções SECURITY DEFINER, seus grants, RLS e vínculo institucional; confirmar ADMIN_VIPAZ e usuário sem vínculo com JWTs reais.
- [ ] Revisão de duplicidade: `interview_participants.legacy_id` não tem UNIQUE no banco real; advisory lock protege somente chamadas cooperativas. Decidir índice/constraint ou outra garantia de unicidade antes de habilitar escrita.
- [ ] Revisão da recuperação: consulta por `cycle_id` espera **exatamente uma** sessão. Definir se a regra de domínio permite múltiplas sessões por ciclo; se permitir, substituir a busca por chave inequívoca.
- [ ] Revisão da confirmação: idempotência após timeout só é segura se a nova tentativa reproduzir nome, função e nota originais; hoje o cliente preserva apenas o identificador, não os campos. Definir reconciliação read-only de operação pendente antes de ativar.
- [ ] Eliminar nomes fictícios como identidade de facilitador persistida; usar identidade autenticada e papel validado, ou registro neutro explicitamente identificado como não verificado.
- [ ] Aprovar aplicação das migrações DRAFT no ambiente isolado, não no Supabase real; configurar flags de recurso somente após testes.
- [ ] Verificar aderência dos dados do ciclo ao contrato de persistência e recuperação de respostas/evidências. A abertura de sessão, isoladamente, não comprova persistência de investigação.

## 4. Execução guiada — registrar resultado e evidência por etapa
| Etapa | Ação | Resultado esperado | Evidência a registrar |
|---|---|---|---|
| H01 | Login com ADMIN_VIPAZ de teste | Identidade confirmada; sem usar perfil simulado | horário, usuário de teste, ambiente |
| H02 | Consultar catálogo e selecionar organização de teste com UUID | Organização visível conforme RLS | resposta sanitizada da API |
| H03 | Abrir ciclo D1 e interromper conexão antes da resposta | Transação íntegra; retry com mesmo ID não duplica | IDs de ciclo/sessão e contagens |
| H04 | Recarregar e autenticar novamente | Ciclo e sessão recuperados da base central | telas e consulta read-only |
| H05 | Abrir painel do facilitador | Sessão canônica única; nenhuma participação inferida | tela e metadados |
| H06 | Confirmar pessoa com ação humana explícita | Um participante CONFIRMED, com autoria e nota | ID e metadados auditáveis |
| H07 | Simular timeout e repetir operação idêntica | Mesmo ID de participante, sem duplicação | contagem e ID antes/depois |
| H08 | Alterar campos após timeout e tentar repetir | Conflito explícito; nenhuma nova pessoa criada | erro sanitizado, registro inalterado |
| H09 | Acessar com usuário sem vínculo | Sem leitura ou escrita fora de escopo | códigos HTTP, ausência de dados |
| H10 | Voltar à plataforma em nova sessão | Ciclo, sessão, participação e conteúdo investigativo recuperáveis | comparação antes/depois |
| H11 | Testar duas sessões vinculadas ao mesmo ciclo (se domínio permitir) | Seleção inequívoca, ou bloqueio explicado | evidência de decisão de domínio |

## 5. Critérios de aceite
- **Integridade:** nenhuma gravação parcial de ciclo/sessão; sem duplicidade após retry.
- **Autorização:** nenhuma operação de escrita ou leitura indevida com JWT real.
- **Rastreabilidade:** confirmação atribuída a identidade autenticada e justificada.
- **Recuperabilidade:** dados efetivamente persistidos recuperados após nova autenticação.
- **UX:** usuário compreende por que confirma uma pessoa, o que falta e como resolver falhas.
- **Governança:** versão metodológica preservada; mudança rastreável.
- **Não regressão:** cinco pilotos intactos; nenhum efeito sobre produção.

## 6. Classificação de achados
Cada ocorrência deve ser registrada como **bug técnico**, **achado de UX**, **achado metodológico** ou **evolução desejável**, com evidência, severidade, decisão, responsável e versão. Não alterar metodologia por um evento isolado.

## 7. Resultado da preparação
**APTO PARA PLANEJAR HOMOLOGAÇÃO ISOLADA; NÃO APTO PARA ATIVAR PRODUÇÃO.**
A execução nº 159 demonstra testes automatizados, não homologação com usuários institucionais reais. A autorização de implantação e de alterações no banco deve ser solicitada separadamente.

Referência complementar: `docs/architecture/VIPAZ_SUPABASE_HOMOLOGACAO_PERMISSOES_2026-10-12.md`.
