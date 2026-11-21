async (page) => {
  const base = 'http://127.0.0.1:3104';
  const result = {};
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base);
  await page.getByRole('button', { name: /Entrar como Dra. Camila/ }).waitFor();
  await page.getByRole('button', { name: /Entrar como Dra. Camila/ }).click();
  await page.getByRole('heading', { name: 'Pacientes em acompanhamento', exact: true }).waitFor();
  await page.screenshot({ path: 'work/revisao-ui/pro-inicio.png', fullPage: true });
  await page.getByRole('tab', { name: 'Jornada', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  result.tabsAfterArrow = { focus: await page.locator(':focus').textContent(), selected: await page.getByRole('tab', { selected: true }).textContent() };
  await page.locator('nav:visible').getByRole('button', { name: /Pendências/ }).click();
  await page.getByRole('heading', { name: 'Pendências abertas', exact: true }).waitFor();
  await page.screenshot({ path: 'work/revisao-ui/pro-pendencias.png', fullPage: true });
  result.pendingUrl = page.url();
  await page.reload();
  await page.getByRole('heading', { name: 'Pacientes em acompanhamento', exact: true }).waitFor();
  result.reloadReturnsHome = true;
  await page.getByRole('button', { name: 'Ver plano terapêutico', exact: true }).click();
  result.planDialogRoleCount = await page.getByRole('dialog').count();
  await page.keyboard.press('Escape');
  result.planEscapeCloses = !(await page.getByRole('heading', { name: 'Plano Terapêutico Vigente', exact: true }).isVisible());
  if (!result.planEscapeCloses) await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await page.locator('nav:visible').getByRole('button', { name: 'Comunicação', exact: true }).click();
  await page.getByRole('heading', { name: 'Conversas', exact: true }).waitFor();
  await page.locator('#conversa-item-pac-maria').click();
  await page.getByRole('textbox', { name: 'Mensagem para Maria Oliveira Costa', exact: true }).fill('Rascunho de teste destinado à Maria.');
  await page.locator('#conversa-item-pac-001').click();
  result.draftForOtherPatient = await page.getByRole('textbox', { name: 'Mensagem para José Pereira da Silva', exact: true }).inputValue();
  await page.screenshot({ path: 'work/revisao-ui/pro-rascunho-outro-paciente.png', fullPage: true });
  await page.getByRole('textbox', { name: 'Mensagem para José Pereira da Silva', exact: true }).fill('');
  result.mobileOverflow = [];
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    result.mobileOverflow.push(await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth })));
  }
  await page.screenshot({ path: 'work/revisao-ui/pro-comunicacao-celular.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('nav:visible').getByRole('button', { name: 'Início', exact: true }).click();
  await page.screenshot({ path: 'work/revisao-ui/pro-celular.png', fullPage: true });
  return result;
}
