import React from 'react';
import type { PacientePro } from '../types';
import { ROTULO_DESFECHO } from '../types';
import { dataHoraCurta } from './proUtil';
import { ROTULO_ORIGEM } from './Pendencias';

export function HistoricoPaciente({ paciente }: { paciente: PacientePro }) {
  const eventos = [
    ...paciente.checkins.map(c => ({ id: `check-${c.id}`, em: c.em, tipo: "Check-in logged", texto: c.texto || "Well-being update", autor: "Patient" })),
    ...paciente.pendencias.flatMap(p => [
      { id: `criada-${p.id}`, em: p.criadaEm, tipo: p.origem === 'acao_equipe' ? "Task created by the team" : "Follow-up logged", texto: p.titulo, autor: p.criadaPor ?? ROTULO_ORIGEM[p.origem] },
      ...(p.concluidaEm ? [{ id: `fim-${p.id}`, em: p.concluidaEm, tipo: "Review completed", texto: `${p.titulo} · ${p.desfecho ? ROTULO_DESFECHO[p.desfecho] : "Completed"}`, autor: p.concluidaPor ?? "Care team" }] : []),
    ]),
    ...paciente.mensagens.filter(m => m.autor === 'profissional').map(m => ({ id: m.id, em: m.em, tipo: m.pendenciaId ? "Reply linked to request" : "Team message", texto: m.texto, autor: m.nomeAutor })),
    ...paciente.documentos.map(d => ({ id: d.id, em: d.data, tipo: "Document released", texto: d.titulo, autor: d.liberadoPor })),
  ].sort((a,b) => b.em.localeCompare(a.em));
  return <section className="patient-history" aria-label="Patient history"><p className="form-description">Records available in this demo, newest first.</p>
    {eventos.length ? <ol>{eventos.map(e => <li key={e.id}><time dateTime={e.em}>{dataHoraCurta(e.em)}</time><div><strong>{e.tipo}</strong><p>{e.texto}</p><small>{e.autor}</small></div></li>)}</ol> : <p>No records available.</p>}
  </section>;
}
