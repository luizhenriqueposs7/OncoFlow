import React, { useState } from 'react';
import type { Compromisso } from '../types';
import { Dialogo } from '../components/Dialogo';
import { porExtenso } from './formato';

export function LembreteDialog({ compromisso, onCriar, onFechar, onConcluido }: {
  compromisso: Compromisso; onCriar: (id: string, minutos: number) => Promise<unknown>;
  onFechar: () => void; onConcluido: () => void;
}) {
  const faltam = Date.parse(compromisso.dataHora) - Date.now();
  const [minutos, setMinutos] = useState(faltam > 1440 * 60000 ? 1440 : 120);
  const [salvando, setSalvando] = useState(false); const [erro, setErro] = useState('');
  const permitido = Date.parse(compromisso.dataHora) - minutos * 60000 > Date.now();
  return <Dialogo titulo="Criar lembrete" onFechar={onFechar} ocupado={salvando}><form className="work-form" onSubmit={async e => {
    e.preventDefault(); if (salvando || !permitido) return;
    setSalvando(true); setErro('');
    const ok = await onCriar(compromisso.id, minutos);
    if (ok === true) onConcluido(); else { setErro('Não foi possível salvar. Confira sua conexão e tente novamente.'); setSalvando(false); }
  }}>
    <div className="reminder-review"><strong>{compromisso.titulo}</strong><p>{porExtenso(compromisso.dataHora)}</p><p>{compromisso.local}</p></div>
    <fieldset><legend>Quando lembrar?</legend>{[[1440, 'Um dia antes'], [120, 'Duas horas antes']].map(([valor, rotulo]) => <label key={valor} className="reminder-option"><input type="radio" name="antecedencia" value={valor} checked={minutos === valor} disabled={salvando || Date.parse(compromisso.dataHora) - Number(valor) * 60000 <= Date.now()} onChange={() => setMinutos(Number(valor))} />{rotulo}</label>)}</fieldset>
    {permitido ? <p>O lembrete ficará marcado para <strong>{porExtenso(new Date(Date.parse(compromisso.dataHora) - minutos * 60000).toISOString())}</strong>.</p> : <p role="status">Este compromisso está próximo demais para essas opções de antecedência.</p>}
    <p className="form-description">Nesta demonstração, o lembrete fica salvo na sua agenda.</p>
    {erro && <p role="alert" className="send-error">{erro}</p>}
    <button type="submit" className="work-primary" disabled={!permitido || salvando}>{salvando ? 'Salvando…' : 'Confirmar lembrete'}</button>
  </form></Dialogo>;
}
