import type { ErrorRequestHandler } from 'express';

// Do not echo parser payloads or stack traces into responses or application logs.
export const tratarErroApi: ErrorRequestHandler = (erro, _req, res, next) => {
  if (res.headersSent) { next(erro); return; }
  const status = erro?.type === 'entity.parse.failed' ? 400 : erro?.type === 'entity.too.large' ? 413 : 500;
  res.status(status).json({
    erro: status === 400 ? 'json_invalido' : status === 413 ? 'corpo_muito_grande' : 'erro_interno',
    mensagem: status === 400 ? 'Invalid request. Send a JSON object.' : status === 413 ? 'This request is too large.' : 'Could not complete the request. Please try again.',
  });
};
