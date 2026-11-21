async (page) => {
  const f = page.frameLocator('iframe');
  const b = f.locator('[data-variant="Estação de atendimento"]');
  const box = b.getByRole('textbox');
  const before = await box.count();
  await box.fill('Resposta fictícia de teste', { timeout: 5000 });
  const value = await box.inputValue();
  await b.getByRole('button', { name: 'Send reply', exact: true }).click({ timeout: 5000 });
  return { before, value, after: (await b.innerText()).slice(-1800) };
}
