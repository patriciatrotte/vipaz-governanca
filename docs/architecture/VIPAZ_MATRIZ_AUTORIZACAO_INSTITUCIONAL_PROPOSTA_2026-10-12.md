# VIPAZ — Matriz de autorização institucional (proposta v0.1)
Data: 2026-10-12. Estado: **PROPOSTA PARA VALIDAÇÃO**, não representa política implantada.

## Princípios
- Negação por padrão; identidade vem do Supabase Auth, nunca de perfis simulados no cliente.
- O vínculo institucional deve ser ativo, não revogado e válido na data da operação.
- A autorização deve ser verificada no banco para cada recurso, considerando organização, ciclo e sessão.
- Acesso de leitura não implica autorização para escrever; facilitação não implica administração.
- Não confundir o administrador da plataforma com o responsável pela decisão institucional.
- Mudanças de autorização exigem testes de acesso cruzado, registro de decisão e revisão de segurança.

## Matriz-alvo — sujeita à validação de negócio e modelagem dos papéis
| Operação | Administrador VIPAZ | Gestor institucional autorizado | Facilitador vinculado ao ciclo | Membro somente leitura | Sem vínculo |
|---|---|---|---|---|---|
| Consultar organização vinculada | Sim, mediante papel global válido | Sim, na própria organização | Sim, se necessário ao ciclo | Sim, no próprio escopo | Não |
| Consultar ciclo e sessões | Sim, mediante papel global válido | Sim, na própria organização | Sim, nos ciclos atribuídos | Sim, nos ciclos explicitamente liberados | Não |
| Criar organização | Sim, operação administrativa | Não, salvo delegação formal futura | Não | Não | Não |
| Criar ciclo | Sim, operação administrativa | Proposta: sim, na própria organização | Não | Não | Não |
| Criar sessão e participante | Sim, operação administrativa | Proposta: sim, na própria organização | Proposta: sim, no ciclo atribuído | Não | Não |
| Alterar evidência ou resposta | Somente com atribuição operacional explícita | Proposta: conforme atribuição | Proposta: conforme atribuição | Não | Não |
| Administrar vínculos e papéis | Sim, com trilha de auditoria | Proposta: apenas papéis delegáveis da própria organização | Não | Não | Não |

**Não implementar os campos “Proposta” sem decisão explícita.** A função RPC atualmente proposta permite escrita somente ao administrador global; a matriz não deve ser confundida com sua implementação.

## Casos de teste obrigatórios
1. Usuário da organização A não consulta organização, ciclos, sessões, participantes ou evidências de B.
2. Usuário de A não cria sessão vinculada a ciclo de B, mesmo conhecendo o UUID.
3. Usuário com vínculo revogado ou expirado perde acesso, inclusive em sessão já aberta.
4. Usuário sem vínculo recebe recusa; perfil simulado no frontend não eleva privilégios.
5. Facilitador do ciclo A1 não recebe acesso automático ao ciclo A2.
6. Administrador global inválido, expirado ou revogado não recebe acesso global.
7. Respostas de erro não expõem dados da instituição B.
8. Uma operação rejeitada não deixa sessão ou participante parcialmente persistido.

## Lacunas para homologação
- Confirmar estrutura e valores reais dos papéis e vínculos em banco por consulta somente leitura.
- Testar RLS com usuários JWT reais em ambiente isolado, não com GUC simulada.
- Validar função SECURITY DEFINER, proprietário e concessões EXECUTE.
- Conferir ausência de duplicidade de `interview_participants.legacy_id` antes de eventual restrição UNIQUE.
- Definir quem autoriza delegações, revogações e acessos extraordinários.
- Documentar trilha de auditoria e retenção de evidências.

## Decisão de produto
Manter a escrita institucional desabilitada até homologação. Preservar cinco pilotos e não aplicar SQL DRAFT em produção. A matriz é especificação de controle de acesso, não uma migração.
