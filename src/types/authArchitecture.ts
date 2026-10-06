/**
 * ESPECIFICAÇÃO DE ARQUITETURA FUTURA — AUTENTICAÇÃO E AUTORIZAÇÃO (PRODUÇÃO)
 * 
 * Este arquivo define os tipos, entidades e regras estruturais para a futura
 * implementação de autenticação real em ambiente de produção da plataforma.
 * 
 * IMPORTANTE:
 * - No atual Piloto Dimensional D1 (ambiente de desenvolvimento/teste), 
 *   NÃO há login real nem senhas armazenadas.
 * - A alternância de perfis ocorre exclusivamente via "MODO DE SIMULAÇÃO"
 *   para fins de teste fático e demonstração das jornadas por perfil.
 * - Toda persistência do piloto permanece exclusivamente no localStorage do navegador.
 * 
 * FLUXO FUTURO DE PRODUÇÃO:
 * LOGIN 
 *  → USUÁRIO (Conta própria / CPF / e-mail institucional)
 *  → ORGANIZAÇÃO (Câmara Municipal / Ente Público contratante)
 *  → VÍNCULO/PAPEL (Nomeação formal, Portaria, Contrato de Facilitação)
 *  → PERFIL DE ACESSO (Encarregado, Gestor, Facilitador, Participante, Admin)
 *  → PERMISSÕES (Regras granulares de leitura/escrita e deliberação por organização)
 *  → EXPERIÊNCIA AUTORIZADA (Jornada e telas autorizadas para aquele contexto)
 */

import { UserRole } from '../types';

/**
 * 1. Conta Própria de Usuário (Pessoa Física)
 * Cada pessoa possui uma conta única no sistema, identificada por credenciais seguras.
 */
export interface FutureUserAccount {
  id: string;
  email: string;
  fullName: string;
  cpfMasked?: string;
  avatarUrl?: string;
  createdAt: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'INVITED';
  mfaEnabled: boolean;
}

/**
 * 2. Vínculo do Usuário com uma Organização Específica
 * Uma pessoa física pode ter múltiplos vínculos (ex.: Encarregado em uma Câmara e Facilitador em outra),
 * mas a troca de contexto só é permitida entre vínculos reais e ativos.
 */
export interface FutureOrganizationMembership {
  id: string;
  userId: string;
  organizationId: string;
  department: string;
  officialTitle: string; // Ex: "Procurador Jurídico", "Diretor Geral"
  appointmentAct?: string; // Ex: "Portaria nº 142/2025"
  assignedRoles: UserRole[];
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  startDate: string;
  endDate?: string;
}

/**
 * 3. Matriz de Permissões e Governança de Acessos
 * A VIPAZ adota uma arquitetura em duas camadas:
 * 
 * A) REGRAS DE INTEGRIDADE NÃO CONFIGURÁVEIS (Impostas pela VIPAZ):
 *    - Preservação da cadeia probatória e imutabilidade de Snapshots já homologados;
 *    - Segregação lógica absoluta entre organizações/Câmaras;
 *    - Rastreabilidade inegociável de autoria com carimbo temporal e vínculo institucional;
 *    - Proibição de alteração automática de AS IS ou maturidade por conclusão isolada de tarefa;
 *    - Validação de maturidade restrita a rito formal com envolvimento metodológico humano.
 * 
 * B) PERMISSÕES INSTITUCIONAIS CONFIGURÁVEIS (Delegáveis pela Câmara a papéis/vínculos elegíveis):
 *    - Configuração por organização de quais papéis podem deliberar rotas de evolução,
 *      conduzir avanços setoriais ou submeter documentos probatórios complementares.
 */
export interface FuturePermissionSet {
  // Ações de Investigação e Descoberta
  canConductDiagnosticDoors: boolean;       // Investigação dos aspectos da dimensão
  canSubmitSectorContribution: boolean;      // Contribuições pontuais setoriais
  canUploadEvidences: boolean;               // Submissão de documentos probatórios
  
