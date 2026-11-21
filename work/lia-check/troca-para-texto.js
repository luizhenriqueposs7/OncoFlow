async (page) => {
  await page.request.post('http://127.0.0.1:3103/api/demo/reset');
  await page.goto('http://127.0.0.1:3103/paciente');
  await page.unroute('**/api/transcrever-audio');
  await page.route('**/api/transcrever-audio', route => route.fulfill({ json: { sucesso: true, transcricao: 'Quando é minha próxima consulta?' } }));
  let release;
  let arrived;
  const pending = new Promise(resolve => { arrived = resolve; });
  await page.route('**/api/paciente/conversa', route => { release = () => route.continue(); arrived(); });
  await page.getByRole('button', { name: /Falar com a Lia/ }).click();
  await page.getByRole('button', { name: 'Começar a falar', exact: true }).click();
  await page.getByRole('button', { name: 'Parar e transcrever', exact: true }).click();
  await page.getByRole('textbox', { name: 'Revise antes de enviar', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Enviar mensagem', exact: true }).click();
  await pending;
  await page.getByRole('button', { name: 'Prefiro digitar', exact: true }).click();
  await release();
  await page.getByText('Sua próxima consulta é', { exact: false }).waitFor();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const played = await page.evaluate(() => window.__liaTest.utterance !== null);
  await page.unroute('**/api/paciente/conversa');
  if (played) throw new Error('A resposta por voz começou depois de a pessoa escolher digitar.');
  return { switchingToTextPreventsLateSpeech: true };
}
