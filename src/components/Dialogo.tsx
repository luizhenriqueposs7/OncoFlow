import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

export function Dialogo({ titulo, onFechar, ocupado = false, children }: {
  titulo: string; onFechar: () => void; ocupado?: boolean; children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialogo = ref.current!;
    dialogo.showModal();
    return () => dialogo.close();
  }, []);
  return <dialog ref={ref} aria-labelledby={id} className="app-dialog" onCancel={e => { e.preventDefault(); if (!ocupado) onFechar(); }}>
    <header className="dialog-heading"><h2 id={id}>{titulo}</h2>
      <button type="button" onClick={onFechar} disabled={ocupado} className="dialog-close" aria-label="Fechar"><X size={21} aria-hidden /></button>
    </header>
    {children}
  </dialog>;
}
