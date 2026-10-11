# VIPAZ — Plano integrado de estabilização dos pilotos D1

**Versão:** 0.1 — 2026-10-11. **Natureza:** plano de execução e aceite; não autoriza alterações de dados.

## Problema
A aplicação mistura catálogo central e legado, pode reaproveitar consolidação local entre ciclos e exibe relatórios sem snapshot central. Correções isoladas já reduziram o risco, mas falta comprovação ponta a ponta.

## Evidência dos backups originais
| Câmara | Respostas | Unidades de informação | Validação humana | Snapshot |
|---|---:|---:|---|---|
| Nilo Peçanha | 6 | 20 | não confirmada | ausente |
| Maraú | 7 | 17 | não confirmada | ausente |
| Ibiratanga | 7 | 17 | não confirmada | ausente |
| Morro do Chapéu | 6 | 0 | não confirmada | ausente |
| Vale Sereno | 6 | 0 | não confirmada | ausente |

## Intervenção coordenada
1. **Identidade e catálogo:** UUID central como chave canônica, mapeamento explícito de legacy_id; detectar e sinalizar entradas locais sem correspondência, nunca fundir por nome automaticamente.
2. **Isolamento:** carregar investigação e derivados por par (organization_id, cycle_id); impedir resposta assíncrona de ciclo anterior de sobrescrever a seleção atual; preservar backups e cache pré-migração.
3. **Reconciliação somente leitura:** por ciclo, comparar contagens e IDs de respostas, unidades, evidências e pendências entre backup e Supabase; classificar divergências sem modificar registros.
4. **Consolidação:** diferenciar dados investigativos, proposta da IA, validação humana e eventual ratificação institucional. Não atribuir N1–N5 sem ato de validação verificável.
5. **Emissão:** só habilitar persistência autenticada após autorização de escrita, trilha de autoria, integridade, versionamento e teste de recuperação. Não promover estado local a documento oficial.

## Critérios de aceite (teste de ponta a ponta)
- Cada Câmara central aparece uma vez; registros locais sem correspondência ficam identificados para reconciliação.
- Alternar Nilo Peçanha → Maraú → Ibiratanga → Nilo Peçanha não mistura dados, snapshots ou ações.
- Contagens investigativas reconciliadas com os backups e Supabase, com diferenças documentadas.
- Relatórios não mostram níveis, responsáveis ou ações de outra instituição.
- Sem validação, o relatório informa “não consolidado”, mantendo acesso à investigação legítima.
- Sem snapshot central válido, impressão institucional permanece indisponível.
- Após emissão autorizada (fase posterior), recarregar a página recupera o mesmo snapshot central e sua proveniência.

## Fronteiras e classificação
- **Bug técnico:** duplicidade do catálogo, cache híbrido, condição de corrida entre ciclos.
- **Achado metodológico:** investigação ≠ consolidação ≠ validação ≠ ratificação.
- **UX:** mensagens distinguem trabalho já coletado de resultado ainda não validado.
- **Evolução desejável:** emissão institucional versionada.

## Próxima tarefa prioritária
Implementar barreira contra respostas assíncronas de ciclos anteriores e produzir diagnóstico comparativo somente leitura antes de qualquer migração. A verificação de acesso central deve seguir RLS e vínculo institucional, sem chave privilegiada no cliente.
