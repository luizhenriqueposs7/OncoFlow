import { useCallback, useSyncExternalStore } from 'react';

const EVENTO = 'oncoflow:navegacao';
function observar(callback: () => void) {
  window.addEventListener('popstate', callback);
  window.addEventListener(EVENTO, callback);
  return () => { window.removeEventListener('popstate', callback); window.removeEventListener(EVENTO, callback); };
}
export function navegarUrl(campos: Record<string, string | null>, substituir = false) {
  const url = new URL(window.location.href);
  for (const [chave, valor] of Object.entries(campos)) {
    if (valor === null || valor === '') url.searchParams.delete(chave);
    else url.searchParams.set(chave, valor);
  }
  if (url.href === window.location.href) return;
  window.history[substituir ? 'replaceState' : 'pushState'](null, '', url);
  window.dispatchEvent(new Event(EVENTO));
}
export function useUrlParam(chave: string, padrao = '') {
  const busca = useSyncExternalStore(observar, () => window.location.search, () => '');
  const valor = new URLSearchParams(busca).get(chave) ?? padrao;
  const definir = useCallback((novo: string, substituir = false) => navegarUrl({ [chave]: novo }, substituir), [chave]);
  return [valor, definir] as const;
}
export function useUrlEscolha<T extends string>(chave: string, opcoes: readonly T[], padrao: T) {
  const [valor, definir] = useUrlParam(chave, padrao);
  return [opcoes.includes(valor as T) ? valor as T : padrao, definir] as const;
}
