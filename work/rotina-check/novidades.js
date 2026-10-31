async (page) => {
  await page.goto('http://127.0.0.1:3105/');
  await page.getByRole('heading', { name: 'Meu dia', exact: true }).waitFor();
  const result = { meuDia: await page.getByRole('heading', { name: 'Meu dia', exact: true }).count() > 0,
    novaTarefa: await page.getByRole('button', { name: 'Nova tarefa', exact: true }).count() > 0 };
  await page.goto('http://127.0.0.1:3105/paciente');
  await page.getByRole('button', { name: 'Minha agenda', exact: true }).click();
  result.lembreteVisual = await page.getByRole('button', { name: 'Criar lembrete', exact: true }).count() > 0;
  if (!Object.values(result).every(Boolean)) throw new Error(JSON.stringify(result));
  return result;
}
