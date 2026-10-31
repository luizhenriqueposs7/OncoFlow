# Consultation copilot: first working demo

The user authorized integrating the existing daily workflow with the English MVP and then starting the consultation copilot. Work stays in `work/oncoflow-rotina`, on `codex/rotina-equipe`.

## Approach

Extend the working Express/React demo, using a fixed fictional consultation and extraction fixture. This gives a complete, repeatable approval flow without external credentials. The alternative, building against the experimental FastAPI apps now, would duplicate the current working interface. Live transcription and LLM extraction remain a later provider integration.

## Behavior

- Keep daily queue, task ownership, reminders, draft isolation, recoverable errors and URL navigation. All demo-facing copy, dates and speech use US English, matching main.
- Add a Consultation tab in the selected patient's workspace, with a clear patient identity. Only Maria has a fictional consultation fixture; other patients show an explicit empty state.
- Loading the sample produces transcript segments and evidence-backed suggestions. Clearly label this as a simulated transcript and recorded extraction; no microphone is used and no live AI is claimed.
- Each pending item shows original text, category, literal quote, speaker and timestamp. A doctor can edit and approve, approve unchanged, or reject with a reason. Consultation content and decisions are physician-only; other team members work with the confirmed follow-up tasks.
- Approval optionally creates a navigation task (default owner and 72-hour deadline from service configuration, editable by the doctor) and a patient-facing journey step with doctor-confirmed title and description. Only a confirmed item can create either.
- Validate every field before changing any state. Repeated approval is rejected with 409 and never duplicates tasks/steps. Preserve original extracted text, reviewer, decision time and linked record IDs.
- Patient APIs never include transcripts or pending/rejected items; only explicitly approved journey steps appear. Audit metadata contains IDs/actions, not consultation text.
- Reset restores the initial journey, deletes consultation review state and allows a new rehearsal.

## Boundaries

Fictional demo only; existing in-memory persistence and demo identification remain. No recording, external AI, prescriptions, diagnoses, clinical priority decisions or external notification delivery. Existing experimental backend is preserved. Use existing brand tokens and native dialog pattern, responsive layouts, keyboard access and inline errors retaining review fields.

## Acceptance

Approve Maria's concern about future fertility, create a task for navigation and a step titled “Fertility support discussion”, then see the task in My day and the step in the patient's journey. Before approval neither exists; rejected items never create them. Non-doctors and invalid/repeated decisions cannot bypass this boundary.
