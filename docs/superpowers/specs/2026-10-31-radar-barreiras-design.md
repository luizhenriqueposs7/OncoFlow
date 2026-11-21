# Radar de barreiras — demo

Autorização: implementar a primeira ideia aprovada pelo usuário, com pitch em 30 minutos.

O paciente informa transporte, trabalho, documentação, agendamento, acompanhante ou outra dificuldade por tela ou Lia. A confirmação mostra categoria, fala literal e próxima etapa. Só confirmar cria uma solicitação para navegação, com prazo ilustrativo da configuração do serviço.

O Pro ganha um Radar de barreiras, com solicitações abertas, em acompanhamento e resolvidas. A equipe assume, valida e registra uma solução em texto antes de concluir. A solução assinada pela equipe e o status ficam visíveis ao paciente. Encaminhar ou contatar não equivale a resolver.

Abordagens: módulo independente exigiria duplicar estados e confirmação; adaptar pendências, Lia e visões existentes entrega o ciclo integrado com menos mudanças. Escolha técnica: reutilizar o fluxo existente.

Restrições: preservar alterações locais; sem dependências novas; manter dados fictícios, estado em memória, urgência antes da classificação e informação clínica sob responsabilidade da equipe. Sem integração hospitalar, novo hardware ou expansão de escopo.

Validação: testes de confirmação, cancelamento, expiração, categorias, urgência e solução; lint/build; fluxo completo no navegador em celular e desktop.
