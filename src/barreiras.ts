// Categorias administrativas da demonstração, escolhidas ou confirmadas pelo paciente.
export const CATEGORIAS_BARREIRA = {
  transporte: { rotulo: 'Transporte', exemplo: 'Não tenho transporte para chegar à minha próxima consulta.' },
  trabalho: { rotulo: 'Trabalho', exemplo: 'Não consigo liberação do trabalho para minha próxima consulta.' },
  documentacao: { rotulo: 'Documentação', exemplo: 'Estou sem os documentos necessários para minha próxima etapa.' },
  agendamento: { rotulo: 'Agendamento', exemplo: 'Não consigo agendar meu próximo exame.' },
  acompanhante: { rotulo: 'Acompanhante', exemplo: 'Não tenho acompanhante para ir à minha próxima consulta.' },
  outro: { rotulo: 'Outra dificuldade', exemplo: 'Preciso de ajuda para seguir minha próxima etapa do cuidado.' },
} as const;

export type CategoriaBarreira = keyof typeof CATEGORIAS_BARREIRA;

export function categoriaBarreiraValida(valor: unknown): valor is CategoriaBarreira {
  return typeof valor === 'string' && Object.hasOwn(CATEGORIAS_BARREIRA, valor);
}
