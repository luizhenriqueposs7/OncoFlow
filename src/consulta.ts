import type { UsuarioEquipe } from './types';

export type CategoriaConsulta = 'preocupacao' | 'preferencia' | 'necessidade_possivel';
export interface SegmentoConsulta {
  id: string;
  interlocutor: 'medico' | 'paciente' | 'acompanhante' | 'nao_identificado';
  inicioMs: number;
  texto: string;
}
export interface SugestaoConsulta {
  categoria: CategoriaConsulta;
  origem: 'dado_extraido' | 'hipotese_ia';
  textoIa: string;
  evidencias: { segmentoId: string; citacao: string }[];
}
export interface ItemConsulta extends SugestaoConsulta {
  id: string;
  estado: 'pendente_validacao' | 'confirmado' | 'rejeitado';
  modeloIa: string;
  versaoPrompt: string;
  textoValidado?: string;
  motivoRejeicao?: string;
  revisadoPor?: { id: string; nome: string };
  revisadoEm?: string;
  tarefaId?: string;
  etapaId?: string;
}
export interface ConsultaCopiloto {
  id: string;
  pacienteId: string;
  criadaEm: string;
  modo: 'fixture';
  segmentos: SegmentoConsulta[];
  itens: ItemConsulta[];
}
export interface EstadoConsulta {
  disponivel: boolean;
  consulta: ConsultaCopiloto | null;
  responsaveis: UsuarioEquipe[];
  padrao: { responsavelId: string; prazo: string };
}
export interface RevisaoItem {
  decisao: 'confirmar' | 'rejeitar';
  textoValidado?: string;
  motivoRejeicao?: string;
  tarefa?: { titulo: string; responsavelId: string; prazo: string };
  etapa?: { titulo: string; descricao: string };
}
