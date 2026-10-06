/**
 * VIPAZ — Teste de Reidratação e Salvaguarda da Validação Estruturada
 *
 * Cenários verificados:
 * 1. Reidratação de D1.2 com checkboxes persistidos (ex: 'fluido', 'caminho_conhecido')
 * 2. Reidratação de D1.1 com seleções de escala persistidas (ex: 'Sim', 'Em parte')
 * 3. Reidratação de D1.5 com checkboxes persistidos
 * 4. Navegação entre perguntas: alternar portas e retornar preserva os itens salvos
 * 5. Pergunta nova: sem unidades persistidas, inicializa com seleções vazias
 * 6. Salvaguarda de seleção local em andamento: atualização externa de informationUnits
 *    (sem mudança de porta) NÃO elimina seleções ainda não registradas pelo facilitador
 */

import { InformationUnit, DoorId } from '../src/types';

// Catálogos extraídos de DoorInvestigationView.tsx
const C1_ITEMS = [
  { id: 'identificar', label: 'Identifica o que precisa ser feito diante de uma questão de proteção de dados' },
  { id: 'orientar', label: 'Presta esclarecimentos e orienta pessoas ou áreas' },
  { id: 'articular', label: 'Identifica e aciona quem precisa participar' },
  { id: 'titulares', label: 'Conduz demandas relacionadas aos direitos dos titulares e demais assuntos recebidos como Encarregado' },
  { id: 'anpd', label: 'Sabe como proceder diante de comunicação ou demanda da ANPD' },
  { id: 'incidente', label: 'Orienta a organização diante de incidente envolvendo dados pessoais' },
  { id: 'riscos', label: 'Contribui para análise de riscos e orienta medidas de proteção' },
  { id: 'novos_tratamentos', label: 'Orienta questões relacionadas a processos, projetos, sistemas, contratos ou novos tratamentos' },
  { id: 'propor', label: 'Propõe providências ou melhorias quando identifica necessidade' },
  { id: 'escalonar', label: 'Reconhece quando algo ultrapassa sua governabilidade e encaminha à instância competente' }
];

const C2_ITEMS = [
  { id: 'fluido', label: 'O encaminhamento é compreendido e tratado sem necessidade de insistência' },
  { id: 'orientacao', label: 'É necessário explicar ou orientar para que a providência avance' },
  { id: 'cobranca', label: 'É necessário acompanhar ou cobrar para que avance' },
  { id: 'demora', label: 'Há demora ou situações que ficam paradas até nova provocação' },
  { id: 'urgencia', label: 'Algumas providências acontecem principalmente quando a situação se torna urgente' },
  { id: 'variacao', label: 'O funcionamento varia conforme a pessoa, área ou situação' },
  { id: 'caminho_conhecido', label: 'Os caminhos necessários são conhecidos' },
  { id: 'caminho_parcial', label: 'Algumas situações têm caminho conhecido e outras precisam ser descobertas' },
  { id: 'caminho_descobrir', label: 'Frequentemente é necessário descobrir como ou por quem a questão deve ser tratada' },
  { id: 'sem_experiencia', label: 'Ainda não houve experiência suficiente para avaliar' }
];

const C5_ITEMS = [
  { id: 'normas', label: 'Mudanças na legislação, normas ou orientações aplicáveis' },
  { id: 'anpd', label: 'Orientações ou manifestações da ANPD' },
  { id: 'sistemas', label: 'Mudanças em sistemas, processos, serviços ou fornecedores' },
  { id: 'tratamentos', label: 'Novos tratamentos ou novas formas de utilização de dados' },
  { id: 'incidentes', label: 'Incidentes, reclamações ou demandas recebidas' },
  { id: 'rotina', label: 'Dificuldades percebidas na rotina' },
  { id: 'controles', label: 'Resultados de controles, verificações ou avaliações anteriores' },
  { id: 'outros', label: 'Outros fatores relevantes' },
  { id: 'sem_rotina', label: 'Atualmente não existe acompanhamento dessa natureza' }
];

