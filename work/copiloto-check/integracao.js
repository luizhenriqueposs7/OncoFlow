async (page) => {
  const base = 'http://127.0.0.1:3110';
  await page.request.post(`${base}/api/demo/reset`);
  await page.goto(base);
  await page.locator('#btn-entrar-usr-camila, .daily-workspace').first().waitFor();
  if (await page.getByRole('button', { name: /Sign in as Dr\. Camila/ }).count()) {
    await page.getByRole('button', { name: /Sign in as Dr\. Camila/ }).click();
  }
  await page.getByRole('heading', { name: 'My day', exact: true }).waitFor();
  await page.getByRole('button', { name: 'New task', exact: true }).click();
  await page.getByRole('combobox', { name: 'Patient', exact: true }).selectOption('pac-maria');
  await page.getByLabel('Task title', { exact: true }).fill('Arrange fictional transport');
  await page.getByLabel('Reason or instructions for the team').fill('Check transportation availability.');
  await page.getByRole('button', { name: 'Create task', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'detached' });
  await page.getByRole('button', { name: 'My tasks', exact: true }).click();
  await page.getByRole('heading', { name: 'Arrange fictional transport', exact: true }).waitFor();
  await page.reload();
  if (new URL(page.url()).searchParams.get('fila') !== 'minhas') throw new Error('Lost queue filter');
  await page.goto(`${base}/?pagina=pacientes&paciente=pac-maria&aba=comunicacao`);
  await page.getByRole('textbox', { name: /Message to Maria/ }).fill('Retained fictional draft');
  await page.getByRole('button', { name: /José Pereira da Silva 64 y\/o/ }).click();
  if (await page.getByRole('textbox', { name: /Message to/ }).inputValue()) throw new Error('Draft leaked between patients');
  await page.getByRole('button', { name: /Maria Oliveira Costa 34 y\/o/ }).click();
  if (await page.getByRole('textbox', { name: /Message to Maria/ }).inputValue() !== 'Retained fictional draft') throw new Error('Patient draft was not retained');
  await page.goto(`${base}/paciente?tela=agenda`);
  const exam = page.locator('article').filter({ hasText: 'Pre-treatment blood tests' });
  await exam.getByRole('button', { name: 'Create reminder', exact: true }).click();
  await page.getByRole('radio', { name: 'Two hours before', exact: true }).check();
  await page.getByRole('button', { name: 'Confirm reminder', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'detached' });
  await exam.getByRole('button', { name: 'Reminder created', exact: true }).waitFor();
  await page.goto(`${base}/paciente?tela=lia`);
  await page.getByRole('button', { name: "I'd rather type", exact: true }).click();
  await page.getByRole('textbox', { name: /Message to Lia/ }).fill('When is my next appointment?');
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await page.getByText(/Your next appointment is/).last().waitFor();
  return { englishDailyWorkflow: true, filtersAndReload: true, patientDraftIsolation: true, directReminder: true, englishLia: true };
}
