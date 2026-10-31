# Rotina da equipe — Implementation Plan

> Execute inline usando executing-plans; uma revisão independente ao final.

**Goal:** tornar o MVP útil para a rotina diária, com ações que persistem no servidor da demo e contexto confiável.
**Architecture:** manter Express em memória e os contratos separados; acrescentar operações manuais pequenas, componentes por responsabilidade e navegação via History API sem dependência nova.
**Tech Stack:** React 19, TypeScript, SVG/CSS, Express, node:test/tsx e Playwright CLI.
**Spec:** `docs/superpowers/specs/2026-10-31-rotina-equipe-design.md`.

## Global Constraints

- Dados fictícios; nenhuma chamada real a provedores de voz nos testes.
- Nenhuma nova dependência de runtime; preservar backend FastAPI experimental.
- Tarefa interna não aparece na visão do paciente. Lembrete usa a sessão, não paciente enviado no corpo.
- Sem afirmação de integração, notificação externa ou conformidade para uso clínico.
- Logo, paleta e orbe existentes; PT-BR, movimento reduzido, fonte ajustável e controles de teclado.

## Review Focus

- Troca de paciente durante envio: limpar apenas o rascunho correspondente, preservar outro contexto.
- Falha de escrita seguida de polling: erro permanece e nenhuma mensagem é perdida.
- Tarefa interna e resposta vinculada: validação de paciente e ausência de vazamento ao Paciente.
- Compromisso próximo, inválido ou já com lembrete: nenhum horário passado ou duplicado.
- Voltar/Avançar, URL inválida, modal em celular e texto ampliado: contexto recuperável e conteúdo acessível.

## Tasks

### 1. Contexto, rascunhos e falhas de envio

Files: `src/lib/navegacao.ts`, `src/components/RascunhosPro.tsx`, `src/components/Dialogo.tsx`, `src/App.tsx`, `src/api/pro.ts`, `src/components/ChatView.tsx`, `src/paciente/{PacienteApp,TelaLia,TelaVozLia,api}.tsx/ts`.
Interfaces: URL params pagina/paciente/aba/fila/solicitacao and tela/documento; mutating API actions return success boolean; drafts keyed by patient/context in memory.

- [x] Reproduce draft transfer, send failure, incomplete voice response and reload navigation against baseline in browser.
- [x] Implement URL hook, session draft provider, reliable send result/error handling and complete voice response block.
- [x] Verify switching patients, retry after polling, URL refresh/back and voice review retention; lint/build.

### 2. Operações reais de tarefas e lembretes

Files: `src/types.ts`, `server/{estado,rotas,configServico,visoes}.ts`, `server/rotina.test.ts`, `src/api/pro.ts`, `src/paciente/api.ts`.
Interfaces: `POST /api/pro/pacientes/:id/tarefas` with titulo/motivo/responsavelId/prazo; existing message endpoint accepts optional pendenciaId; `POST /api/paciente/lembretes` with compromissoId/antecedenciaMinutos.

- [x] Write API tests; observe missing endpoints fail on expected 201/200.
- [x] Validate manual creation, assignment, future deadline, message ownership, reminder ownership/antecedence/idempotence; audit IDs/actions only.
- [x] Verify API tests, invalid inputs and patient projection; type check.

### 3. Meu dia, fila acionável e histórico

Files: `src/components/{MeuDia,NovaTarefaDialog,HistoricoPaciente}.tsx`, `src/components/{PaginaPendencias,Pendencias,DetalhePaciente,Sidebar,Topo,InternoView}.tsx`, `src/rotina.css`, `src/main.tsx`.
Consumes: API actions and URL navigation. Produces daily queue, filtering, patient/task/reply shortcuts, task creation and chronological history.

- [x] Browser scenario fails for missing daily queue/new task.
- [x] Build queue, upcoming appointments, filters, new task form and contextual reply; integrate patient tabs/history and keyboard controls.
- [x] Verify task creation, mine/overdue filters, opening correct patient, linked response, history and mobile layout.

### 4. Agenda visual, acessibilidade e entrega

Files: `src/paciente/LembreteDialog.tsx`, `src/paciente/telas.tsx`, `src/components/PlanoTerapeuticoModal.tsx`, shared Dialogo and styles; browser scenarios under `work/rotina-check`.

- [x] Browser scenario fails for direct reminder creation and keyboard dialog behavior.
- [x] Add reminder review/create state, request history, complete voice presentation and accessible dialogs; stack mobile actions.
- [x] Run API tests, lint/build, end-to-end scenarios, 320/390/768/1440 widths, enlarged font and reduced motion.
- [x] Fresh whole-branch review; fix confirmed important findings, rerun relevant checks and open the working preview.

## Execution ledger

Base: `8c3be3f`. Isolated worktree `work/oncoflow-rotina`, branch `codex/rotina-equipe`.
Ruling: execute in this session following the user's explicit start authorization; no extra approval gate for routine implementation choices. Independent review at the end.
Pre-flight: task 1's URL/actions are consumed by tasks 3/4; task 2's validated domain actions by tasks 3/4. Keep API success/error semantics explicit across those boundaries.


## Completion evidence

- Baseline lint/build passed. API tests were RED (missing task/reminder endpoints and absent reply ownership validation), then all 4 HTTP tests passed after implementation.
- Browser baseline was RED for cross-patient draft transfer, URL context and lost failed-send text; all became GREEN.
- Full browser flow passed manual task creation, own/overdue filtering, exact patient navigation, contextual reply stored with pendenciaId, history, reminder creation for the selected exam, reload and browser Back for documents, complete voice answer and native dialog focus/Esc.
- Layout/keyboard checks passed at 320, 390, 768 and 1440 px for Meu dia, task dialog, patient detail, plan dialog, agenda/reminder and enlarged patient font. Reduced motion passed; no page errors in that scenario.
- Whole-branch review identified home search and editing during delayed voice send as Important; both were reproduced RED then GREEN. Also fixed context-scoped late-send status and correct hypothesis provenance in history. Targeted reviewer recheck: ready for agreed demo scope, no remaining Critical/Important findings.
- Synthetic microphone fixture verified browser Back stops actual MediaStream tracks and pending voice review/re-record controls are locked. No physical microphone or external transcription/TTS provider validation.
- Existing experimental Python backend and dependency manifests unchanged. New task content excluded from patient projection; reminder derives patient from demo session; linked reply validates task ownership; audit records IDs/actions without task text.

Ruling: generated screenshots/patch excluded from Git to keep the branch focused on source and replayable scenarios. Current authorization covers local implementation and review; retain the branch/worktree for iteration.
