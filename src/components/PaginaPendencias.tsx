import React from 'react';
import type { EstadoPro, UsuarioEquipe } from '../types';
import type { AcoesPro } from '../api/pro';
import { PendenciaItem } from './Pendencias';
import { FiltrosFila } from './MeuDia';
import { filaDaEquipe, type FiltroFila } from '../lib/rotina';

export function PaginaPendencias({ estado, acoes, usuario, filtro, onFiltrar, onAbrir, onNovaTarefa }: {
  estado: EstadoPro; acoes: AcoesPro; usuario: UsuarioEquipe; filtro: FiltroFila;
  onFiltrar: (f: FiltroFila) => void; onAbrir: (id: string, aba?: string, pendenciaId?: string) => void; onNovaTarefa: () => void;
}) {
  const itens = filaDaEquipe(estado.pacientes, usuario, filtro);
  return <section className="work-surface task-page"><header className="surface-heading"><div><h2>Team follow-ups</h2><p>Owners, deadlines and next steps in one place.</p></div><button type="button" className="work-primary" onClick={onNovaTarefa}>New task</button></header>
    <FiltrosFila filtro={filtro} onFiltrar={onFiltrar} />
    <details className="service-rules"><summary>Review rules for this demo</summary><p>{estado.regrasRevisao.map(r => r.descricao).join(' · ')}. Illustrative criteria, to be defined with the service.</p></details>
    {itens.length ? <div className="space-y-4">{itens.map(({ pendencia: p, paciente }) => <PendenciaItem key={p.id} pendencia={p} nomePaciente={paciente.nome} onAssumir={acoes.assumirPendencia} onConcluir={acoes.concluirPendencia} onAbrir={() => onAbrir(paciente.id, 'resumo', p.id)} onResponder={p.confirmadaPeloPaciente ? () => onAbrir(paciente.id, 'comunicacao', p.id) : undefined} />)}</div> : <div className="work-empty"><strong>No follow-ups match this filter.</strong><p>Choose another filter or create a team task.</p></div>}
  </section>;
}
