import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { mensagemDoPaciente, responderProposta, classificar } from './lia';
import { assumirPendencia, concluirPendencia, obterPaciente, propostaDe, resetar, todasPendencias, usuarioPorId } from './estado';
import { visaoPaciente } from './visoes';
import { normalizar } from './util';
import { criarRotas } from './rotas';

const maria = () => obterPaciente('pac-maria');
const barreiras = () => todasPendencias().filter(p => p.tipo === ('barreira' as string));
const relato = 'Tenho consulta amanhã, mas não tenho transporte para chegar ao hospital.';
function confirmar() {
  const proposta = propostaDe(maria().id);
  assert.equal(proposta?.acao, 'barreira');
  responderProposta(maria().id, proposta!.token, true);
  return barreiras().at(-1)!;
}

beforeEach(() => resetar());

test('transporte é proposta de barreira, sem criar solicitação antes da confirmação', () => {
  mensagemDoPaciente(maria().id, relato, 'voz');
  assert.equal(propostaDe(maria().id)?.acao, 'barreira');
  assert.equal(barreiras().length, 0);
  const p = confirmar();
  assert.equal(p.papelDestino, 'navegacao');
  assert.equal(p.falaLiteral, relato);
  assert.equal(p.confirmadaPeloPaciente, true);
  assert.equal(visaoPaciente(maria()).solicitacoes.find(s => s.id === p.id)?.estado, 'registrada');
});

test('cancelamento e confirmação expirada não criam barreira', () => {
  mensagemDoPaciente(maria().id, relato, 'texto');
  const proposta = propostaDe(maria().id)!;
  assert.equal(proposta?.acao, 'barreira');
  responderProposta(maria().id, proposta.token, false);
  assert.equal(barreiras().length, 0);
  mensagemDoPaciente(maria().id, relato, 'texto');
  const expirada = propostaDe(maria().id)!;
  expirada.expiraEm = new Date(0).toISOString();
  responderProposta(maria().id, expirada.token, true);
  assert.equal(barreiras().length, 0);
});

test('token só pode ser confirmado uma vez', () => {
  mensagemDoPaciente(maria().id, relato, 'texto');
  const token = propostaDe(maria().id)!.token;
  confirmar();
  assert.throws(() => responderProposta(maria().id, token, true));
  assert.equal(barreiras().length, 1);
});

test('barreira não é reagendamento nem dúvida clínica e não captura frases positivas', () => {
  for (const texto of ['Não posso ir porque não tenho transporte.', 'Não consigo liberação do trabalho para minha consulta.', 'Estou sem os documentos para o exame.', 'Não consigo agendar meu exame.', 'Não tenho acompanhante para ir ao hospital.']) {
    assert.equal(classificar(normalizar(texto)).tipo, 'barreira', texto);
  }
  assert.equal(classificar(normalizar('Não posso ir à consulta.')).tipo, 'reagendamento');
  assert.equal(classificar(normalizar('Tenho transporte para minha consulta.')).tipo, 'agenda');
  assert.equal(classificar(normalizar('Posso tomar remédio antes de ir trabalhar?')).tipo, 'duvida_clinica');
});

test('urgência tem precedência sobre barreira de transporte', () => {
  mensagemDoPaciente(maria().id, 'Estou com falta de ar e não tenho transporte.', 'texto');
  assert.equal(propostaDe(maria().id)?.acao, 'relato_urgencia');
  assert.equal(barreiras().length, 0);
});

test('solução exige assumir e registrar texto humano antes de concluir', () => {
  mensagemDoPaciente(maria().id, relato, 'texto');
  const p = confirmar();
  const carla = usuarioPorId('usr-carla');
  assert.throws(() => concluirPendencia(p.id, carla, 'barreira_resolvida' as any, 'Transporte confirmado com a paciente.'));
  assumirPendencia(p.id, carla);
  assert.throws(() => concluirPendencia(p.id, carla, 'encaminhado'));
  assert.throws(() => concluirPendencia(p.id, carla, 'barreira_resolvida' as any, '  '));
  const solucao = 'Transporte confirmado com a paciente para a próxima consulta.';
  concluirPendencia(p.id, carla, 'barreira_resolvida' as any, solucao);
  const pedido = visaoPaciente(maria()).solicitacoes.find(s => s.id === p.id)!;
  assert.equal(pedido.estado, 'respondida');
  assert.equal((pedido as any).solucao, solucao);
  assert.equal((pedido as any).responsavel, carla.nome);
});

test('um relato novo começando com não substitui a proposta de lembrete', () => {
  mensagemDoPaciente(maria().id, 'Quando é minha próxima consulta?', 'texto');
  assert.equal(propostaDe(maria().id)?.acao, 'lembrete');
  mensagemDoPaciente(maria().id, 'Não tenho transporte para chegar à minha próxima consulta.', 'voz');
  assert.equal(propostaDe(maria().id)?.acao, 'barreira');
});

test('contexto da barreira corresponde à consulta relatada e não aos exames', () => {
  mensagemDoPaciente(maria().id, relato, 'texto');
  const p = confirmar();
  assert.equal(p.barreira?.etapa, 'Consulta com oncologista');
});

function enviarFormulario(body: object) {
  const route = (criarRotas() as any).stack.find((r: any) => r.route?.path === '/api/paciente/barreiras/proposta').route;
  const resposta = { statusCode: 200, body: undefined as any, status(n: number) { this.statusCode = n; return this; }, json(body: unknown) { this.body = body; } };
  route.stack[0].handle({ body, header: () => 'Bearer demo-maria' }, resposta, (e: unknown) => { throw e; });
  return resposta;
}

test('formulário preserva urgência mesmo com profissional na conversa', () => {
  maria().modoConversa = 'profissional';
  const resposta = enviarFormulario({ categoria: 'transporte', texto: 'Estou com falta de ar e não tenho transporte.' });
  assert.equal(resposta.statusCode, 200);
  assert.equal(todasPendencias().filter(p => p.pacienteId === maria().id && p.tipo === 'sinal_urgencia').length, 1);
  assert.equal(barreiras().length, 0);
});

test('formulário valida categoria e limites antes de gerar proposta', () => {
  for (const body of [{ categoria: 'toString', texto: 'Ajuda' }, { categoria: 'transporte', texto: '' }, { categoria: 'transporte', texto: 'x'.repeat(1001) }]) {
    assert.equal(enviarFormulario(body).statusCode, 400);
    assert.equal(propostaDe(maria().id), undefined);
  }
});
