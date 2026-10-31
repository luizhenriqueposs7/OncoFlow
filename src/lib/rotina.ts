import type { PacientePro, UsuarioEquipe } from '../types';
export type FiltroFila = 'todas' | 'minhas' | 'vencidas' | 'sinais';
export const FILTROS_FILA: readonly FiltroFila[] = ['todas', 'minhas', 'vencidas', 'sinais'];
export function filaDaEquipe(pacientes: PacientePro[], usuario: UsuarioEquipe, filtro: FiltroFila, agora = Date.now()) {
  return pacientes.flatMap(paciente => paciente.pendencias.map(pendencia => ({ paciente, pendencia })))
    .filter(({ pendencia: p }) => p.estado !== 'concluida' && (filtro === 'todas'
      || filtro === 'minhas' && (p.responsavelId === usuario.id || p.responsavel === usuario.nome)
      || filtro === 'vencidas' && Date.parse(p.prazo) < agora
      || filtro === 'sinais' && p.tipo === 'sinal_urgencia'))
    .sort((a, b) => a.pendencia.prazo.localeCompare(b.pendencia.prazo));
}
