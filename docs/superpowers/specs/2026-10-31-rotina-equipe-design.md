# Rotina da equipe e ações úteis

Luiz aprovou iniciar a proposta discutida com “boa pode começar”. Esta rodada entrega a rotina diária, contexto do paciente e ações de acompanhamento no MVP existente, preservando a identidade da capa e a separação Pro/Paciente.

## Direção escolhida

Foram discutidos três caminhos: rotina da equipe (ganho imediato sobre dados existentes), módulo de consulta (transcrição e validação, um fluxo novo maior) e acompanhamento (responsáveis, solicitações e retornos). A recomendação aprovada foi começar pela rotina e pelas falhas essenciais, com lembretes visuais para o paciente.

## Comportamento

- Início do Pro vira “Meu dia”: fila operacional ordenada pelo prazo, filtros Todas/Minhas/Vencidas, próximos compromissos e atalhos para paciente, resposta e tarefa. Não calcula prioridade clínica.
- Pendências permitem abrir o paciente certo, responder com contexto e consultar histórico. Criar tarefa é ação manual da equipe com paciente, título, motivo, profissional responsável e prazo futuro explícitos. Não publica o conteúdo interno ao paciente.
- Histórico do paciente reúne registros e transições existentes, com data, origem e responsável disponíveis; não inventa eventos.
- Rascunhos ficam apenas na memória da sessão e separados por paciente e contexto. Falha mantém o texto e permite tentar novamente; polling não apaga erro de escrita. Saída do perfil limpa os rascunhos.
- Página, paciente, aba e filtros do Pro e tela/documento do Paciente são restauráveis pela URL e pelos botões Voltar/Avançar. Nenhum identificador de paciente determina a sessão da API do Paciente.
- Agenda do paciente cria lembrete para compromisso específico, após confirmação visual, com antecedência de 1 dia ou 2 horas. Backend valida posse, data e duplicidade. A demo salva na agenda, sem prometer entrega de notificação.
- Lia preserva o bloco completo da resposta e rascunhos de voz em falha. O orbe diminui com resposta/confirmação. Diálogos e abas funcionam por teclado; cartões do Pro empilham ações no celular.

## Limites e validação

React/TypeScript/Express em memória e dependências existentes. Dados fictícios. APIs Pro e Paciente continuam separadas. Nenhuma mensagem externa, fornecedor de voz ou integração hospitalar nos testes. O backend FastAPI experimental é preservado. Verificar regressões reproduzidas, tarefas/lembretes reais do servidor, histórico, URL, teclado, fonte ampliada, celular e confirmação da Lia; lint/build e revisão independente antes da entrega.
