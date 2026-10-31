async (page) => {
  const base = 'http://127.0.0.1:3110';
  await page.goto(`${base}/?pagina=pacientes&paciente=pac-maria&aba=consulta`);
  await page.setViewportSize({ width: 390, height: 844 });
  const preference = page.locator('.copilot-item').filter({ hasText: 'Patient prefers morning appointments' });
  await preference.getByRole('button', { name: 'Review and approve', exact: true }).click();
  const measurements = await page.getByRole('dialog').evaluate(dialog => ({
    width: dialog.clientWidth, scrollWidth: dialog.scrollWidth,
    options: [...dialog.querySelectorAll('.copilot-check')].map(label => ({ text: label.textContent, width: label.clientWidth, scrollWidth: label.scrollWidth })),
  }));
  if (measurements.scrollWidth > measurements.width + 1 || measurements.options.some(o => o.scrollWidth > o.width + 1)) {
    throw new Error(`Review options overflow the dialog: ${JSON.stringify(measurements)}`);
  }
  await page.getByRole('checkbox', { name: 'Create follow-up task', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Publish a patient journey step', exact: true }).check();
  const expanded = await page.getByRole('dialog').evaluate(dialog => ({ width: dialog.clientWidth, scrollWidth: dialog.scrollWidth }));
  if (expanded.scrollWidth > expanded.width + 1) throw new Error(`Expanded review overflows: ${JSON.stringify(expanded)}`);
  await page.screenshot({ path: 'work/copiloto-check/dialog-mobile.png' });
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 1440, height: 1050 });
  return { reviewOptionsFitMobileDialog: true, expandedFieldsFit: true };
}
