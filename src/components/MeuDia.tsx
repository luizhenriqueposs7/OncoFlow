import React from 'react';
import { ArrowRight, CalendarDays, Clock, Plus, Users } from 'lucide-react';
import type { EstadoPro, UsuarioEquipe } from '../types';
import { filaDaEquipe, type FiltroFila } from '../lib/rotina';
import { descreverPrazo, ROTULO_TIPO } from './Pendencias';
import { dataCompromisso } from './proUtil';

export function FiltrosFila({ filtro, onFiltrar }: { filtro: FiltroFila; onFiltrar: (f: FiltroFila) => void }) {
  return <div className="queue-filters" role="group" aria-label="Filter work">{([
    ['todas', 'All'], ['minhas', "My tasks"], ['vencidas', "Overdue"], ['sinais', "Signs to review"],
  ] as const).map(([valor, rotulo]) => <button type="button" key={valor} aria-pressed={filtro === valor} onClick={() => onFiltrar(valor)}>{rotulo}</button>)}</div>;
}
interface Props {
  estado: EstadoPro; usuario: UsuarioEquipe; filtro: FiltroFila;
  onFiltrar: (f: FiltroFila) => void; onNovaTarefa: () => void;
  onAbrir: (id: string, aba?: string, pendenciaId?: string) => void; onVerFila: () => void; onVerPacientes: () => void;
}
export function MeuDia({ estado, usuario, filtro, onFiltrar, onNovaTarefa, onAbrir, onVerFila, onVerPacientes }: Props) {
  const fila = filaDaEquipe(estado.pacientes, usuario, filtro);
  const abertas = filaDaEquipe(estado.pacientes, usuario, 'todas');
  const vencidas = filaDaEquipe(estado.pacientes, usuario, 'vencidas').length;
  const minhas = filaDaEquipe(estado.pacientes, usuario, 'minhas').length;
  const compromissos = estado.pacientes.flatMap(paciente => paciente.agenda.map(compromisso => ({ paciente, compromisso })))
    .filter(({ compromisso }) => Date.parse(compromisso.dataHora) > Date.now()).sort((a,b) => a.compromisso.dataHora.localeCompare(b.compromisso.dataHora)).slice(0, 4);
  return <div className="daily-workspace">
    <div className="work-heading"><div><h2>My day</h2><p>Organize follow-ups and next steps for your team.</p></div>
      <button type="button" className="work-primary" onClick={onNovaTarefa}><Plus size={18} aria-hidden />New task</button></div>
    <div className="work-summary">
      <button type="button" onClick={() => onFiltrar('todas')}><span>To follow up</span><strong>{abertas.length}</strong><small>open follow-ups</small></button>
      <button type="button" onClick={() => onFiltrar('vencidas')} className={vencidas ? 'has-overdue' : ''}><span>Overdue</span><strong>{vencidas}</strong><small>awaiting review</small></button>
      <button type="button" onClick={() => onFiltrar('minhas')}><span>Assigned to you</span><strong>{minhas}</strong><small>assigned tasks</small></button>
    </div>
    <div className="daily-columns">
      <section className="work-surface" aria-labelledby="fila-titulo"><header className="surface-heading"><div><h3 id="fila-titulo">Your work queue</h3><p>Ordered by service deadline.</p></div><span className="count-tag">{fila.length}</span></header>
        <FiltrosFila filtro={filtro} onFiltrar={onFiltrar} />
        {fila.length === 0 ? <div className="work-empty"><Clock size={24} aria-hidden /><strong>No tasks match this filter.</strong><p>View all follow-ups or create a task.</p><button type="button" className="work-secondary" onClick={() => onFiltrar('todas')}>View all</button></div>
          : <div className="daily-queue">{fila.slice(0, 5).map(({ paciente, pendencia: p }) => {
            const prazo = descreverPrazo(p.prazo);
            return <article key={p.id} className="daily-task"><div className="daily-task-meta"><span>{ROTULO_TIPO[p.tipo]}</span><span className={prazo.atrasada ? 'deadline overdue' : 'deadline'}><Clock size={13} aria-hidden />{prazo.texto}</span></div>
              <h4>{p.titulo}</h4><p className="task-patient">{paciente.nome}</p><p className="task-owner">Owner: {p.responsavel ?? "unassigned"}</p>
              <div className="task-actions"><button type="button" className="work-secondary" onClick={() => onAbrir(paciente.id, 'resumo', p.id)}>Open patient <ArrowRight size={15} aria-hidden /></button>
                {p.confirmadaPeloPaciente && <button type="button" className="work-link" onClick={() => onAbrir(paciente.id, 'comunicacao', p.id)}>Reply to request</button>}</div>
            </article>;
          })}</div>}
        <button type="button" className="work-link full-row" onClick={onVerFila}>Open full queue <ArrowRight size={16} aria-hidden /></button>
      </section>
      <aside className="work-surface"><header className="surface-heading"><div><h3>Upcoming appointments</h3><p>Appointments for patients in follow-up.</p></div><CalendarDays size={20} aria-hidden /></header>
        {compromissos.length ? compromissos.map(({ paciente, compromisso: c }) => <button type="button" key={`${paciente.id}-${c.id}`} className="upcoming-appointment" onClick={() => onAbrir(paciente.id, 'agenda')}><span>{dataCompromisso(c.dataHora)}</span><strong>{c.titulo}</strong><span>{paciente.nome}</span><small>{c.local}</small><span className="appointment-link">Open schedule <ArrowRight size={14} aria-hidden /></span></button>) : <p className="work-empty">No upcoming appointments recorded.</p>}
        <button type="button" className="work-link full-row" onClick={onVerPacientes}><Users size={16} aria-hidden />View {estado.pacientes.length} patients</button>
      </aside>
    </div>
  </div>;
}
