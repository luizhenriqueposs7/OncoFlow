import React, { createContext, useContext, useState } from 'react';

type Rascunhos = Record<string, string>;
const Contexto = createContext<{ rascunhos: Rascunhos; definir: React.Dispatch<React.SetStateAction<Rascunhos>> } | null>(null);
export function RascunhosProProvider({ children }: { children: React.ReactNode }) {
  const [rascunhos, definir] = useState<Rascunhos>({});
  return <Contexto.Provider value={{ rascunhos, definir }}>{children}</Contexto.Provider>;
}
export function useRascunhoPro(chave: string) {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("Draft outside the team session.");
  const texto = contexto.rascunhos[chave] ?? '';
  return {
    texto,
    definir: (valor: string) => contexto.definir(atual => ({ ...atual, [chave]: valor })),
    limparSeIgual: (enviado: string) => contexto.definir(atual => atual[chave] === enviado ? { ...atual, [chave]: '' } : atual),
  };
}
