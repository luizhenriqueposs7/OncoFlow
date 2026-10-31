async (page) => {
  const base = 'http://127.0.0.1:3105';
  const result = {};
  await page.goto(base);
  await page.evaluate(() => localStorage.removeItem('oncoflow-pro-usuario'));
  await page.reload();
  await page.getByRole('button', { name: /Entrar como Dra. Camila/ }).click();
  await page.locator('nav:visible').getByRole('button', { name: 'Comunicação', exact: true }).click();
  await page.locator('#conversa-item-pac-maria').click();
  await page.getByRole('textbox', { name: 'Mensagem para Maria Oliveira Costa', exact: true }).fill('Rascunho para Maria');
  await page.locator('#conversa-item-pac-001').click();
  result.draftSeparated = (await page.getByRole('textbox', { name: 'Mensagem para José Pereira da Silva', exact: true }).inputValue()) === '';
  result.urlKeepsPage = new URL(page.url()).searchParams.get('pagina') === 'comunicacao';
  await page.goto(`${base}/paciente`);
  await page.getByRole('button', { name: /Falar com a Lia/ }).click();
  await page.getByRole('button', { name: 'Prefiro digitar', exact: true }).click();
  await page.route('**/api/paciente/conversa', r => r.abort('failed'));
  await page.getByRole('textbox', { name: /Mensagem para a Lia/ }).fill('Mensagem fictícia para testar recuperação');
  await page.getByRole('button', { name: 'Enviar', exact: true }).click();
  await page.getByRole('alert').first().waitFor();
  result.failedDraftKept = (await page.getByRole('textbox', { name: /Mensagem para a Lia/ }).inputValue()).includes('recuperação');
  await page.unroute('**/api/paciente/conversa');
  if (!Object.values(result).every(Boolean)) throw new Error(JSON.stringify(result));
  return result;
}
