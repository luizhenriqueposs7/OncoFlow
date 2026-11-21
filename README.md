# OncoFlow

Cada etapa do cuidado, conectada. Demonstração com **dados fictícios** para o MIT Hacking Medicine.

Uma plataforma, duas experiências sobre o mesmo servidor:

| Experiência | Endereço | Origem |
|---|---|---|
| **OncoFlow Pro** (equipe) | `http://localhost:3000/` | Painel do protótipo IRIS, adaptado às regras do OncoFlow |
| **OncoFlow Paciente** | `http://localhost:3000/paciente` | App do conceito OncoFlow, com a assistente Lia |

## Rodar

```bash
npm install
npm run dev
```

Abra o Pro numa aba e o app do paciente em outra (ou no celular, na mesma rede). Os dois leem o
mesmo estado no servidor e se atualizam a cada 2 segundos. O botão **Reiniciar demo** volta ao seed.

A transcrição de voz usa o Gemini e precisa de `GEMINI_API_KEY` (veja `.env.example`). Sem a chave,
a Lia e o check-in funcionam por texto e pelos chips de sugestão.

## Roteiro rápido

1. Paciente: **Falar com a Lia** → "Quando é minha próxima consulta?" → aceitar o lembrete.
2. Paciente: "Hoje estou muito cansada e preocupada com o trabalho." → **Registrar check-in**.
3. Paciente: "Quero falar com minha enfermeira." → **Pedir contato**.
4. Equipe (Enf. Rodrigo): as pendências aparecem com origem, fala literal, prazo do serviço e
   responsável. **Entrar na conversa** e responder; o app da paciente mostra quem está atendendo.

## Radar de barreiras — roteiro de 1 minuto

1. No app do paciente, abra **Preciso de ajuda** → **Transporte** → **Revisar com a Lia** → **Enviar para navegação**. Também funciona falando ou digitando: “Não tenho transporte para chegar à minha próxima consulta.”
2. No Pro, entre como **Carla Menezes** e abra **Radar de barreiras**. O relato aparece com categoria, compromisso, prazo e origem confirmada pelo paciente.
3. Clique em **Validar e assumir**. Na tela inicial da paciente, o pedido muda para “Em acompanhamento pela navegação” e mostra a responsável.
4. No Pro, preencha a solução fictícia: “Transporte confirmado com a paciente para a próxima consulta.” Clique em **Registrar solução**.
5. Volte ao início da paciente: a solução assinada pela equipe está visível. A Lia não promete transporte nem altera a consulta.

Fala para o pitch: “O OncoFlow conecta o relato à ação da equipe. Quando o transporte impede a próxima consulta, a navegação recebe, assume e acompanha até registrar uma solução que a paciente consegue ver.”

O prazo de barreiras é ilustrativo e fica em `server/configServico.ts`. O radar usa o estado em memória da demo; reiniciar o servidor ou usar **Reiniciar demo** apaga os relatos adicionados. `npm test` verifica o ciclo e as confirmações.

## O que mudou em relação ao IRIS

- A IA não responde mais sobre sintomas nem remédios. A Lia só informa o que está no sistema,
  organiza e encaminha, sempre com um de quatro status: consultado, registrado, encaminhado ou
  confirmado. Ações de escrita pedem confirmação.
- O alarme por palavra-chave virou **hipótese do sistema** para a equipe revisar. A lista de
  termos, os prazos e as regras de revisão são dados do serviço em `server/configServico.ts`.
- O estado saiu do React e foi para o servidor (`server/estado.ts`), compartilhado pelas duas
  experiências. O simulador de WhatsApp deu lugar ao app do paciente.
- Ficaram do IRIS: painel Equipe/Interno, "Assumir conversa", retorno automático da assistente após
  20 minutos sem atividade do profissional, plano terapêutico com upload, videochamada por link.

## Estrutura

```
server.ts               Express, transcrição (Gemini) e Vite
server/                 estado em memória, Lia, detector de urgência, rotas, seed e config do serviço
src/App.tsx             OncoFlow Pro (equipe)
src/components/         telas da equipe (base IRIS)
src/paciente/           OncoFlow Paciente (telas, Lia, orbe, voz)
src/types.ts            tipos compartilhados
```
