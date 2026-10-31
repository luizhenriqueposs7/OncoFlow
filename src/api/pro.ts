// Cliente da API do OncoFlow Pro. O estado vem do servidor (compartilhado com o app do paciente)
// e é atualizado a cada 2 segundos; as ações chamam a API e recarregam o estado em seguida.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Desfecho, EstadoPro, NovaTarefa, UsuarioEquipe } from '../types';

export async function chamarApi<T>(caminho: string, usuarioId?: string, corpo?: unknown): Promise<T> {
  const resposta = await fetch(caminho, {
    method: corpo === undefined ? 'GET' : 'POST',
    headers: {
      'content-type': 'application/json',
      ...(usuarioId ? { 'x-demo-usuario': usuarioId } : {}),
    },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  }).catch(() => { throw new Error("Could not connect. Check your connection and try again."); });
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error(dados.mensagem || "We couldn't finish that right now. Please try again in a moment.");
  }
  return dados as T;
}

export interface AcoesPro {
  recarregar: () => Promise<void>;
  assumir: (pacienteId: string) => Promise<boolean>;
  devolver: (pacienteId: string) => Promise<boolean>;
  enviar: (pacienteId: string, texto: string, pendenciaId?: string) => Promise<boolean>;
  atualizarPlano: (pacienteId: string, texto: string, atualizadoEm: string) => Promise<boolean>;
  videochamada: (pacienteId: string) => Promise<string | undefined>;
  assumirPendencia: (pendenciaId: string) => Promise<boolean>;
  concluirPendencia: (pendenciaId: string, desfecho: Desfecho) => Promise<boolean>;
  criarTarefa: (pacienteId: string, dados: NovaTarefa) => Promise<boolean>;
  resetarDemo: () => Promise<boolean>;
}

export function useEstadoPro(usuario: UsuarioEquipe | null) {
  const [estado, setEstado] = useState<EstadoPro | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [erroLeitura, setErroLeitura] = useState<string | null>(null);
  const versao = useRef(0);

  const atualizar = useCallback(async () => {
    if (!usuario) return;
    try {
      const novo = await chamarApi<EstadoPro>('/api/pro/estado', usuario.id);
      setErroLeitura(null);
      if (novo.versao !== versao.current) {
        versao.current = novo.versao;
        setEstado(novo);
      }
    } catch {
      setErroLeitura("We couldn't load right now. Trying again…");
    }
  }, [usuario]);

  useEffect(() => {
    versao.current = 0;
    atualizar();
    const timer = setInterval(atualizar, 2000);
    return () => clearInterval(timer);
  }, [atualizar]);

  const acao = useCallback(async (caminho: string, corpo: unknown = {}, erroGlobal = true): Promise<boolean> => {
    if (!usuario) return false;
    try {
      await chamarApi(caminho, usuario.id, corpo);
      if (erroGlobal) setErro(null);
      await atualizar();
      return true;
    } catch (e) {
      if (erroGlobal) setErro((e as Error).message);
      return false;
    }
  }, [usuario, atualizar]);

  const acoes: AcoesPro = {
    recarregar: atualizar,
    assumir: (id) => acao(`/api/pro/pacientes/${id}/assumir`),
    devolver: (id) => acao(`/api/pro/pacientes/${id}/devolver`),
    enviar: (id, texto, pendenciaId) => acao(`/api/pro/pacientes/${id}/mensagens`, { texto, pendenciaId }, false),
    criarTarefa: (id, dados) => acao(`/api/pro/pacientes/${id}/tarefas`, dados),
    atualizarPlano: (id, texto, atualizadoEm) => acao(`/api/pro/pacientes/${id}/plano`, { texto, atualizadoEm }),
    videochamada: async (id) => {
      if (!usuario) return undefined;
      try {
        const { link } = await chamarApi<{ link: string }>(`/api/pro/pacientes/${id}/videochamada`, usuario.id, {});
        await atualizar();
        return link;
      } catch (e) {
        setErro((e as Error).message);
        return undefined;
      }
    },
    assumirPendencia: (id) => acao(`/api/pro/pendencias/${id}/assumir`),
    concluirPendencia: (id, desfecho) => acao(`/api/pro/pendencias/${id}/concluir`, { desfecho }),
    resetarDemo: () => acao('/api/demo/reset'),
  };

  return { estado, erro: erro ?? erroLeitura, acoes };
}
