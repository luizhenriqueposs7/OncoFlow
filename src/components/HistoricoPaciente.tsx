import React from 'react';
import type { PacientePro } from '../types';
import { ROTULO_DESFECHO } from '../types';
import { dataHoraCurta } from './proUtil';
import { ROTULO_ORIGEM } from './Pendencias';

export function HistoricoPaciente({ paciente }: { paciente: PacientePro }) {
  const eventos = [
    ...paciente.checkins.map(c => ({ id: `check-${c.id}`, em: c.em, tipo: 'Check-in registrado', texto: c.texto || 'Registro de bem-estar', autor: 'Paciente' })),
    ...paciente.pendencias.flatMap(p => [
      { id: `criada-${p.id}`, em: p.criadaEm, tipo: p.origem === 'acao_equipe' ? 'Tarefa criada pela equipe' : 'Pendência registrada', texto: p.titulo, autor: p.criadaPor ?? ROTULO_ORIGEM[p.origem] },
      ...(p.concluidaEm ? [{ id: `fim-${p.id}`, em: p.concluidaEm, tipo: 'Revisão concluída', texto: `${p.titulo} · ${p.desfecho ? ROTULO_DESFECHO[p.desfecho] : 'Concluída'}`, autor: p.concluidaPor ?? 'Equipe' }] : []),
    ]),
    ...paciente.mensagens.filter(m => m.autor === 'profissional').map(m => ({ id: m.id, em: m.em, tipo: m.pendenciaId ? 'Resposta vinculada à solicitação' : 'Mensagem da equipe', texto: m.texto, autor: m.nomeAutor })),
    ...paciente.documentos.map(d => ({ id: d.id, em: d.data, tipo: 'Documento liberado', texto: d.titulo, autor: d.liberadoPor })),
  ].sort((a,b) => b.em.localeCompare(a.em));
  return <section className="patient-history" aria-label="Histórico do paciente"><p className="form-description">Registros disponíveis nesta demonstração, do mais recente ao mais antigo.</p>
    {eventos.length ? <ol>{eventos.map(e => <li key={e.id}><time dateTime={e.em}>{dataHoraCurta(e.em)}</time><div><strong>{e.tipo}</strong><p>{e.texto}</p><small>{e.autor}</small></div></li>)}</ol> : <p>Nenhum registro disponível.</p>}
  </section>;
}