// Simulador determinístico do comportamento do useEffect de DoorInvestigationView
class DoorInvestigationSimulator {
  private lastActiveDoor: DoorId;
  public c1Validation: Record<string, string> = {};
  public multiValidation: string[] = [];

  constructor(initialDoor: DoorId) {
    this.lastActiveDoor = initialDoor;
  }

  // Reproduz rigorosamente a lógica implementada no useEffect de DoorInvestigationView
  public onEffect(activeDoorId: DoorId, informationUnits: InformationUnit[]) {
    const isDoorChange = this.lastActiveDoor !== activeDoorId;
    this.lastActiveDoor = activeDoorId;

    const structuredUnits = informationUnits.filter(
      u => u.doorId === activeDoorId && u.statement.startsWith('[VALIDACAO_ESTRUTURADA]')
    );

    if (structuredUnits.length > 0) {
      if (activeDoorId === 'D1.1') {
        const rehydratedC1: Record<string, string> = {};
        C1_ITEMS.forEach(item => {
          const prefix = `[VALIDACAO_ESTRUTURADA] ${item.label}: `;
          const matched = structuredUnits.find(u => u.statement.startsWith(prefix));
          if (matched) {
            rehydratedC1[item.id] = matched.statement.slice(prefix.length).trim();
          }
        });
        this.c1Validation = rehydratedC1;
        this.multiValidation = [];
      } else if (activeDoorId === 'D1.2' || activeDoorId === 'D1.5') {
        const targetItems = activeDoorId === 'D1.2' ? C2_ITEMS : C5_ITEMS;
        const rehydratedIds = targetItems
          .filter(item => structuredUnits.some(u => u.statement === `[VALIDACAO_ESTRUTURADA] ${item.label}`))
          .map(item => item.id);
        this.multiValidation = rehydratedIds;
        this.c1Validation = {};
      } else {
        this.c1Validation = {};
        this.multiValidation = [];
      }
    } else if (isDoorChange) {
      // Limpa apenas em troca de pergunta para pergunta nova
      this.c1Validation = {};
      this.multiValidation = [];
    }
  }

  // Simula ação do usuário clicando em checkbox antes de salvar
  public userToggleCheckbox(itemId: string) {
    if (this.multiValidation.includes(itemId)) {
      this.multiValidation = this.multiValidation.filter(id => id !== itemId);
    } else {
      this.multiValidation = [...this.multiValidation, itemId];
    }
  }
}

