async (page) => {
  page.setDefaultTimeout(7000);
  const result = { errors: [] };
  page.on('pageerror', e => result.errors.push(e.message));
  await page.addInitScript(() => {
    if (!globalThis.Tweak) {
      globalThis.__mockTweakBindings = [];
      globalThis.Tweak = class {
        constructor(options) { this.options = options; }
        addSelect(object, property) { globalThis.__mockTweakBindings.push({ object, property, change: this.options.onChange }); }
        addToggle(object, property) { this.addSelect(object, property); }
      };
    }
  });
  await page.setViewportSize({ width: 1056, height: 1200 });
  await page.goto('http://127.0.0.1:3106');
  const frame = page.frameLocator('iframe');
  await page.frames().find(f => f.parentFrame()).evaluate(() => {
    window.dispatchEvent(new CustomEvent('openai:set_globals', { detail: { globals: { widgetState: { modelContent: { language: 'en', density: 'Standard', detailVisible: true, reviewedPatientIds: [], selectedPatients: { list: 'jose', station: 'jose', review: 'jose' } } } } } }));
  });
  const a = frame.locator('[data-variant="Lista clínica"]');
  await a.getByRole('button', { name: 'Maria Oliveira Costa', exact: true }).click();
  await a.locator('aside').getByRole('heading', { name: 'Maria Oliveira Costa', exact: true }).waitFor();
  await a.getByRole('button', { name: 'Overdue', exact: true }).click();
  await a.locator('aside').getByRole('heading', { name: 'José Pereira da Silva', exact: true }).waitFor();
  await a.getByRole('button', { name: 'All patients', exact: true }).click();
  await a.getByRole('searchbox').fill('Jose');
  if (await a.locator('tbody tr').count() !== 1) throw new Error('Search did not filter');
  await a.getByRole('searchbox').fill('zzzz');
  await a.getByText('No patient selected.', { exact: true }).waitFor();
  await a.getByRole('searchbox').fill('');
  result.patientSelectionAndFilters = true;
  await frame.getByRole('button', { name: 'Próximo', exact: true }).click();
  const b = frame.locator('[data-variant="Estação de atendimento"]');
  await b.getByRole('button', { name: /Maria Oliveira Costa/ }).click();
  await b.getByRole('heading', { name: 'Maria Oliveira Costa', exact: true }).waitFor();
  await b.locator('.oc-tabs').getByRole('button', { name: 'Documents', exact: true }).click();
  await b.getByRole('heading', { name: 'Released documents', exact: true }).waitFor();
  await b.locator('.oc-tabs').getByRole('button', { name: 'Messages', exact: true }).click();
  await b.getByRole('textbox', { name: 'Reply to this patient', exact: true }).fill('Fictitious reply for the concept preview.');
  await b.getByRole('button', { name: 'Send reply', exact: true }).click();
  await b.getByText('Fictitious reply for the concept preview.').waitFor();
  result.patientWorkspaceAndLocalReply = true;
  await frame.getByRole('button', { name: 'Próximo', exact: true }).click();
  const c = frame.locator('[data-variant="Central de revisão"]');
  await c.getByRole('button', { name: 'Assign to me', exact: true }).click();
  await c.getByText('Assigned to you', { exact: true }).waitFor();
  await c.getByRole('combobox', { name: 'Review outcome', exact: true }).selectOption('contact');
  await c.getByRole('button', { name: 'Complete review', exact: true }).click();
  if (await c.getByRole('button', { name: 'José Pereira da Silva', exact: true }).count()) throw new Error('Completed item remained open');
  result.inlineReviewAndCompletion = true;
  const currentFrame = page.frames().find(f => f.parentFrame());
  result.hostControls = await currentFrame.evaluate(() => {
    const bindings = globalThis.__mockTweakBindings || [];
    const language = bindings.find(b => b.property === 'language');
    const density = bindings.find(b => b.property === 'density');
    if (language) { language.object.language = 'pt'; language.change(); }
    if (density) { density.object.density = 'Compact'; density.change(); }
    return { captured: !!language, density: density?.object.density };
  });
  if (!result.hostControls.captured) await currentFrame.evaluate(() => {
    window.dispatchEvent(new CustomEvent('openai:set_globals', { detail: { globals: { widgetState: { modelContent: { language: 'pt', density: 'Compact' } } } } }));
  });
  await c.getByRole('heading', { name: 'O que precisa de retorno', exact: true }).waitFor();
  result.portugueseAndCompactState = true;
  result.ptLayouts = [];
  for (const width of [1056, 768, 422, 352]) {
    await page.setViewportSize({ width, height: 1200 });
    for (let i = 0; i < 3; i++) {
      const visible = frame.locator('[data-variant]:visible');
      const bounds = await visible.evaluate(el => ({ viewport: innerWidth, content: document.documentElement.scrollWidth, height: el.getBoundingClientRect().height }));
      if (bounds.content > bounds.viewport) throw new Error(JSON.stringify(bounds));
      result.ptLayouts.push(bounds);
      if (i < 2) await frame.getByRole('button', { name: 'Anterior', exact: true }).click();
    }
    await frame.getByRole('button', { name: 'Próximo', exact: true }).click();
    await frame.getByRole('button', { name: 'Próximo', exact: true }).click();
  }
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.setViewportSize({ width: 1056, height: 1200 });
  await c.screenshot({ path: 'work/mockup-check/revisao-dark.png' });
  result.darkTheme = await c.evaluate(el => getComputedStyle(el).backgroundColor);
  if (result.errors.length) throw new Error(JSON.stringify(result.errors));
  return result;
}
