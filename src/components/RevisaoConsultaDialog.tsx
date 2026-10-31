import React, { useRef, useState } from 'react';
import type { EstadoConsulta, ItemConsulta, RevisaoItem } from '../consulta';
import { Dialogo } from './Dialogo';

function dataLocal(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function RevisaoConsultaDialog({ item, estado, rejeitar, onSalvar, onFechar }: {
  item: ItemConsulta;
  estado: EstadoConsulta;
  rejeitar: boolean;
  onSalvar: (dados: RevisaoItem) => Promise<void>;
  onFechar: () => void;
}) {
  const [validado, setValidado] = useState(item.textoIa);
  const [motivo, setMotivo] = useState('');
  const [criarTarefa, setCriarTarefa] = useState(item.categoria !== 'preferencia');
  const [tituloTarefa, setTituloTarefa] = useState(`Follow up: ${item.textoIa}`.slice(0, 120));
  const [responsavelId, setResponsavel] = useState(estado.padrao.responsavelId);
  const [prazo, setPrazo] = useState(() => dataLocal(estado.padrao.prazo));
  const [publicar, setPublicar] = useState(false);
  const [tituloEtapa, setTituloEtapa] = useState('');
  const [descricao, setDescricao] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const enviando = useRef(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (enviando.current) return;
    let dados: RevisaoItem;
    if (rejeitar) {
      dados = { decisao: 'rejeitar', motivoRejeicao: motivo };
    } else {
      const data = new Date(prazo);
      if (criarTarefa && (!Number.isFinite(data.getTime()) || data.getTime() <= Date.now())) {
        setErro('Choose a future task deadline.'); return;
      }
      dados = {
        decisao: 'confirmar', textoValidado: validado,
        ...(criarTarefa ? { tarefa: { titulo: tituloTarefa, responsavelId, prazo: data.toISOString() } } : {}),
        ...(publicar ? { etapa: { titulo: tituloEtapa, descricao } } : {}),
      };
    }
    enviando.current = true; setOcupado(true); setErro('');
    try { await onSalvar(dados); }
    catch (error) { setErro((error as Error).message); }
    finally { enviando.current = false; setOcupado(false); }
  }

  return (
    <Dialogo titulo={rejeitar ? 'Reject suggestion' : 'Review and approve'} onFechar={onFechar} ocupado={ocupado}>
      <form className="work-form copilot-review-form" onSubmit={salvar}>
        <div className="copilot-original"><span>Original suggestion</span><p>{item.textoIa}</p></div>
        <fieldset disabled={ocupado} className="copilot-form-fields">
          {rejeitar ? (
            <label>Reason for rejection<textarea autoFocus required maxLength={1000} rows={3} value={motivo} onChange={e => setMotivo(e.target.value)} /></label>
          ) : (
            <>
              <label>Reviewed statement<textarea autoFocus required maxLength={2000} rows={3} value={validado} onChange={e => setValidado(e.target.value)} /></label>
              <p className="form-description">Your approved wording is saved alongside the original suggestion.</p>
              <label className="copilot-check"><input type="checkbox" checked={criarTarefa} onChange={e => setCriarTarefa(e.target.checked)} />Create follow-up task</label>
              {criarTarefa && <div className="copilot-dependent-fields">
                <label>Task title<input required maxLength={120} value={tituloTarefa} onChange={e => setTituloTarefa(e.target.value)} /></label>
                <label>Owner<select required value={responsavelId} onChange={e => setResponsavel(e.target.value)}>{estado.responsaveis.map(u => <option key={u.id} value={u.id}>{u.nome} · {u.cargo}</option>)}</select></label>
                <label>Deadline<input type="datetime-local" required value={prazo} onChange={e => setPrazo(e.target.value)} /></label>
                <p className="form-description">Owner and deadline start from service settings. Confirm or change them before approval.</p>
              </div>}
              <label className="copilot-check"><input type="checkbox" checked={publicar} onChange={e => setPublicar(e.target.checked)} />Publish a patient journey step</label>
              {publicar && <div className="copilot-dependent-fields">
                <p className="form-description">The patient will see this title and explanation after you confirm approval.</p>
                <label>Patient-facing title<input required maxLength={120} value={tituloEtapa} onChange={e => setTituloEtapa(e.target.value)} placeholder="Write the next step in plain language" /></label>
                <label>Explanation for the patient<textarea required maxLength={1000} rows={3} value={descricao} onChange={e => setDescricao(e.target.value)} /></label>
              </div>}
            </>
          )}
        </fieldset>
        {erro && <p role="alert" className="send-error">{erro}</p>}
        <p className="form-description">{rejeitar ? 'Rejected suggestions create no tasks or patient journey steps.' : 'Only the actions selected above will be created. The transcript stays in the physician workspace.'}</p>
        <button type="submit" className="work-primary" disabled={ocupado}>{ocupado ? 'Saving review…' : rejeitar ? 'Confirm rejection' : 'Confirm approval'}</button>
      </form>
    </Dialogo>
  );
}
