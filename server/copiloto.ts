// Fictional fixture provider. Live audio and model calls are deliberately separate future adapters.
import fixture from '../fixtures/consultas/maria-en.json';
import type { ConsultaCopiloto, EstadoConsulta, SegmentoConsulta, SugestaoConsulta } from '../src/consulta';
import type { UsuarioEquipe } from '../src/types';
import { CONFIG_SERVICO } from './configServico';
import { auditar, consultaDe, criarPendencia, ErroDominio, guardarConsulta, mudou, obterPaciente } from './estado';
import { USUARIOS_EQUIPE } from './seed';
import { agoraISO, gerarId, somarHoras } from './util';

const objeto = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);
const texto = (v: unknown, max = 2000): string | undefined => typeof v === 'string' && v.trim().length > 0 && v.trim().length <= max ? v.trim() : undefined;
const normalizar = (v: string) => v.toLowerCase().replace(/\s+/g, ' ').trim();
const CATEGORIAS = ['preocupacao', 'preferencia', 'necessidade_possivel'];
const PROIBIDOS = /\b(diagnos(?:is|ed|e)|compatible with|patient has|start|stop|suspend|prescribe|increase|decrease|urgent|emergency|clinical priority)\b|\b\d+(?:\.\d+)?\s*(?:mg|ml)\b/i;

export function filtrarSugestoes(segmentos: SegmentoConsulta[], candidatos: unknown[]): SugestaoConsulta[] {
  return candidatos.filter((v): v is SugestaoConsulta => {
    if (!objeto(v) || typeof v.categoria !== 'string' || !CATEGORIAS.includes(v.categoria) || !texto(v.textoIa)) return false;
    if (typeof v.origem !== 'string' || !['dado_extraido', 'hipotese_ia'].includes(v.origem)) return false;
    if (PROIBIDOS.test(String(v.textoIa)) || v.origem === 'hipotese_ia' && !String(v.textoIa).trim().endsWith('?')) return false;
    if (!Array.isArray(v.evidencias) || v.evidencias.length === 0) return false;
    return v.evidencias.every(e => {
      if (!objeto(e) || !texto(e.citacao) || typeof e.segmentoId !== 'string') return false;
      const segmento = segmentos.find(s => s.id === e.segmentoId);
      return segmento !== undefined && normalizar(segmento.texto).includes(normalizar(String(e.citacao)));
    });
  });
}

function exigirMedico(usuario: UsuarioEquipe): void {
  if (usuario.papel !== 'medico') throw new ErroDominio(403, 'consulta_restrita', 'Consultation content and review are available to physicians only.');
}

export function estadoConsulta(pacienteId: string, usuario: UsuarioEquipe): EstadoConsulta {
  exigirMedico(usuario);
  obterPaciente(pacienteId);
  auditar(usuario.id, 'leu_consulta_cuidado', pacienteId);
  return {
    disponivel: pacienteId === 'pac-maria', consulta: consultaDe(pacienteId) ?? null,
    responsaveis: USUARIOS_EQUIPE,
    padrao: {
      responsavelId: CONFIG_SERVICO.copiloto.responsavelPadraoId,
      prazo: somarHoras(agoraISO(), CONFIG_SERVICO.copiloto.prazoHoras),
    },
  };
}

export function carregarConsulta(pacienteId: string, usuario: UsuarioEquipe): EstadoConsulta {
  exigirMedico(usuario);
  obterPaciente(pacienteId);
  if (pacienteId !== 'pac-maria') throw new ErroDominio(404, 'exemplo_indisponivel', 'No sample consultation is available for this patient.');
  if (!consultaDe(pacienteId)) {
    const segmentos = structuredClone(fixture.segmentos) as SegmentoConsulta[];
    const consulta: ConsultaCopiloto = {
      id: gerarId('consulta'), pacienteId, criadaEm: agoraISO(), modo: 'fixture', segmentos,
      itens: filtrarSugestoes(segmentos, fixture.sugestoes).map(item => ({
        ...item, id: gerarId('item'), estado: 'pendente_validacao', modeloIa: 'fixture-v1', versaoPrompt: 'consulta-en-v1',
      })),
    };
    guardarConsulta(consulta);
    auditar(usuario.id, 'carregou_consulta_ficticia', consulta.id);
  }
  return estadoConsulta(pacienteId, usuario);
}

