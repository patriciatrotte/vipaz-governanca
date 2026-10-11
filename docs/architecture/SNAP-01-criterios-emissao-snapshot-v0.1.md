# SNAP-01 — Critérios para emissão de snapshot institucional (v0.1)

Estado: especificação; gravação não habilitada.

## Situação verificada
A tabela cycle_snapshots possui organization_id, cycle_id, snapshot_kind, captured_at, methodology_version, payload e created_by. A política de acesso encontrada permite SELECT a usuários autenticados mediante can_access_cycle(cycle_id); não foi encontrada política de INSERT. O perfil de facilitador em PilotContext é simulado e não comprova autorização institucional.

## Regras mínimas para emissão
1. Identidade real obtida de sessão Supabase válida.
2. Organização e ciclo UUID conferidos na base central.
3. Autorização explícita de emissão, independente de acesso de leitura, administração global e vínculo comercial de parceiro.
4. Correspondência do snapshot com organização, ciclo e versão metodológica.
5. Validação humana verificável e vinculada ao ciclo; um booleano local não basta.
6. Ausência de exemplos ou conteúdos demonstrativos apresentados como fatos institucionais.
7. Identificação do autor real, data de servidor e versão do registro.
8. Imutabilidade após emissão; correções exigem novo registro com rastreabilidade.

## Sequência técnica
Pré-validação autenticada sem escrita; validação de conteúdo e autorização; emissão transacional restrita; recuperação do identificador central; impressão com proveniência explícita. Nunca usar chave administrativa genérica para contornar autorização nem promover fallback local a documento oficial.

## Testes
Sessão ausente; usuário sem vínculo; facilitador simulado; admin global sem competência de emissão; ciclo de outra organização; versão divergente; duplicação; retificação; recuperação após recarregar; impressão com e sem registro central.

## Distinções
Validação técnica do diagnóstico não equivale à deliberação ou ratificação institucional. O sistema registra e verifica; a equipe metodológica valida tecnicamente; a autoridade institucional delibera quando aplicável.

## Registro de achados
Achado técnico: ausência de persistência central da consolidação local.
Achado metodológico: necessidade de separar validação técnica de ratificação institucional.
Agenda de pesquisa potencial: proveniência digital e confiança em avaliações institucionais, sujeita a revisão de literatura.
