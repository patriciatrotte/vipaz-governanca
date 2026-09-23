import React, { useState } from 'react';
import { usePilot } from '../context/PilotContext';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  FileQuestion, 
  ShieldCheck, 
  Plus, 
  Eye, 
  Lock,
  ExternalLink,
  Link2
} from 'lucide-react';
import { EvidenceRecord, EvidenceStatus, CapacityId } from '../types';
import { EvidenceLinkModal, EvidenceLinkBadges } from './EvidenceLinkModal';

export const EvidencesView: React.FC = () => {
  const { 
    evidences, 
    evidenceLinks, 
    addEvidence, 
    verifyEvidence, 
    currentUser 
  } = usePilot();

  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceRecord | null>(evidences[0] || null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<EvidenceStatus>('VERIFICADA');
  const [sufficiencyNotes, setSufficiencyNotes] = useState('');
  const [limitations, setLimitations] = useState('');

  // Vínculos de Suficiência Relacional (EvidenceLink)
  const [linkingEvidence, setLinkingEvidence] = useState<EvidenceRecord | null>(null);

  // Nova evidência
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<EvidenceRecord['type']>('PORTARIA');
  const [newOrigin, setNewOrigin] = useState('');
  const [newSensitivity, setNewSensitivity] = useState<EvidenceRecord['sensitivity']>('PUBLICA');
  const [newCapacities, setNewCapacities] = useState<CapacityId[]>(['C1']);

  const handleOpenVerify = (ev: EvidenceRecord) => {
    setSelectedEvidence(ev);
    setVerificationStatus(ev.status === 'INDICADA' ? 'VERIFICADA' : ev.status);
    setSufficiencyNotes(ev.sufficiencyNotes || '');
    setLimitations(ev.limitations || '');
    setIsVerifying(true);
  };

  const handleOpenLinks = (ev: EvidenceRecord) => {
    setLinkingEvidence(ev);
  };

  const handleSaveVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvidence) return;

    verifyEvidence(
      selectedEvidence.id,
      verificationStatus,
      sufficiencyNotes,
      limitations,
      currentUser.name
    );
    setIsVerifying(false);
  };

  const handleSaveNewEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addEvidence({
      title: newTitle,
      type: newType,
      origin: newOrigin || 'Gabinete / Secretaria',
      indicatedBy: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      status: 'INDICADA',
      sufficiencyNotes: 'Evidência indicada. Aguarda verificação formal de suficiência pelo Facilitador.',
      limitations: 'Pendente de validação de autenticidade documental.',
      relatedCapacities: newCapacities,
      sensitivity: newSensitivity,
      aiUsageRule: newSensitivity === 'CONFIDENCIAL' ? 'RESTRITO_HUMANO' : 'AUTORIZADO_RESUMO'
    });

    setIsAdding(false);
    setNewTitle('');
    setNewOrigin('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Banner de Evidências */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold">Gestão Metodológica de Evidências</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Regra Fundamental do Piloto D1: <strong>Evidência verificada ≠ Evidência suficiente para toda conclusão</strong>. 
            A verificação atesta que o artefato existe; a suficiência avalia estritamente até onde aquele artefato comprova determinada capacidade ou se possui limitações intrínsecas.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 self-start md:self-auto shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4 text-purple-200" />
          <span>Cadastrar Evidência</span>
        </button>
      </div>

      {/* Regra de Ouro da Portaria / Designação Formal */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>Exemplo Metodológico Central:</strong> Uma <em>Portaria de Designação de Encarregado</em> comprova com suficiência a designação formal (Capacidade C1). 
          Contudo, a mesma portaria é <strong>insuficiente</strong> para comprovar condições reais de atuação, tempo dedicado, canal ativo com a Mesa ou orçamento (Capacidades C2 e C5). 
          Cada evidência deve ter seu escopo de suficiência demarcado expressamente.
        </div>
      </div>

      {/* Tabela de Evidências */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Evidências Documentais e Sistêmicas ({evidences.length})
          </h3>
          <span className="text-xs text-slate-400">
            Regra de IA: Dados confidenciais nunca são processados por LLMs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Evidência</th>
                <th className="py-3 px-3">Tipo</th>
                <th className="py-3 px-3">Capacidades</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Suficiência & Limites</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {evidences.map(ev => {
                const isVerified = ev.status === 'VERIFICADA';
                const isInadequate = ev.status === 'NAO_VERIFICAVEL_OU_INADEQUADA';
                const statusColor = 
                  isVerified ? 'bg-emerald-100 text-emerald-800' :
                  isInadequate ? 'bg-rose-100 text-rose-800' :
                  ev.status === 'APRESENTADA' ? 'bg-blue-100 text-blue-800' :
                  'bg-amber-100 text-amber-800';

                const linksForEv = evidenceLinks.filter(l => l.evidenceId === ev.id);

                return (
                  <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div className="font-bold text-xs">{ev.title}</div>
                      <div className="text-[11px] text-slate-500">{ev.origin} • Indicado por {ev.indicatedBy}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                      {ev.type}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1 flex-wrap">
                        {ev.relatedCapacities.map(c => (
                          <span key={c} className="bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded font-mono text-[10px]">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${statusColor}`}>
                        {ev.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 max-w-xs space-y-1.5">
                      <EvidenceLinkBadges links={linksForEv} />
                      <p className="text-slate-700 text-[11px] line-clamp-2">
                        {ev.sufficiencyNotes}
                      </p>
                      {ev.limitations && (
                        <p className="text-amber-800 text-[10px] italic line-clamp-1 mt-0.5">
                          Limite: {ev.limitations}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <button
                          onClick={() => handleOpenLinks(ev)}
                          className="text-xs font-semibold text-purple-700 hover:text-purple-900 px-2.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors flex items-center gap-1 shrink-0"
                          title="Gerenciar vínculos estruturais de suficiência por capacidade (EvidenceLink)"
                        >
                          <Link2 className="w-3.5 h-3.5 text-purple-600" />
                          <span>Vínculos ({linksForEv.length})</span>
                        </button>
                        <button
                          onClick={() => handleOpenVerify(ev)}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-800 px-2 py-1.5 rounded hover:bg-slate-100 transition-colors"
                          title="Verificar artefato e notas textuais"
                        >
                          Verificar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Avaliar Suficiência da Evidência */}
      {isVerifying && selectedEvidence && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200 text-xs">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  Verificação e Suficiência de Evidência
                </h4>
                <p className="text-[11px] text-slate-500">
                  {selectedEvidence.title}
                </p>
              </div>
              <button onClick={() => setIsVerifying(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveVerification} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Status de Verificação do Artefato:</label>
                <select
                  value={verificationStatus}
                  onChange={e => setVerificationStatus(e.target.value as EvidenceStatus)}
                  className="w-full p-2 border border-slate-300 rounded font-semibold"
                >
                  <option value="VERIFICADA">VERIFICADA (Artefato autêntico e inspecionado)</option>
                  <option value="INSUFICIENTE_PARA_O_FIM">INSUFICIENTE PARA O FIM (Existe, mas não comprova o alegado)</option>
                  <option value="APRESENTADA">APRESENTADA (Aguardando análise pelo Facilitador)</option>
                  <option value="NAO_LOCALIZADA">NÃO LOCALIZADA (Indicada mas não encontrada)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Notas de Suficiência (O que este documento comprova e o que NÃO comprova?):
                </label>
                <textarea
                  rows={3}
                  value={sufficiencyNotes}
                  onChange={e => setSufficiencyNotes(e.target.value)}
                  placeholder="Ex: Comprova a designação formal (C1), mas não comprova condições de tempo ou apoio técnico (C2)."
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Limitações Intrínsecas da Evidência:
                </label>
                <textarea
                  rows={2}
                  value={limitations}
                  onChange={e => setLimitations(e.target.value)}
                  placeholder="Ex: Não especifica carga horária, dotação orçamentária ou equipe de suporte."
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsVerifying(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded"
                >
                  Salvar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Cadastrar Evidência */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200 text-xs">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-purple-600" />
                Cadastrar Nova Evidência
              </h4>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveNewEvidence} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Título / Identificação do Documento:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Ex: Contrato de Prestação de Serviços de TI nº 08/2024"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tipo:</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    <option value="PORTARIA">Portaria / Decreto</option>
                    <option value="CONTRATO">Contrato Administrativo</option>
                    <option value="FLUXOGRAMA">Fluxograma / Procedimento</option>
                    <option value="RELATORIO">Relatório / Parecer</option>
                    <option value="SISTEMA_TICKET">Chamado / Log de Sistema</option>
                    <option value="ATA_REUNIAO">Ata de Reunião</option>
                    <option value="EMAIL">E-mail Formal</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Sensibilidade:</label>
                  <select
                    value={newSensitivity}
                    onChange={e => setNewSensitivity(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    <option value="PUBLICA">Pública (Disponível no Portal)</option>
                    <option value="RESTRITA_INSTITUCIONAL">Restrita Institucional</option>
                    <option value="CONFIDENCIAL">Confidencial (Não enviar para IA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Origem / Localização do Arquivo:</label>
                <input
                  type="text"
                  value={newOrigin}
                  onChange={e => setNewOrigin(e.target.value)}
                  placeholder="Ex: Processo Administrativo nº 104/2024 - Diretoria Geral"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-4 py-1.5 font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded disabled:opacity-50"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Gerenciar Vínculos de Suficiência por Capacidade (EvidenceLink) */}
      {linkingEvidence && (
        <EvidenceLinkModal
          evidence={linkingEvidence}
          onClose={() => setLinkingEvidence(null)}
        />
      )}
    </div>
  );
};
