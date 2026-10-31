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
    if (!Number.isFinite(data.getTime()) || data.getTime() <= Date.now()) { setErro('Escolha um prazo futuro.'); return; }
    setSalvando(true); setErro('');
    const ok = await onSalvar(pacienteId, { titulo, motivo, responsavelId, prazo: data.toISOString() });
    if (ok) onFechar(); else { setErro('Não foi possível criar a tarefa. Seus dados foram mantidos; tente novamente.'); setSalvando(false); }
  };
  return <Dialogo titulo="Nova tarefa" onFechar={onFechar} ocupado={salvando}><form onSubmit={salvar} className="work-form">
    <p className="form-description">Organize uma ação da equipe com responsável e prazo. O conteúdo desta tarefa fica no portal da equipe.</p>
    <label>Paciente<select required value={pacienteId} onChange={e => setPacienteId(e.target.value)} disabled={salvando}><option value="">Selecione o paciente</option>{pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></label>
    <label>Título da tarefa<input required maxLength={120} value={titulo} onChange={e => setTitulo(e.target.value)} disabled={salvando} placeholder="Ex.: organizar transporte para o exame" /></label>
    <label>Motivo ou orientação para a equipe<textarea required maxLength={2000} rows={3} value={motivo} onChange={e => setMotivo(e.target.value)} disabled={salvando} /></label>
    <label>Responsável<select required value={responsavelId} onChange={e => setResponsavel(e.target.value)} disabled={salvando}>{usuarios.map(u => <option key={u.id} value={u.id}>{u.nome} · {u.cargo}</option>)}</select></label>
    <label>Prazo<input type="datetime-local" required value={prazo} onChange={e => setPrazo(e.target.value)} disabled={salvando} /></label>
    {erro && <p className="send-error" role="alert">{erro}</p>}
    <button type="submit" className="work-primary" disabled={salvando}>{salvando ? 'Criando tarefa…' : 'Criar tarefa'}</button>
  </form></Dialogo>;
}
