async (page) => {
  const base = 'http://127.0.0.1:3110';
  page.setDefaultTimeout(8000);
  await page.request.post(`${base}/api/demo/reset`);
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.goto(`${base}/?pagina=pacientes&paciente=pac-maria&aba=consulta`);
  await page.locator('#btn-entrar-usr-camila, .patient-detail').first().waitFor();
  if (await page.getByRole('button', { name: /Sign in as Dr\. Camila/ }).count()) {
    await page.getByRole('button', { name: /Sign in as Dr\. Camila/ }).click();
  }
  await page.getByRole('tab', { name: 'Consultation', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Load sample consultation', exact: true }).click();
  await page.getByRole('heading', { name: 'Review suggestions', exact: true }).waitFor();
  const concern = page.locator('.copilot-item').filter({ hasText: 'Patient reports concern about fertility' });
  await concern.getByRole('button', { name: 'Review and approve', exact: true }).click();
  await page.getByRole('textbox', { name: 'Reviewed statement', exact: true }).fill('Patient reports concern about future fertility.');
  await page.getByLabel('Task title', { exact: true }).fill('Coordinate a fertility support discussion');
  await page.getByRole('checkbox', { name: 'Publish a patient journey step', exact: true }).check();
  await page.getByLabel('Patient-facing title', { exact: true }).fill('Fertility support discussion');
  await page.getByRole('textbox', { name: 'Explanation for the patient', exact: true }).fill('Your navigator will contact you to organize a discussion with the team.');
  // A failed request must leave the review and the edits available for retry.
  await page.route('**/consulta/itens/*/revisao', route => route.fulfill({ status: 503, json: { mensagem: 'Temporary demo failure. Please try again.' } }), { times: 1 });
  await page.getByRole('button', { name: 'Confirm approval', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'Temporary demo failure' }).waitFor();
  if (await page.getByLabel('Patient-facing title', { exact: true }).inputValue() !== 'Fertility support discussion') throw new Error('Review edits lost');
  await page.getByRole('button', { name: 'Confirm approval', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'detached' });
  await concern.getByText(/Confirmed by Dr\. Camila Ribeiro/).waitFor();
  const transport = page.locator('.copilot-item').filter({ hasText: 'Patient reports needing help arranging transportation' });
  await transport.getByRole('button', { name: 'Reject', exact: true }).click();
  await page.getByRole('textbox', { name: 'Reason for rejection', exact: true }).fill('Not relevant for follow-up in this example.');
  await page.getByRole('button', { name: 'Confirm rejection', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'detached' });
  await transport.getByText(/Rejected by Dr\. Camila/).waitFor();
  await page.reload();
  await page.getByText(/Confirmed by Dr\. Camila/).waitFor();
  await page.goto(`${base}/?pagina=inicio&fila=todas`);
  await page.getByRole('heading', { name: 'Coordinate a fertility support discussion', exact: true }).waitFor();
  await page.goto(`${base}/paciente?tela=jornada`);
  await page.getByText('Fertility support discussion', { exact: true }).waitFor();
  await page.goto(`${base}/?pagina=pacientes&paciente=pac-maria&aba=consulta`);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('heading', { name: 'Consultation copilot', exact: true }).waitFor();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  if (overflow) throw new Error('Copilot overflows mobile screen');
  const preference = page.locator('.copilot-item').filter({ hasText: 'Patient prefers morning appointments' });
  await preference.getByRole('button', { name: 'Review and approve', exact: true }).click();
  if (!(await page.evaluate(() => !!document.activeElement.closest('dialog')))) throw new Error('Review focus outside dialog');
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'detached' });
  await page.screenshot({ path: 'work/copiloto-check/mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'work/copiloto-check/desktop.png', fullPage: true });
  await page.goto(`${base}/?pagina=pacientes&paciente=pac-001&aba=consulta`);
  await page.getByText('No sample consultation is available for this patient.', { exact: true }).waitFor();
  return { consultationReview: true, retainedFailedReview: true, linkedTask: true, publishedPatientStep: true, rejection: true, reload: true, mobileAndKeyboard: true, otherPatientIsolation: true };
}
