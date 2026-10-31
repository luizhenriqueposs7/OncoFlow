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
  return <Dialogo titulo="Create reminder" onFechar={onFechar} ocupado={salvando}><form className="work-form" onSubmit={async e => {
    e.preventDefault(); if (salvando || !permitido) return;
    setSalvando(true); setErro('');
    const ok = await onCriar(compromisso.id, minutos);
    if (ok === true) onConcluido(); else { setErro("Could not save. Check your connection and try again."); setSalvando(false); }
  }}>
    <div className="reminder-review"><strong>{compromisso.titulo}</strong><p>{porExtenso(compromisso.dataHora)}</p><p>{compromisso.local}</p></div>
    <fieldset><legend>When should we remind you?</legend>{[[1440, "One day before"], [120, "Two hours before"]].map(([valor, rotulo]) => <label key={valor} className="reminder-option"><input type="radio" name="antecedencia" value={valor} checked={minutos === valor} disabled={salvando || Date.parse(compromisso.dataHora) - Number(valor) * 60000 <= Date.now()} onChange={() => setMinutos(Number(valor))} />{rotulo}</label>)}</fieldset>
    {permitido ? <p>The reminder will be set for <strong>{porExtenso(new Date(Date.parse(compromisso.dataHora) - minutos * 60000).toISOString())}</strong>.</p> : <p role="status">This appointment is too soon for these reminder options.</p>}
    <p className="form-description">In this demo, the reminder is saved in your schedule.</p>
    {erro && <p role="alert" className="send-error">{erro}</p>}
    <button type="submit" className="work-primary" disabled={!permitido || salvando}>{salvando ? "Saving…" : "Confirm reminder"}</button>
  </form></Dialogo>;
}
