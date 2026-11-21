import React, { useState } from 'react';
import { Check, HandHeart } from 'lucide-react';
import { CATEGORIAS_BARREIRA, type CategoriaBarreira } from '../barreiras';
import { Cabecalho } from './telas';

export const TelaBarreiras: React.FC<{
  ocupado: boolean;
  onVoltar: () => void;
  onPreparar: (categoria: CategoriaBarreira, texto: string) => Promise<boolean>;
}> = ({ ocupado, onVoltar, onPreparar }) => {
  const [categoria, setCategoria] = useState<CategoriaBarreira | null>(null);
  const [texto, setTexto] = useState('');
  return (
    <div className="pb-8 space-y-4">
      <Cabecalho titulo="Preciso de ajuda" onVoltar={onVoltar} />
      <div className="rounded-2xl bg-gelo p-5 space-y-2">
        <HandHeart className="w-8 h-8 text-verde" aria-hidden />
        <h2 className="text-xl font-bold text-azul">O que está dificultando sua próxima etapa?</h2>
        <p className="text-tinta-suave">Conte para a navegação. A equipe vai analisar com você como ajudar.</p>
      </div>
      <fieldset className="space-y-3" disabled={ocupado}>
        <legend className="font-semibold mb-3">Escolha a principal dificuldade</legend>
        <div className="grid grid-cols-2 gap-3">
          {(Object.entries(CATEGORIAS_BARREIRA) as [CategoriaBarreira, typeof CATEGORIAS_BARREIRA[CategoriaBarreira]][]).map(([valor, item]) => (
            <button key={valor} type="button" aria-pressed={categoria === valor}
              onClick={() => { setCategoria(valor); setTexto(item.exemplo); }}
              className={`min-h-16 p-3 rounded-xl border-2 text-left font-semibold cursor-pointer flex items-center justify-between gap-2 ${categoria === valor ? 'border-verde bg-gelo' : 'border-linha bg-white'}`}>
              {item.rotulo}{categoria === valor && <Check className="w-5 h-5 shrink-0 text-verde" aria-hidden />}
            </button>
          ))}
        </div>
        <label htmlFor="relato-barreira" className="block font-semibold pt-2">Conte com suas palavras</label>
        <textarea id="relato-barreira" value={texto} onChange={e => setTexto(e.target.value)} maxLength={1000} rows={4}
          placeholder="O que aconteceu e como podemos ajudar?"
          className="w-full rounded-xl border border-linha bg-white p-3 text-azul focus:outline-none focus:ring-2 focus:ring-verde" />
      </fieldset>
      <p className="text-sm text-tinta-suave">Você vai revisar com a Lia antes de enviar. Sua equipe de cuidado poderá ver este relato.</p>
      <button type="button" disabled={!categoria || !texto.trim() || ocupado}
        onClick={() => categoria && onPreparar(categoria, texto)}
        className="w-full min-h-14 rounded-xl bg-azul text-white font-bold px-4 py-3 disabled:opacity-40 cursor-pointer">
        {ocupado ? 'Preparando…' : 'Revisar com a Lia'}
      </button>
      <p className="text-xs text-tinta-suave">Este pedido não é um canal de emergência. Demonstração com dados fictícios.</p>
    </div>
  );
};
