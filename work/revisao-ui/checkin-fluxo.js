async (page) => {
  const base = 'http://127.0.0.1:3104';
  const result = {};
  await page.goto(`${base}/paciente`);
  await page.getByRole('button', { name: 'Como estou?', exact: true }).click();
  await page.getByRole('button', { name: 'Cansado(a)', exact: true }).click();
  const relato = 'Registro fictício da revisão: cansada após atividade.';
  await page.getByRole('textbox', { name: 'Quer contar mais? (opcional)', exact: true }).fill(relato);
  await page.getByRole('button', { name: 'Enviar', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'Check-in registrado' }).waitFor();
  result.checkinRegistered = true;
  await page.goto(base);
  await page.getByRole('heading', { name: 'Pacientes em acompanhamento', exact: true }).waitFor();
  await page.locator('nav:visible').getByRole('button', { name: /Pendências/ }).click();
  const pending = page.locator('article').filter({ hasText: relato });
  await pending.waitFor();
  result.patientToPro = true;
  await pending.getByRole('button', { name: 'Assumir', exact: true }).click();
  await pending.getByRole('combobox').selectOption('sem_acao_necessaria');
  await pending.getByRole('button', { name: 'Concluir revisão', exact: true }).click();
  await pending.waitFor({ state: 'detached' });
  result.proReviewCompleted = true;
  return result;
}