  // Ações Metodológicas e Validação
  canVerifySufficiency: boolean;             // Aferir suficiência fática e probatória
  canConsolidateIntegration: boolean;        // Consolidar C1-C6 e propor maturidade
  canExecuteHumanValidation: boolean;        // Validação metodológica formal de maturidade
  canSealImmutableSnapshot: boolean;         // Emitir marco temporal de Snapshot auditável
  
  // Ações de Minha Rota e Evolução
  canDeliberateRouteDecision: boolean;       // Confirmar ou ajustar rota (Agora, No Horizonte, etc.)
  canManageEvolutionPlan: boolean;           // Gerenciar e criar avanços de evolução
  canConcludeAvancoDelivery: boolean;        // Declarar entrega concluída de um avanço
  canConsultExecutiveReports: boolean;       // Consulta a relatórios gerenciais e sínteses
  
  // Administração e Integridade Técnica
  canExportTechnicalBackup: boolean;         // Exportação de salvaguarda
  canManageSystemIntegrity: boolean;         // Testes de integridade e diagnósticos técnicos
}

/**
 * 4. Histórico e Gestão do Ciclo de Vida dos Acessos
 * A troca de Encarregado de Dados (ou de Facilitador) permite a revogação/alteração
 * imediata do acesso do titular anterior, PRESERVANDO integralmente a memória institucional,
 * a autoria das respostas e a imutabilidade dos Snapshots homologados.
 */
export interface FutureRoleHandoverRecord {
  id: string;
  organizationId: string;
  cycleId: string;
  roleChanged: UserRole;
  previousUserId: string;
  newUserId: string;
  handoverDate: string;
  reason: string;
  handoverActNumber?: string;
  retainedHistoricalSnapshots: string[]; // IDs dos Snapshots imutáveis preservados
}

/**
 * 5. Log de Auditoria Imutável (Trilha de Acesso e Deliberação)
 */
export interface FutureAuditLogEntry {
  id: string;
  organizationId: string;
  cycleId: string;
  userId: string;
  membershipId?: string; // Vínculo institucional formal associado ao ato
  userRole: UserRole;
  actionType: 
    | 'ACCESS_VIEW' 
    | 'RECORD_RESPONSE' 
    | 'SUBMIT_CONTRIBUTION' 
    | 'UPLOAD_EVIDENCE' 
    | 'UPDATE_CAPACITY' 
    | 'VALIDATE_MATURITY' 
    | 'CREATE_SNAPSHOT' 
    | 'DELIBERATE_ROUTE'
    | 'DELIBERATE_ACTION';
  targetResource: string;
  timestamp: string;
  ipAddressMasked: string;
  userAgent: string;
  metadata?: Record<string, unknown>;
}

/**
 * REQUISITOS DE ARQUITETURA PARA PRODUÇÃO (GOVERNANÇA & ACESSO):
 * 
 * 1. MODELO CANÔNICO DE AUTORIZAÇÃO EM 6 CAMADAS:
 *    A autorização formal de qualquer ato na VIPAZ deve avaliar em tempo de execução:
 *    [Identidade Autenticada] 
 *      + [Membership Ativo] 
 *      + [Organização Contextual] 
 *      + [Papel Contextual no Vínculo] 
 *      + [Permissão da Ação] 
 *      + [Regras de Integridade Inegociáveis da VIPAZ]
 * 
 * 2. AUTENTICAÇÃO: Identity Provider compatível com padrão público (GOV.BR / SAML / OAuth corporativo).
 * 3. BANCO PERSISTENTE: PostgreSQL / Cloud SQL com Row-Level Security (RLS) segregado por organização.
 * 4. SEGREGAÇÃO POR ORGANIZAÇÃO: Isolamento lógico rígido onde a Câmara Municipal é raiz de todas as coleções.
 * 5. LOGS DE AUDITORIA: Registro append-only imutável de todas as evidências, respostas, rotas e homologações.
 * 6. GESTÃO DO CICLO DE VIDA: Revogação segura e histórico completo das gestões, mandatos e portarias.
 */

