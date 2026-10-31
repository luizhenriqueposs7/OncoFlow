async (page) => {
  const base = 'http://127.0.0.1:3105';
  const result = { layouts: [], pageErrors: [] };
  page.on('pageerror', e => result.pageErrors.push(e.message));
  const check = async name => {
    for (const width of [320,390,768,1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const data = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
      if (data.document > data.viewport) throw new Error(`${name}: ${JSON.stringify(data)}`);
    }
    result.layouts.push(name);
  };
  await page.goto(base);
  await page.getByRole('heading', { name: 'Meu dia', exact: true }).waitFor();
  await check('Meu dia');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'work/rotina-check/screenshots/meu-dia.png', fullPage: true });
  await page.getByRole('button', { name: 'Nova tarefa', exact: true }).click();
  await check('Nova tarefa');
  await page.keyboard.press('Escape');
  await page.goto(`${base}/?pagina=pacientes&paciente=pac-001&aba=jornada`);
  await page.getByRole('heading', { name: 'José Pereira da Silva', exact: true }).waitFor();
  await check('Detalhe do paciente');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'work/rotina-check/screenshots/paciente-pro-celular.png', fullPage: true });
  await page.getByRole('tab', { name: 'Jornada', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  if (await page.getByRole('tab', { selected: true }).textContent() !== 'Agenda') throw new Error('Tab arrow did not navigate');
  await page.reload();
  await page.getByRole('tab', { name: 'Agenda', selected: true }).waitFor();
  result.tabKeyboardAndReload = true;
  await page.getByRole('button', { name: 'Ver plano terapêutico', exact: true }).click();
  await page.getByRole('dialog').waitFor();
  await check('Plano terapêutico');
  await page.keyboard.press('Escape');
  if (await page.getByRole('dialog').count()) throw new Error('Plan did not close');
  await page.goto(`${base}/paciente`);
  await page.getByRole('button', { name: 'Preferências de leitura e voz', exact: true }).click();
  await page.getByRole('radio', { name: 'Muito grande', exact: true }).check();
  await check('Preferências e fonte ampliada');
  await page.keyboard.press('Escape');
  await check('Início paciente com fonte ampliada');
  await page.getByRole('button', { name: 'Minha agenda', exact: true }).click();
  await check('Agenda com fonte ampliada');
  await page.getByRole('button', { name: 'Criar lembrete', exact: true }).click();
  await check('Lembrete com fonte ampliada');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Voltar', exact: true }).click();
  await page.getByRole('button', { name: /Falar com a Lia/ }).click();
  await check('Voz com fonte ampliada');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  result.reducedMotion = await page.locator('.lia-orb-art').first().evaluate(el => getComputedStyle(el).animationName === 'none');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'work/rotina-check/screenshots/lia-fonte-ampliada.png', fullPage: true });
  if (result.pageErrors.length) throw new Error(JSON.stringify(result.pageErrors));
  return result;
}
