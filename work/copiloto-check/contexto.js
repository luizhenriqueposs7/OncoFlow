async (page) => {
  const base = 'http://127.0.0.1:3110';
  await page.goto(`${base}/?pagina=pacientes&paciente=pac-001&aba=consulta`);
  await page.getByRole('button', { name: /Maria Oliveira Costa 34 y\/o/ }).click();
  const preference = page.locator('.copilot-item').filter({ hasText: 'Patient prefers morning appointments' });
  await preference.getByRole('button', { name: 'Review and approve', exact: true }).click();
  await page.getByRole('textbox', { name: 'Reviewed statement', exact: true }).fill('Unsubmitted edit for Maria.');
  await page.goBack();
  await page.getByRole('heading', { name: 'José Pereira da Silva', exact: true }).waitFor();
  if (await page.getByRole('dialog').count()) throw new Error('Review dialog survived patient switch');
  await page.getByRole('button', { name: 'User menu', exact: true }).click();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await page.getByRole('button', { name: /Sign in as Nurse Rodrigo/ }).click();
  await page.goto(`${base}/?pagina=pacientes&paciente=pac-maria&aba=consulta`);
  await page.getByText('Physician access required', { exact: true }).waitFor();
  if (await page.getByText(/I am worried about my fertility/).count()) throw new Error('Transcript visible to nursing');
  await page.locator('nav:visible').getByRole('button', { name: 'Home', exact: true }).click();
  await page.getByRole('heading', { name: 'Coordinate a fertility support discussion', exact: true }).waitFor();
  await page.getByRole('button', { name: 'User menu', exact: true }).click();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await page.getByRole('button', { name: /Sign in as Dr\. Camila/ }).click();
  await page.goto(`${base}/?pagina=pacientes&paciente=pac-maria&aba=consulta`);
  return { browserBackClosesPatientReview: true, physicianOnlyTranscript: true, teamSeesConfirmedTask: true };
}
