import React, { useState } from 'react';
import type { NovaTarefa, PacientePro, UsuarioEquipe } from '../types';
import { Dialogo } from './Dialogo';

function prazoPadrao() {
  const d = new Date(Date.now() + 86400000);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
export function NovaTarefaDialog({ pacientes, usuarios, usuarioAtual, pacienteInicial, onSalvar, onFechar }: {
  pacientes: PacientePro[]; usuarios: UsuarioEquipe[]; usuarioAtual: UsuarioEquipe; pacienteInicial?: string;
  onSalvar: (pacienteId: string, tarefa: NovaTarefa) => Promise<boolean>; onFechar: () => void;
}) {
  const [pacienteId, setPacienteId] = useState(pacienteInicial ?? '');
  const [titulo, setTitulo] = useState(''); const [motivo, setMotivo] = useState('');
  const [responsavelId, setResponsavel] = useState(usuarioAtual.id); const [prazo, setPrazo] = useState(prazoPadrao);
  const [salvando, setSalvando] = useState(false); const [erro, setErro] = useState('');
  const salvar = async (e: React.FormEvent) => {
    e.preventDefault(); if (salvando) return;
    const data = new Date(prazo);
    if (!Number.isFinite(data.getTime()) || data.getTime() <= Date.now()) { setErro("Choose a future deadline."); return; }
    setSalvando(true); setErro('');
    const ok = await onSalvar(pacienteId, { titulo, motivo, responsavelId, prazo: data.toISOString() });
    if (ok) onFechar(); else { setErro("Could not create the task. Your entries have been kept; try again."); setSalvando(false); }
  };
  return <Dialogo titulo="New task" onFechar={onFechar} ocupado={salvando}><form onSubmit={salvar} className="work-form">
    <p className="form-description">Assign a team action with an owner and deadline. Task details stay in the team portal.</p>
    <label>Patient<select required value={pacienteId} onChange={e => setPacienteId(e.target.value)} disabled={salvando}><option value="">Select a patient</option>{pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></label>
    <label>Task title<input required maxLength={120} value={titulo} onChange={e => setTitulo(e.target.value)} disabled={salvando} placeholder="For example: arrange transportation for the test" /></label>
    <label>Reason or instructions for the team<textarea required maxLength={2000} rows={3} value={motivo} onChange={e => setMotivo(e.target.value)} disabled={salvando} /></label>
    <label>Owner<select required value={responsavelId} onChange={e => setResponsavel(e.target.value)} disabled={salvando}>{usuarios.map(u => <option key={u.id} value={u.id}>{u.nome} · {u.cargo}</option>)}</select></label>
    <label>Deadline<input type="datetime-local" required value={prazo} onChange={e => setPrazo(e.target.value)} disabled={salvando} /></label>
    {erro && <p className="send-error" role="alert">{erro}</p>}
    <button type="submit" className="work-primary" disabled={salvando}>{salvando ? "Creating task…" : "Create task"}</button>
  </form></Dialogo>;
}