export function revisarItem(pacienteId: string, itemId: string, usuario: UsuarioEquipe, dados: unknown): EstadoConsulta {
  exigirMedico(usuario);
  const paciente = obterPaciente(pacienteId);
  const consulta = consultaDe(pacienteId);
  const item = consulta?.itens.find(i => i.id === itemId);
  if (!consulta || !item) throw new ErroDominio(404, 'item_nao_encontrado', 'Consultation item not found for this patient.');
  if (item.estado !== 'pendente_validacao') throw new ErroDominio(409, 'item_revisado', 'This item has already been reviewed. Reload the consultation to see the decision.');
  const invalido = () => new ErroDominio(400, 'revisao_invalida', 'Check the review text, decision, task owner, future deadline and patient-facing step.');
  if (!objeto(dados) || Object.keys(dados).some(k => !['decisao', 'textoValidado', 'motivoRejeicao', 'tarefa', 'etapa'].includes(k))) throw invalido();
  const em = agoraISO();
  const revisor = { id: usuario.id, nome: usuario.nome };

  if (dados.decisao === 'rejeitar') {
    const motivo = texto(dados.motivoRejeicao, 1000);
    if (!motivo || dados.tarefa !== undefined || dados.etapa !== undefined || dados.textoValidado !== undefined) throw invalido();
    Object.assign(item, { estado: 'rejeitado', motivoRejeicao: motivo, revisadoPor: revisor, revisadoEm: em });
    mudou();
    auditar(usuario.id, 'rejeitou_item_consulta', item.id);
    return estadoConsulta(pacienteId, usuario);
  }
  const validado = texto(dados.textoValidado);
  if (dados.decisao !== 'confirmar' || !validado || dados.motivoRejeicao !== undefined) throw invalido();

  // Finish all validation before any task, step or review state is changed.
  let tarefa: { titulo: string; responsavel: UsuarioEquipe; prazo: string } | undefined;
  let etapa: { titulo: string; descricao: string } | undefined;
  if (dados.tarefa !== undefined) {
    if (!objeto(dados.tarefa)) throw invalido();
    const entradaTarefa = dados.tarefa;
    const titulo = texto(entradaTarefa.titulo, 120);
    const responsavel = USUARIOS_EQUIPE.find(u => u.id === entradaTarefa.responsavelId);
    const prazo = typeof entradaTarefa.prazo === 'string' ? Date.parse(entradaTarefa.prazo) : NaN;
    if (!titulo || !responsavel || !Number.isFinite(prazo) || prazo <= Date.now()) throw invalido();
    tarefa = { titulo, responsavel, prazo: new Date(prazo).toISOString() };
  }
  if (dados.etapa !== undefined) {
    if (!objeto(dados.etapa)) throw invalido();
    const titulo = texto(dados.etapa.titulo, 120), descricao = texto(dados.etapa.descricao, 1000);
    if (!titulo || !descricao) throw invalido();
    etapa = { titulo, descricao };
  }
  const responsavelEtapa = tarefa?.responsavel ?? USUARIOS_EQUIPE.find(u => u.id === CONFIG_SERVICO.copiloto.responsavelPadraoId);
  if (etapa && !responsavelEtapa) throw invalido();

  if (tarefa) {
    const criada = criarPendencia(paciente, {
      tipo: 'tarefa', origem: 'consulta_confirmada', titulo: tarefa.titulo, motivo: validado,
      responsavelId: tarefa.responsavel.id, responsavel: tarefa.responsavel.nome, papelDestino: tarefa.responsavel.papel,
      criadaPor: usuario.nome, consultaId: consulta.id, itemConsultaId: item.id,
    });
    criada.prazo = tarefa.prazo;
    criada.estado = 'em_andamento';
    item.tarefaId = criada.id;
    auditar(usuario.id, 'criou_tarefa_consulta', criada.id);
  }
  if (etapa) {
    const id = gerarId('etapa');
    const indice = paciente.jornada.findIndex(e => e.estado === 'em_andamento');
    paciente.jornada.splice(indice < 0 ? paciente.jornada.length : indice + 1, 0, {
      id, ...etapa, estado: 'proxima', responsavel: responsavelEtapa!.nome,
    });
    item.etapaId = id;
    auditar(usuario.id, 'criou_etapa_consulta', id);
  }
  Object.assign(item, { estado: 'confirmado', textoValidado: validado, revisadoPor: revisor, revisadoEm: em });
  mudou();
  auditar(usuario.id, 'confirmou_item_consulta', item.id);
  return estadoConsulta(pacienteId, usuario);
}
