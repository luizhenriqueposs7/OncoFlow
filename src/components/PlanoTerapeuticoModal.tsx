import React from 'react';
import { Download } from 'lucide-react';
import type { Paciente } from '../types';
import { Dialogo } from './Dialogo';

export function PlanoTerapeuticoModal({ paciente, onFechar }: { paciente: Paciente; onFechar: () => void }) {
  const baixar = () => {
    const url = URL.createObjectURL(new Blob([paciente.planoTerapeuticoTexto], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url;
    link.download = `Treatment_Plan_${paciente.nome.replace(/\s+/g, '_')}.txt`;
    link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <Dialogo titulo="Current treatment plan" onFechar={onFechar}>
    <div className="work-form"><div><strong>{paciente.nome}</strong><p className="form-description">{paciente.planoAtualizadoEm ? `Updated on ${paciente.planoAtualizadoEm}` : 'Plan not attached yet'}</p></div>
      <p className="form-description">Team document. Lia does not use this plan to answer the patient.</p>
      <div className="plan-text">{paciente.planoTerapeuticoTexto || "No plan attached."}</div>
      <button type="button" className="work-secondary" onClick={baixar}><Download size={18} aria-hidden />Download as .txt</button>
    </div>
  </Dialogo>;
}
