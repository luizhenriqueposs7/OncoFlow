# Radar de barreiras Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Entregar um ciclo demonstrável de dificuldade relatada até solução da navegação.

**Architecture:** Reutilizar propostas da Lia e Pendencia; categoria e contexto da agenda via dados compartilhados. A visão do paciente expõe somente seu pedido e solução da equipe.

**Tech Stack:** React, TypeScript, Express, node:test via tsx; nenhuma dependência nova.

**Spec:** ../specs/2026-10-31-radar-barreiras-design.md

## Global Constraints

- Preservar alterações locais; dados fictícios; prazo configurado; confirmação antes de escrita; urgência tem precedência.
- Executar diretamente no workspace da demo, sem alterar o servidor existente até a versão estar verificada.

## Review Focus

- Mensagem com sintoma urgente e dificuldade mantém o fluxo de urgência.
- Cancelamento, expiração ou repetição de token não cria solicitação.
- Texto com dificuldade não vira reagendamento automático.
- Conclusão exige responsável e solução humana, visível apenas ao paciente correspondente.
- Falhas de envio mantêm o formulário e não mostram sucesso.

### Task 1: Domínio e API

**Files:** src/types.ts, src/barreiras.ts, server/{lia,estado,rotas,visoes,configServico}.ts, server/barreiras.test.ts

**Interfaces:** propostaBarreira(paciente, categoria, texto); concluirPendencia(id, usuario, desfecho, solucao?); POST /api/paciente/barreiras/proposta.

- [x] Escrever e executar testes do ciclo antes da implementação (falha esperada: proposta de barreira ausente).
- [x] Implementar categoria, proposta, contexto, confirmação, conclusão com solução e visão pública.
- [x] Executar testes: `npx tsx --test server/barreiras.test.ts` (zero falhas).

### Task 2: Interfaces e pitch

**Files:** src/paciente/{TelaBarreiras,PacienteApp,telas,TelaLia,api}.tsx/ts, src/components/{EquipeView,Pendencias,PacienteCard}.tsx, src/api/pro.ts, README.md.

**Interfaces:** consumir contratos da Task 1, reaproveitando PendenciaItem.

- [x] Formulário com categorias e confirmação na Lia; status e solução no início.
- [x] Aba Radar de barreiras, assumir e registrar solução.
- [x] Testar fluxo completo no navegador e larguras 390/1440; executar npm test, npm run lint e npm run build.
- [x] Registrar roteiro de um minuto no README; manter alterações disponíveis no workspace para apresentação.

Pre-flight: Task 2 usa os tipos e contratos da Task 1; assinaturas alinhadas com a spec.

## Verificação e decisões

- Revisão independente: corrigidos urgência antes do bloqueio de conversa profissional; relato novo começando com “não” durante proposta anterior; contexto do compromisso. Os três casos tiveram testes reproduzindo falha antes da correção; suíte 10/10.
- Navegador: transporte → confirmação → radar → Carla assume → status atualizado no paciente → solução registrada → solução visível ao paciente. Seis opções conferidas. Paciente em 390 px e Pro em 1440 px sem transbordamento nas novas telas.
- Falha de conexão: formulário preserva categoria e relato, não navega nem mostra sucesso. Erro de rede traduzido para português.
- Lint limitado aos arquivos do produto (src, server, server.ts, vite.config.ts), para não compilar experimentos independentes em work/.
- Fluxo da demo permanece no workspace existente, sem commits, alteração de arquivos preexistentes de outputs/work, migração ou publicação.
