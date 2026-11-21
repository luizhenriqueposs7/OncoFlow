async (page) => {
  const results = { variants: [], pageErrors: [] };
  page.on('pageerror', e => results.pageErrors.push(e.message));
  await page.setViewportSize({ width: 1088, height: 1250 });
  await page.goto('http://127.0.0.1:3106');
  const frame = page.frameLocator('iframe');
  await frame.getByRole('heading', { name: 'Patients under follow-up', exact: true }).waitFor();
  for (const name of ['Lista clínica', 'Estação de atendimento', 'Central de revisão']) {
    const stage = frame.locator(`[data-variant="${name}"]`);
    await stage.waitFor({ state: 'visible' });
    await stage.screenshot({ path: `work/mockup-check/${name === 'Lista clínica' ? 'lista' : name === 'Estação de atendimento' ? 'atendimento' : 'revisao'}.png` });
    const sizes = [];
    for (const width of [1088, 768, 422, 352]) {
      await page.setViewportSize({ width, height: 1250 });
      const bounds = await stage.evaluate(el => ({ viewport: window.innerWidth, content: document.documentElement.scrollWidth, stage: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height }));
      sizes.push(bounds);
    }
    results.variants.push({ name, sizes });
    await page.setViewportSize({ width: 1088, height: 1250 });
    if (name !== 'Central de revisão') await frame.getByRole('button', { name: 'Próximo', exact: true }).click();
  }
  return results;
}
