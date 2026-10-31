import React, { useEffect, useState } from 'react';
import { CheckCircle2, ClipboardCheck, FileText, LockKeyhole, Quote, XCircle } from 'lucide-react';
import type { EstadoConsulta, ItemConsulta, RevisaoItem, SegmentoConsulta } from '../consulta';
import type { UsuarioEquipe } from '../types';
import { chamarApi } from '../api/pro';
import { dataHoraCurta } from './proUtil';
import { RevisaoConsultaDialog } from './RevisaoConsultaDialog';

const CATEGORIA = { preocupacao: 'Concern', preferencia: 'Preference', necessidade_possivel: 'Support need' };
const INTERLOCUTOR: Record<SegmentoConsulta['interlocutor'], string> = { paciente: 'Patient', medico: 'Physician', acompanhante: 'Companion', nao_identificado: 'Speaker not identified' };
const tempo = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;

export function ConsultaCopiloto({ pacienteId, usuario, versao, onAtualizar, onVerJornada }: {
  pacienteId: string; usuario: UsuarioEquipe; versao: number;
  onAtualizar: () => Promise<void>; onVerJornada: () => void;
}) {
  const [estado, setEstado] = useState<EstadoConsulta | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [revisao, setRevisao] = useState<{ id: string; rejeitar: boolean } | null>(null);
  const [resultado, setResultado] = useState('');
  const caminho = `/api/pro/pacientes/${pacienteId}/consulta`;

  useEffect(() => {
    if (usuario.papel !== 'medico') return;
    let ativo = true;
    chamarApi<EstadoConsulta>(caminho, usuario.id).then(novo => {
      if (ativo) { setEstado(novo); setErro(''); }
    }).catch(error => { if (ativo) setErro(error.message); });
    return () => { ativo = false; };
  }, [caminho, usuario.id, usuario.papel, versao, tentativa]);

  const consulta = estado?.consulta;
  const itemRevisao = consulta?.itens.find(i => i.id === revisao?.id && i.estado === 'pendente_validacao');
  async function carregar() {
    if (carregando) return;
    setCarregando(true); setErro('');
    try { setEstado(await chamarApi<EstadoConsulta>(caminho, usuario.id, {})); }
    catch (error) { setErro((error as Error).message); }
    finally { setCarregando(false); }
  }
  async function salvar(item: ItemConsulta, dados: RevisaoItem) {
    const novo = await chamarApi<EstadoConsulta>(`${caminho}/itens/${item.id}/revisao`, usuario.id, dados);
    setEstado(novo); setRevisao(null);
    const atualizado = novo.consulta!.itens.find(i => i.id === item.id)!;
    setResultado(dados.decisao === 'rejeitar' ? 'Suggestion rejected. No task or patient step was created.' : `Item approved.${atualizado.tarefaId ? ' Follow-up task created.' : ''}${atualizado.etapaId ? ' Patient journey step published.' : ''}`);
    await onAtualizar();
  }

  return (
    <section className="copilot-workspace" aria-labelledby="copilot-title">
      <header className="copilot-heading"><div><span className="copilot-eyebrow">Consultation workspace</span><h3 id="copilot-title">Consultation copilot</h3><p>Review what was said and turn confirmed needs into next steps.</p></div><span className="copilot-mode">Fictional sample</span></header>
      {usuario.papel !== 'medico' ? (
        <div className="copilot-empty"><LockKeyhole size={25} aria-hidden /><strong>Physician access required</strong><p>Consultation content and review are available to physicians only. Confirmed follow-up tasks are available in the team work queue.</p></div>
      ) : <>
        {erro && <div role="alert" className="send-error">{erro}<button type="button" className="work-link" onClick={() => setTentativa(t => t + 1)}>Try again</button></div>}
        {!estado ? <p role="status">Loading consultation…</p> : !estado.disponivel ? (
          <div className="copilot-empty"><FileText size={25} aria-hidden /><p>No sample consultation is available for this patient.</p><p className="form-description">Open Maria Oliveira Costa to explore the fictional consultation flow.</p></div>
        ) : !consulta ? (
          <div className="copilot-empty"><ClipboardCheck size={30} aria-hidden /><h4>From conversation to coordinated follow-up</h4><p>Explore a simulated transcript and suggestions from Maria's fictional consultation. Nothing reaches the patient before physician approval.</p><button type="button" className="work-primary" onClick={carregar} disabled={carregando}>{carregando ? 'Loading sample…' : 'Load sample consultation'}</button></div>
        ) : <>
          <p className="copilot-disclosure">Simulated transcript and suggestions · No recording in this sample.</p>
          {resultado && <div className="copilot-result" role="status"><CheckCircle2 size={18} aria-hidden /><span>{resultado}</span><button type="button" className="work-link" onClick={onVerJornada}>View journey</button></div>}
          <div className="copilot-grid">
            <section className="copilot-transcript" aria-labelledby="transcript-title"><h4 id="transcript-title">Source transcript</h4><p className="form-description">Literal speech · physician workspace only</p><ol>{consulta.segmentos.map(s => <li key={s.id} id={`segment-${s.id}`} tabIndex={-1}><div><strong>{INTERLOCUTOR[s.interlocutor]}</strong><time>{tempo(s.inicioMs)}</time></div><p>{s.texto}</p></li>)}</ol></section>
            <section className="copilot-suggestions" aria-labelledby="suggestions-title"><div className="copilot-queue-heading"><h4 id="suggestions-title">Review suggestions</h4><span>{consulta.itens.filter(i => i.estado === 'pendente_validacao').length} awaiting review</span></div>
              {consulta.itens.length === 0 && <p>No supported suggestions were found in this sample.</p>}
              {consulta.itens.map(item => <article key={item.id} className={`copilot-item state-${item.estado}`}>
                <div className="copilot-item-meta"><span>{CATEGORIA[item.categoria]}</span><span>{item.estado === 'pendente_validacao' ? `${item.origem === 'hipotese_ia' ? 'System hypothesis' : 'Sample extraction'} · awaiting review` : item.estado === 'confirmado' ? 'Confirmed' : 'Rejected'}</span></div>
                <p className="copilot-statement">{item.textoValidado ?? item.textoIa}</p>
                {item.textoValidado && item.textoValidado !== item.textoIa && <p className="copilot-previous"><strong>Original suggestion:</strong> {item.textoIa}</p>}
                {item.evidencias.map((e, i) => {
                  const s = consulta.segmentos.find(s => s.id === e.segmentoId)!;
                  return <blockquote key={i}><Quote size={15} aria-hidden /><p>{e.citacao}</p><a href={`#segment-${s.id}`}>{INTERLOCUTOR[s.interlocutor]} · {tempo(s.inicioMs)} · View source</a></blockquote>;
                })}
                {item.estado === 'pendente_validacao' ? <div className="task-actions"><button type="button" className="work-primary" onClick={() => { setResultado(''); setRevisao({ id: item.id, rejeitar: false }); }}>Review and approve</button><button type="button" className="work-secondary" onClick={() => { setResultado(''); setRevisao({ id: item.id, rejeitar: true }); }}>Reject</button></div> : <div className="copilot-decision">
                  {item.estado === 'confirmado' ? <CheckCircle2 size={16} aria-hidden /> : <XCircle size={16} aria-hidden />}
                  <div><p>{item.estado === 'confirmado' ? 'Confirmed' : 'Rejected'} by {item.revisadoPor?.nome} · {item.revisadoEm && dataHoraCurta(item.revisadoEm)}</p>{item.motivoRejeicao && <p>{item.motivoRejeicao}</p>}{item.tarefaId && <p>Follow-up task linked to this decision.</p>}{item.etapaId && <p>Patient journey step published.</p>}</div>
                </div>}
              </article>)}
            </section>
          </div>
        </>}
        {itemRevisao && estado && <RevisaoConsultaDialog key={itemRevisao.id} item={itemRevisao} estado={estado} rejeitar={revisao!.rejeitar} onSalvar={dados => salvar(itemRevisao, dados)} onFechar={() => setRevisao(null)} />}
      </>}
    </section>
  );
}