function runTests() {
  console.log('================================================================');
  console.log('TESTES DE REIDRATAÇÃO E SALVAGUARDA DE VALIDAÇÃO ESTRUTURADA');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;
  function assert(condition: boolean, msg: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${msg}`);
      throw new Error(`Falha: ${msg}`);
    }
  }

  // Dados mockados representando o backup auditado com statements reais
  const mockInformationUnits: InformationUnit[] = [
    {
      id: 'iu-1',
      responseId: 'resp-1',
      doorId: 'D1.2',
      statement: '[VALIDACAO_ESTRUTURADA] O encaminhamento é compreendido e tratado sem necessidade de insistência',
      sourceName: 'Encarregado',
      sourceRole: 'ENCARREGADO',
      scope: 'CONHECIMENTO_DIRETO',
      extractedBy: 'FACILITADOR',
      validationStatus: 'VALIDADO',
      relatedCapacity: 'C2',
      timestamp: '2026-10-05T12:00:00Z'
    },
    {
      id: 'iu-2',
      responseId: 'resp-1',
      doorId: 'D1.2',
      statement: '[VALIDACAO_ESTRUTURADA] Os caminhos necessários são conhecidos',
      sourceName: 'Encarregado',
      sourceRole: 'ENCARREGADO',
      scope: 'CONHECIMENTO_DIRETO',
      extractedBy: 'FACILITADOR',
      validationStatus: 'VALIDADO',
      relatedCapacity: 'C2',
      timestamp: '2026-10-05T12:00:00Z'
    },
    {
      id: 'iu-3',
      responseId: 'resp-2',
      doorId: 'D1.1',
      statement: '[VALIDACAO_ESTRUTURADA] Identifica o que precisa ser feito diante de uma questão de proteção de dados: Sim',
      sourceName: 'Encarregado',
      sourceRole: 'ENCARREGADO',
      scope: 'CONHECIMENTO_DIRETO',
      extractedBy: 'FACILITADOR',
      validationStatus: 'VALIDADO',
      relatedCapacity: 'C1',
      timestamp: '2026-10-05T12:00:00Z'
    },
    {
      id: 'iu-4',
      responseId: 'resp-2',
      doorId: 'D1.1',
      statement: '[VALIDACAO_ESTRUTURADA] Presta esclarecimentos e orienta pessoas ou áreas: Em parte',
      sourceName: 'Encarregado',
      sourceRole: 'ENCARREGADO',
      scope: 'CONHECIMENTO_DIRETO',
      extractedBy: 'FACILITADOR',
      validationStatus: 'VALIDADO',
      relatedCapacity: 'C1',
      timestamp: '2026-10-05T12:00:00Z'
    },
    {
      id: 'iu-5',
      responseId: 'resp-3',
      doorId: 'D1.5',
      statement: '[VALIDACAO_ESTRUTURADA] Mudanças na legislação, normas ou orientações aplicáveis',
      sourceName: 'Encarregado',
      sourceRole: 'ENCARREGADO',
      scope: 'CONHECIMENTO_DIRETO',
      extractedBy: 'FACILITADOR',
      validationStatus: 'VALIDADO',
      relatedCapacity: 'C5',
      timestamp: '2026-10-05T12:00:00Z'
    }
  ];

  // --------------------------------------------------------------------------
  // TESTE 1: Reidratação de D1.2
  // --------------------------------------------------------------------------
  console.log('--- Teste 1: Reidratação de D1.2 ---');
  const sim = new DoorInvestigationSimulator('D1.2');
  sim.onEffect('D1.2', mockInformationUnits);
  assert(sim.multiValidation.includes('fluido'), 'Item "fluido" foi reidratado a partir do statement correspondente');
  assert(sim.multiValidation.includes('caminho_conhecido'), 'Item "caminho_conhecido" foi reidratado');
  assert(sim.multiValidation.length === 2, 'Exatamente os 2 fatos persistidos em D1.2 foram reidratados');

  // --------------------------------------------------------------------------
  // TESTE 2: Reidratação de D1.1
  // --------------------------------------------------------------------------
  console.log('\n--- Teste 2: Reidratação de D1.1 ---');
  sim.onEffect('D1.1', mockInformationUnits);
  assert(sim.c1Validation['identificar'] === 'Sim', 'Valor "Sim" reidratado para identificar em D1.1');
  assert(sim.c1Validation['orientar'] === 'Em parte', 'Valor "Em parte" reidratado para orientar em D1.1');
  assert(sim.multiValidation.length === 0, 'multiValidation permanece limpo ao carregar D1.1');

  // --------------------------------------------------------------------------
  // TESTE 3: Reidratação de D1.5
  // --------------------------------------------------------------------------
  console.log('\n--- Teste 3: Reidratação de D1.5 ---');
  sim.onEffect('D1.5', mockInformationUnits);
  assert(sim.multiValidation.includes('normas'), 'Item "normas" reidratado em D1.5');
  assert(sim.multiValidation.length === 1, 'Exatamente 1 fato persistido em D1.5 foi reidratado');

  // --------------------------------------------------------------------------
  // TESTE 4: Navegação entre perguntas e retorno
  // --------------------------------------------------------------------------
  console.log('\n--- Teste 4: Navegação entre perguntas e retorno ---');
  // Navega para D1.3 (sem validações estruturadas)
  sim.onEffect('D1.3', mockInformationUnits);
  assert(sim.multiValidation.length === 0, 'D1.3 limpa seleções ao navegar para pergunta sem validação');
  assert(Object.keys(sim.c1Validation).length === 0, 'D1.3 mantém c1Validation vazio');

  // Retorna para D1.2
  sim.onEffect('D1.2', mockInformationUnits);
  assert(sim.multiValidation.includes('fluido') && sim.multiValidation.includes('caminho_conhecido'),
    'Ao retornar para D1.2 após navegar por outras perguntas, todos os fatos são perfeitamente restaurados');

  // --------------------------------------------------------------------------
  // TESTE 5: Pergunta nova (sem fatos gravados)
  // --------------------------------------------------------------------------
  console.log('\n--- Teste 5: Pergunta nova (sem registros) ---');
  // Simulador acessa D1.6 (onde não há fatos mockados)
  sim.onEffect('D1.6', mockInformationUnits);
  assert(sim.multiValidation.length === 0, 'Pergunta nova D1.6 inicializa com multiValidation vazio');
  assert(Object.keys(sim.c1Validation).length === 0, 'Pergunta nova D1.6 inicializa com c1Validation vazio');

  // --------------------------------------------------------------------------
  // TESTE 6: Salvaguarda de seleção local em andamento (CRÍTICO)
  // --------------------------------------------------------------------------
  console.log('\n--- Teste 6: Salvaguarda contra perda de seleção local em andamento ---');
  // Facilitador navega para uma porta com formulário de checklist não registrado ainda (ex: simulamos D1.2 sem unidades)
  const emptyUnits: InformationUnit[] = [];
  const simSafeguard = new DoorInvestigationSimulator('D1.2');
  simSafeguard.onEffect('D1.2', emptyUnits);
  assert(simSafeguard.multiValidation.length === 0, 'Início limpo em D1.2 sem unidades');

  // Facilitador marca 'cobranca' e 'urgencia' em tela, MAS AINDA NÃO CLICOU EM SALVAR
  simSafeguard.userToggleCheckbox('cobranca');
  simSafeguard.userToggleCheckbox('urgencia');
  assert(simSafeguard.multiValidation.length === 2, 'Facilitador selecionou 2 opções localmente');

  // Ocorre evento não relacionado na aplicação que atualiza informationUnits (ex: documento juntado em D1.4)
  const updatedExternalUnits: InformationUnit[] = [
    {
      id: 'doc-ext-1',
      responseId: 'resp-ext',
      doorId: 'D1.4',
      statement: '[DOCUMENTO_INDICADO] Portaria Geral da Presidência',
      sourceName: 'TI',
      sourceRole: 'EQUIPE_TI',
      scope: 'CONHECIMENTO_DIRETO',
      extractedBy: 'FACILITADOR',
      validationStatus: 'VALIDADO',
      timestamp: '2026-10-05T12:05:00Z'
    }
  ];

  // Dispara o efeito com as novas informationUnits na MESMA porta ativa (sem troca de porta)
  simSafeguard.onEffect('D1.2', updatedExternalUnits);

  // A salvaguarda DEVE garantir que a seleção local do facilitador NÃO foi apagada
  assert(simSafeguard.multiValidation.includes('cobranca'), 'Item "cobranca" foi preservado intacto');
  assert(simSafeguard.multiValidation.includes('urgencia'), 'Item "urgencia" foi preservado intacto');
  assert(simSafeguard.multiValidation.length === 2,
    'A seleção local em andamento do facilitador permaneceu 100% preservada contra atualizações externas!');

  console.log('\n================================================================');
  console.log(`SUCESSO: ${passed}/${total} TESTES DE REIDRATAÇÃO E SALVAGUARDA APROVADOS! 🎯`);
  console.log('================================================================\n');
}

runTests();
