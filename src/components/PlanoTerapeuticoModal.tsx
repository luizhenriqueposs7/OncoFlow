import React from 'react';
import { Download } from 'lucide-react';
import type { Paciente } from '../types';
import { Dialogo } from './Dialogo';

export function PlanoTerapeuticoModal({ paciente, onFechar }: { paciente: Paciente; onFechar: () => void }) {
  const baixar = () => {
    const url = URL.createObjectURL(new Blob([paciente.planoTerapeuticoTexto], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url;
    link.download = `Plano_Terapeutico_${paciente.nome.replace(/\s+/g, '_')}.txt`;
    link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <Dialogo titulo="Plano terapêutico vigente" onFechar={onFechar}>
    <div className="work-form"><div><strong>{paciente.nome}</strong><p className="form-description">{paciente.planoAtualizadoEm ? `Atualizado em ${paciente.planoAtualizadoEm}` : 'Plano ainda não anexado'}</p></div>
      <p className="form-description">Documento da equipe. A Lia não usa este plano para responder ao paciente.</p>
      <div className="plan-text">{paciente.planoTerapeuticoTexto || 'Nenhum plano anexado.'}</div>
      <button type="button" className="work-secondary" onClick={baixar}><Download size={18} aria-hidden />Baixar como .txt</button>
    </div>
  </Dialogo>;
}
