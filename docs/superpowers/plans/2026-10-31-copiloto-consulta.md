# English integration and consultation copilot implementation plan

> Execute inline with superpowers:executing-plans and test-driven-development; one independent review at the end.

**Goal:** preserve daily team workflows in the English demo, then deliver the first consultation-to-approved-journey cycle.
**Architecture:** existing React/Express MVP, fictional transcript/extraction fixture, server-owned review state and atomic validated decisions.
**Tech stack:** TypeScript, React 19, Express, node:test/tsx and Playwright CLI; no new runtime dependencies.
**Spec:** `docs/superpowers/specs/2026-10-31-copiloto-consulta-design.md`.

## Global constraints

- English UI, dates and speech. Fictional data only; no external provider calls in tests or copilot.
- Preserve daily workflow, drafts, retry behavior and URL navigation.
- Pending/rejected items and transcripts never enter the patient projection.
- Doctor review required; originals, reviewer and linked records remain traceable.
- Validate first, mutate once; repeated decisions return 409 without duplicates.

## Review focus

- Patient/user switch during review must not submit into another patient's consultation.
- Invalid/stale decisions must leave task, journey and item state unchanged.
- Malformed JSON, unsupported categories and fabricated evidence cannot enter the review queue.
- Failed submissions retain edits; repeated clicks cannot create duplicates.
- Narrow screens, long quotes and keyboard dialogs remain usable.

## Task 1 — Integrate English and daily workflow

Files: conflicted `src/` files, new daily workflow components, server task/reminder validation, existing API and browser scenarios.

- [x] Resolve merge preserving daily-workflow behavior; translate all added strings and formatting.
- [x] Update existing behavioral tests to English seed values; lint, build, 5 API tests and browser smoke for tasks/reminders/drafts.
- [x] Commit the verified merge locally (`ec1e72a`).

## Task 2 — Consultation domain and API

Files: `src/consulta.ts`, `server/copiloto.ts`, `server/copiloto.test.ts`, `server/estado.ts`, `server/rotas.ts`, `server/configServico.ts`, `fixtures/consultas/maria-en.json`.
Interfaces: GET/POST `/api/pro/pacientes/:id/consulta` returns `ConsultaCopiloto`; POST `/api/pro/pacientes/:id/consulta/itens/:itemId/revisao` accepts `RevisaoItem`; both require demo team identity. Review endpoint requires doctor role.

- [x] Write failing HTTP tests for fixture loading/idempotence, patient isolation, approval links, rejection, permissions, invalid/duplicate decisions and reset.
- [x] Implement fixture verification and patient-scoped review state, server-owned defaults and atomic decisions.
- [x] Run full MVP API suite and type check; commit.

## Task 3 — Review interface and integrated rehearsal

Files: `src/components/ConsultaCopiloto.tsx`, `src/components/RevisaoConsultaDialog.tsx`, `src/components/DetalhePaciente.tsx`, `src/copiloto.css`, `src/main.tsx`, browser scenario `work/copiloto-check/fluxo.js`, README.

- [x] Observe browser failure for missing Consultation tab.
- [x] Add transcript/suggestion workspace and accessible approve/edit/reject dialog with owner/deadline/step confirmation and retained inline errors.
- [x] Verify doctor approval → My day task → patient journey, non-doctor access restriction, rejection, retry, navigation, English copy and 390/1440 widths.
- [x] Run lint, build and API suite, obtain independent branch review, fix material findings and save local commits/working preview.

## Execution ledger

- Starting HEAD: `b08c96a`; fetched main: `4c50280`. Existing isolated worktree was clean before merge.
- User authorization covers the integration and first copilot flow described above; execute routine implementation choices inline.
- Task 1 verification: lint/build and 5 daily-workflow API tests passed. Browser passed English task creation, own-task filtering/reload, cross-patient draft isolation, direct reminder and English Lia input. Existing preview HMR port collision is avoided for the final preview with `DISABLE_HMR=true`.
- Task 2 RED: 7 HTTP tests fail on missing consultation endpoints (404); no domain implementation existed at this point.
- Task 2 complete: 14/14 MVP tests and lint passed. Additional RED→GREEN checks cover structured malformed-JSON errors and malformed extraction categories. Reads and reviews are physician-only; confirmed tasks remain available to navigation.
- Task 3 RED: browser waits for missing Consultation tab and fails before interface implementation.
- Task 3 implemented: browser passed edited approval, retained review after HTTP 503, linked task in My day, patient journey publication, rejection, reload, native dialog focus/Esc, 390 px overflow and isolation from another patient's fixture. Lint, build and 14/14 API tests passed. Desktop/mobile screenshots inspected.
- Final preview uses the production build on port 3110, avoiding shared development HMR ports.
- Independent review: no Critical findings; one Important checkbox layout issue and one residual English-copy issue. Production browser confirmed all three rehearsal scenarios, profile/patient switching and zero page errors.
- Review reproduction RED: at 390 px the open dialog measured clientWidth 360 and scrollWidth 400; checkbox labels overflowed by 56–60 px. Exclude checkboxes from the generic text-field selector and verify the expanded dialog before finishing.
- Review copy correction: translate the linked-reply caption to meet the English integration requirement; include the actual linked-reply flow in the browser rehearsal.
- Final: fixed checkbox layout — `work/copiloto-check/dialogo.js` RED→GREEN, expanded review fields fit at 390 px. Screenshot inspected. Full suite 14/14, lint and production build passed after the correction.
- Final browser verification: all four scenarios passed against the production build (integration including linked reply, complete consultation cycle, patient/profile context, open mobile dialog). No runtime page errors observed in the clean production session.
- Delivery: keep local branch and existing worktree for iteration; preview at `http://127.0.0.1:3110`. No push or deployment performed. Real authentication, durable persistence and live recording/AI remain outside this explicitly fictional first slice.
