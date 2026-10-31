import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { criarRotas } from './rotas';
import { resetar } from './estado';
import type { Server } from 'node:http';

let server: Server;
let base: string;
before(async () => {
  const app = express(); app.use(express.json()); app.use(criarRotas());
  server = await new Promise<Server>(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
});
after(() => new Promise<void>((resolve, reject) => server.close(e => e ? reject(e) : resolve())));
beforeEach(() => resetar());
const pro = { 'content-type': 'application/json', 'x-demo-usuario': 'usr-camila' };
const paciente = { 'content-type': 'application/json', authorization: 'Bearer demo-maria' };
const tarefa = () => ({ titulo: 'Organizar transporte fictício', motivo: 'Detalhe interno da equipe', responsavelId: 'usr-carla', prazo: new Date(Date.now() + 86400000).toISOString() });

test('tarefa manual tem responsável, prazo e não aparece ao paciente', async () => {
  const response = await fetch(`${base}/api/pro/pacientes/pac-maria/tarefas`, { method: 'POST', headers: pro, body: JSON.stringify(tarefa()) });
  assert.equal(response.status, 201);
  const { tarefa: nova } = await response.json();
  assert.equal(nova.responsavel, 'Carla Menezes');
  assert.equal(nova.origem, 'acao_equipe');
  assert.equal(nova.papelDestino, 'navegacao');
  const publico = await (await fetch(`${base}/api/paciente/inicio`, { headers: paciente })).json();
  assert.ok(!JSON.stringify(publico).includes('Detalhe interno da equipe'));
  assert.ok(!publico.solicitacoes.some((p: { id: string }) => p.id === nova.id));
});

test('tarefa inválida não é criada: prazo passado, responsável inválido e campos vazios', async () => {
  for (const dados of [{ ...tarefa(), prazo: '2020-01-01T12:00:00Z' }, { ...tarefa(), responsavelId: 'inexistente' }, { ...tarefa(), titulo: ' ' }, { ...tarefa(), motivo: ' ' }]) {
    const response = await fetch(`${base}/api/pro/pacientes/pac-maria/tarefas`, { method: 'POST', headers: pro, body: JSON.stringify(dados) });
    assert.equal(response.status, 400);
  }
});

test('resposta vinculada valida o paciente da pendência', async () => {
  const state = await (await fetch(`${base}/api/pro/estado`, { headers: pro })).json();
  const outra = state.pacientes.find((p: { id: string }) => p.id === 'pac-001').pendencias[0];
  const response = await fetch(`${base}/api/pro/pacientes/pac-maria/mensagens`, { method: 'POST', headers: pro, body: JSON.stringify({ texto: 'Mensagem fictícia', pendenciaId: outra.id }) });
  assert.equal(response.status, 404);
});

test('lembrete visual pertence à sessão, confirma compromisso exato e evita duplicação', async () => {
  const body = JSON.stringify({ compromissoId: 'ag-m2', antecedenciaMinutos: 120 });
  for (let n = 0; n < 2; n++) {
    const response = await fetch(`${base}/api/paciente/lembretes`, { method: 'POST', headers: paciente, body });
    assert.equal(response.status, 200);
  }
  const state = await (await fetch(`${base}/api/paciente/inicio`, { headers: paciente })).json();
  const lembretes = state.lembretes.filter((l: { compromissoId: string }) => l.compromissoId === 'ag-m2');
  assert.equal(lembretes.length, 1);
  assert.match(lembretes[0].texto, /Exames de sangue/);
  for (const dados of [{ compromissoId: 'ag-j1', antecedenciaMinutos: 120 }, { compromissoId: 'ag-m1', antecedenciaMinutos: 1 }, { compromissoId: 'ag-m1', antecedenciaMinutos: 120, pacienteId: 'pac-001' }]) {
    const response = await fetch(`${base}/api/paciente/lembretes`, { method: 'POST', headers: paciente, body: JSON.stringify(dados) });
    assert.ok([400, 404].includes(response.status));
  }
});
