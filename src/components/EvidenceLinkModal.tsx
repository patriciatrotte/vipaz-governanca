import React, { useState } from 'react';
import { usePilot } from '../context/PilotContext';
import { EvidenceRecord, EvidenceSufficiency, CapacityId, EvidenceLink } from '../types';
import { Link2, AlertCircle, Trash2, Plus } from 'lucide-react';

interface EvidenceLinkBadgesProps {
  links: EvidenceLink[];
}

export const EvidenceLinkBadges: React.FC<EvidenceLinkBadgesProps> = ({ links }) => {
  if (!links || links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {links.map(link => {
        const badgeCls = 
          link.sufficiency === 'SUFICIENTE' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
          link.sufficiency === 'PARCIALMENTE_SUFICIENTE' ? 'bg-amber-50 text-amber-700 border-amber-300' :
          'bg-rose-50 text-rose-700 border-rose-300';
        return (
          <span 
            key={link.id} 
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${badgeCls}`}
            title={`${link.capacityId}: ${link.sufficiency} — ${link.rationale}`}
          >
            {link.capacityId}: {link.sufficiency === 'SUFICIENTE' ? 'SUFICIENTE' : link.sufficiency === 'PARCIALMENTE_SUFICIENTE' ? 'PARCIAL' : 'INSUFICIENTE'}
          </span>
        );
      })}
    </div>
  );
};

interface EvidenceLinkModalProps {
  evidence: EvidenceRecord;
  onClose: () => void;
}

export const EvidenceLinkModal: React.FC<EvidenceLinkModalProps> = ({ evidence, onClose }) => {
  const { evidenceLinks, addEvidenceLink, removeEvidenceLink } = usePilot();

  const [selectedCapacity, setSelectedCapacity] = useState<CapacityId>('C1');
  const [selectedSufficiency, setSelectedSufficiency] = useState<EvidenceSufficiency>('SUFICIENTE');
  const [linkRationale, setLinkRationale] = useState('');

  const linksForThisEvidence = evidenceLinks.filter(l => l.evidenceId === evidence.id);

  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkRationale.trim()) return;

    addEvidenceLink({
      evidenceId: evidence.id,
      capacityId: selectedCapacity,
      sufficiency: selectedSufficiency,
      rationale: linkRationale.trim()
    });

    setLinkRationale('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-xl w-full p-5 space-y-4 shadow-xl border border-slate-200 text-xs max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-purple-600" />
              Vínculos de Suficiência por Capacidade (EvidenceLink)
            </h4>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">
              {evidence.title}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 text-sm leading-none"
          >
            ✕
          </button>
        </div>

        {/* Princípio Metodológico */}
        <div className="bg-purple-50/70 border border-purple-200 rounded-lg p-3 text-[11px] text-purple-950 leading-relaxed space-y-1">
          <div className="font-bold flex items-center gap-1 text-purple-900">
            <AlertCircle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            Princípio Metodológico D1 v1.0 (§ 34)
          </div>
          <p>
            A suficiência não é propriedade absoluta da evidência; ela pertence à relação entre a evidência e a capacidade avaliada. 
            Uma mesma evidência permanece cadastrada uma única vez e pode possuir múltiplos vínculos com capacidades (C1–C6), cada um com seu nível de suficiência e seu fundamento racional contextual.
          </p>
        </div>

        {/* Vínculos Já Registrados */}
        <div className="space-y-2">
          <div className="font-semibold text-slate-800 flex items-center justify-between">
            <span>Vínculos de Suficiência Cadastrados ({linksForThisEvidence.length}):</span>
          </div>
          
          {linksForThisEvidence.length === 0 ? (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-center text-[11px]">
              Nenhum vínculo estrutural cadastrado para esta evidência. Utilize o formulário abaixo para adicionar vínculos às capacidades avaliadas (C1 a C6).
            </div>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {linksForThisEvidence.map(link => {
                const badgeColor = 
                  link.sufficiency === 'SUFICIENTE' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                  link.sufficiency === 'PARCIALMENTE_SUFICIENTE' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                  'bg-rose-100 text-rose-800 border-rose-300';

                return (
                  <div key={link.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded text-[10px] border border-purple-200">
                          {link.capacityId}
                        </span>
                        <span className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded border ${badgeColor}`}>
                          {link.sufficiency}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {link.assessedBy} • {new Date(link.assessedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-700 text-[11px] leading-relaxed">
                        {link.rationale}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEvidenceLink(link.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 transition-colors shrink-0"
                      title="Remover este vínculo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Formulário: Adicionar Novo Vínculo */}
        <form onSubmit={handleSaveLink} className="space-y-3 pt-3 border-t border-slate-200">
          <h5 className="font-bold text-slate-800 text-xs">Adicionar Novo Vínculo de Capacidade:</h5>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Capacidade Avaliada (C1 a C6):</label>
              <select
                value={selectedCapacity}
                onChange={e => setSelectedCapacity(e.target.value as CapacityId)}
                className="w-full p-2 border border-slate-300 rounded font-medium text-xs bg-white"
              >
                <option value="C1">C1 — Estruturação do Encarregado</option>
                <option value="C2">C2 — Sustentação e Condições de Atuação</option>
                <option value="C3">C3 — Distribuição de Tarefas e Demandas</option>
                <option value="C4">C4 — Articulação Setorial</option>
                <option value="C5">C5 — Sustentação Gerencial e Recursos</option>
                <option value="C6">C6 — Continuidade e Evolução</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Grau de Suficiência:</label>
              <select
                value={selectedSufficiency}
                onChange={e => setSelectedSufficiency(e.target.value as EvidenceSufficiency)}
                className="w-full p-2 border border-slate-300 rounded font-medium text-xs bg-white"
              >
                <option value="SUFICIENTE">SUFICIENTE (Comprova plenamente a capacidade)</option>
                <option value="PARCIALMENTE_SUFICIENTE">PARCIALMENTE SUFICIENTE (Comprova indícios parciais)</option>
                <option value="INSUFICIENTE">INSUFICIENTE (Insuficiente para comprovar a capacidade)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Racional da Avaliação (Fundamento Contextual):
            </label>
            <textarea
              rows={2}
              value={linkRationale}
              onChange={e => setLinkRationale(e.target.value)}
              placeholder="Ex: Suficiente para demonstrar a designação formal do Encarregado, mas não comprova condições de tempo ou apoio prático à sua atuação."
              className="w-full p-2 border border-slate-300 rounded text-xs"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
            >
              Fechar
            </button>
            <button
              type="submit"
              disabled={!linkRationale.trim()}
              className="px-4 py-1.5 font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded disabled:opacity-50 flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Salvar Vínculo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
