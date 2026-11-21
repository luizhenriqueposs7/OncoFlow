async (page) => {
  const textbox = page.getByRole('textbox', { name: /Mensagem para a Lia/ });
  await page.route('**/api/paciente/conversa', route => route.abort('failed'));
  await textbox.fill('Mensagem fictícia para verificar recuperação de erro.');
  await page.getByRole('button', { name: 'Enviar', exact: true }).click();
  await page.getByRole('alert').waitFor();
  const result = { error: await page.getByRole('alert').textContent(), draftAfterFailure: await textbox.inputValue() };
  await page.getByRole('alert').waitFor({ state: 'detached', timeout: 6000 });
  result.errorClearedWithoutRetry = true;
  await page.unroute('**/api/paciente/conversa');
  return result;
}
