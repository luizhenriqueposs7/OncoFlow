async (page) => {
  const base = 'http://127.0.0.1:3103';
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base);
  await page.evaluate(() => localStorage.removeItem('oncoflow-pro-usuario'));
  await page.reload();
  await page.getByRole('button', { name: /Entrar como Dra. Camila/ }).click();
  await page.getByRole('heading', { name: 'Pacientes em acompanhamento', exact: true }).waitFor();
  await page.getByRole('tab', { name: 'Agenda', exact: true }).click();
  if ((await page.getByRole('tab', { name: 'Agenda', exact: true }).getAttribute('aria-selected')) !== 'true') throw new Error('Agenda tab failed');
  await page.getByRole('searchbox', { name: 'Buscar paciente' }).fill('zzzzzz');
  await page.getByText('Nenhum paciente encontrado para essa busca.', { exact: true }).waitFor();
  await page.getByText('Selecione um paciente.', { exact: true }).waitFor();
  await page.getByRole('searchbox', { name: 'Buscar paciente' }).fill('');
  await page.locator('nav:visible').getByRole('button', { name: 'Comunicação', exact: true }).click();
  await page.getByRole('heading', { name: 'Conversas', exact: true }).waitFor();
  await page.locator('nav:visible').getByRole('button', { name: 'Início', exact: true }).click();
  const sizes = [];
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw new Error(`Pro overflow at ${width}`);
    sizes.push(width);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'work/lia-check/publicacao-pro.png', fullPage: true });
  await page.goto(`${base}/paciente`);
  await page.getByRole('button', { name: /Falar com a Lia/ }).click();
  await page.evaluate(() => { document.documentElement.style.fontSize = '22px'; });
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`Voice overflow at ${width}`);
  }
  await page.screenshot({ path: 'work/lia-check/publicacao-voz.png', fullPage: true });
  if (errors.length) throw new Error(JSON.stringify(errors));
  return { integratedProNavigation: true, searchEmptyState: true, sizes, voiceEnlargedFont: true, pageErrors: errors.length };
}
