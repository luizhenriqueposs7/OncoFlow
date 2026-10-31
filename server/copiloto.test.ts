import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import express from 'express';
import { criarRotas } from './rotas';
import { resetar } from './estado';
import { tratarErroApi } from './erros';

let server: Server;
let base: string;
before(async () => {
  const app = express(); app.use(express.json()); app.use(criarRotas());
  app.use(tratarErroApi);
  server = await new Promise<Server>(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
});
after(() => new Promise<void>((resolve, reject) => server.close(e => e ? reject(e) : resolve())));
beforeEach(() => resetar());

const route = '/api/pro/pacientes/pac-maria/consulta';
async function request(path: string, body?: unknown, user = 'usr-camila') {
  return fetch(base + path, { method: body === undefined ? 'GET' : 'POST', headers: { 'content-type': 'application/json', 'x-demo-usuario': user }, body: body === undefined ? undefined : JSON.stringify(body) });
}
async function load() {
  const response = await request(route, {});
  assert.equal(response.status, 200);
  return response.json();
}
async function patient() {
  return (await fetch(base + '/api/paciente/inicio', { headers: { authorization: 'Bearer demo-maria' } })).json();
}
async function team() { return (await request('/api/pro/estado')).json(); }
const reviewRoute = (id: string) => `${route}/itens/${id}/revisao`;
const approval = () => ({
  decisao: 'confirmar', textoValidado: 'Patient reports concern about future fertility.',
  tarefa: { titulo: 'Coordinate a fertility support discussion', responsavelId: 'usr-carla', prazo: new Date(Date.now() + 72 * 3600000).toISOString() },
  etapa: { titulo: 'Fertility support discussion', descricao: 'Your navigator will contact you to organize a discussion with the team.' },
});

test('consultation content requires a physician demo identity', async () => {
  for (const user of ['', 'usr-rodrigo', 'usr-carla']) {
    const expected = user ? 403 : 401;
    assert.equal((await request(route, undefined, user)).status, expected);
    assert.equal((await request(route, {}, user)).status, expected);
    assert.equal((await request(reviewRoute('fake'), approval(), user)).status, expected);
  }
});

test('malformed review JSON returns a structured error and leaves the item pending', async () => {
  const { consulta } = await load();
  const response = await fetch(base + reviewRoute(consulta.itens[0].id), { method: 'POST', headers: { 'content-type': 'application/json', 'x-demo-usuario': 'usr-camila' }, body: '{"decisao":' });
  assert.equal(response.status, 400);
  assert.match(response.headers.get('content-type') ?? '', /application\/json/);
  assert.equal((await (await request(route)).json()).consulta.itens[0].estado, 'pendente_validacao');
});

test('fixture validation discards fabricated evidence, prohibited instructions and malformed suggestions', async () => {
  const { filtrarSugestoes } = await import('./copiloto');
  const segments = [{ id: 's1', interlocutor: 'paciente' as const, inicioMs: 0, texto: 'I need help arranging transport.' }];
  const valid = { categoria: 'necessidade_possivel', origem: 'dado_extraido', textoIa: 'Patient reports needing transport.', evidencias: [{ segmentoId: 's1', citacao: 'I need help arranging transport.' }] };
  assert.equal(filtrarSugestoes(segments, [valid]).length, 1);
  for (const candidate of [null, {}, { ...valid, categoria: ['necessidade_possivel'] }, { ...valid, origem: ['dado_extraido'] }, { ...valid, categoria: 'diagnosis' }, { ...valid, evidencias: [] }, { ...valid, evidencias: [{ segmentoId: 's1', citacao: 'Invented quote.' }] }, { ...valid, evidencias: [{ segmentoId: 'other', citacao: segments[0].texto }] }, { ...valid, textoIa: 'Start treatment at 50 mg.' }, { ...valid, origem: 'hipotese_ia' }]) {
    assert.equal(filtrarSugestoes(segments, [candidate]).length, 0);
  }
});

test('loading the fictional consultation is idempotent and never publishes pending content', async () => {
  const before = await patient();
  const first = await load(); const second = await load();
  assert.equal(first.consulta.id, second.consulta.id);
  assert.equal(first.consulta.modo, 'fixture');
  assert.equal(first.consulta.itens.length, 3);
  assert.ok(first.consulta.itens.every((i: { estado: string }) => i.estado === 'pendente_validacao'));
  assert.equal(first.padrao.responsavelId, 'usr-carla');
  assert.ok(Date.parse(first.padrao.prazo) > Date.now() + 71 * 3600000);
  assert.deepEqual((await patient()).jornada, before.jornada);
  assert.ok(!JSON.stringify(await patient()).includes('future fertility'));
  assert.ok(!JSON.stringify(await team()).includes('segmentos'));
});

test('approval preserves the extraction and links exactly one task and a patient-visible step', async () => {
  const { consulta } = await load(); const item = consulta.itens[0];
  const before = await team(); const beforePatient = await patient();
  const response = await request(reviewRoute(item.id), approval());
  assert.equal(response.status, 200);
  const result = await response.json();
  const reviewed = result.consulta.itens[0];
  assert.equal(reviewed.estado, 'confirmado');
  assert.equal(reviewed.textoIa, item.textoIa);
  assert.equal(reviewed.textoValidado, 'Patient reports concern about future fertility.');
  assert.equal(reviewed.revisadoPor.id, 'usr-camila');
  const maria = (await team()).pacientes.find((p: { id: string }) => p.id === 'pac-maria');
  const task = maria.pendencias.find((p: { id: string }) => p.id === reviewed.tarefaId);
  assert.equal(task.responsavelId, 'usr-carla');
  assert.equal(task.origem, 'consulta_confirmada');
  assert.equal(task.itemConsultaId, item.id);
  assert.equal(task.consultaId, consulta.id);
  assert.equal(maria.pendencias.length, before.pacientes.find((p: { id: string }) => p.id === 'pac-maria').pendencias.length + 1);
  const publicState = await patient();
  assert.equal(publicState.jornada.length, beforePatient.jornada.length + 1);
  assert.equal(publicState.jornada.find((s: { id: string }) => s.id === reviewed.etapaId).titulo, 'Fertility support discussion');
  assert.ok(!JSON.stringify(publicState).includes('textoIa'));
  assert.ok(!publicState.solicitacoes.some((p: { id: string }) => p.id === task.id));
  assert.equal((await request(reviewRoute(item.id), approval())).status, 409);
  assert.deepEqual((await patient()).jornada, publicState.jornada);
});

test('invalid decisions are atomic: no task, step or decision survives validation failure', async () => {
  const { consulta } = await load(); const item = consulta.itens[0];
  const before = await patient(); const originalTeam = await team();
  const valid = approval();
  const invalid = [
    null, [], { decisao: 'unknown' }, { decisao: 'confirmar', textoValidado: ' ' },
    { ...valid, tarefa: { ...valid.tarefa, responsavelId: 'missing' } },
    { ...valid, tarefa: { ...valid.tarefa, prazo: '2020-01-01T00:00:00Z' } },
    { ...valid, etapa: { titulo: ' ', descricao: 'Description' } },
    { ...valid, etapa: { titulo: 'A step', descricao: null } },
    { ...valid, tarefa: null }, { ...valid, etapa: [] },
  ];
  for (const body of invalid) {
    assert.equal((await request(reviewRoute(item.id), body)).status, 400, JSON.stringify(body));
    assert.deepEqual((await patient()).jornada, before.jornada);
    assert.deepEqual((await team()).pacientes, originalTeam.pacientes);
    assert.equal((await (await request(route)).json()).consulta.itens[0].estado, 'pendente_validacao');
  }
});

test('rejection requires a reason and never creates patient-facing effects', async () => {
  const { consulta } = await load(); const item = consulta.itens[1];
  assert.equal((await request(reviewRoute(item.id), { decisao: 'rejeitar', motivoRejeicao: ' ' })).status, 400);
  const before = await patient();
  const response = await request(reviewRoute(item.id), { decisao: 'rejeitar', motivoRejeicao: 'Not relevant for follow-up in this example.' });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.consulta.itens[1].estado, 'rejeitado');
  assert.equal(result.consulta.itens[1].motivoRejeicao, 'Not relevant for follow-up in this example.');
  assert.deepEqual((await patient()).jornada, before.jornada);
  assert.equal((await request(reviewRoute(item.id), approval())).status, 409);
});

test('another patient cannot load Maria fixture or review her items', async () => {
  const { consulta } = await load();
  const other = '/api/pro/pacientes/pac-001/consulta';
  const state = await (await request(other)).json();
  assert.equal(state.disponivel, false); assert.equal(state.consulta, null);
  assert.equal((await request(other, {})).status, 404);
  assert.equal((await request(`${other}/itens/${consulta.itens[0].id}/revisao`, approval())).status, 404);
});

test('approval without publishing keeps the patient journey unchanged and reset removes review state', async () => {
  const { consulta } = await load(); const before = await patient();
  assert.equal((await request(reviewRoute(consulta.itens[0].id), { decisao: 'confirmar', textoValidado: 'Patient reports a concern.' })).status, 200);
  assert.deepEqual((await patient()).jornada, before.jornada);
  await request('/api/demo/reset', {});
  assert.equal((await (await request(route)).json()).consulta, null);
  const next = await load();
  assert.notEqual(next.consulta.id, consulta.id);
  assert.ok(next.consulta.itens.every((i: { estado: string }) => i.estado === 'pendente_validacao'));
  assert.equal((await request(reviewRoute(consulta.itens[0].id), approval())).status, 404);
});
