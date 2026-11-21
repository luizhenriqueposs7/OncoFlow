async (page) => {
  await page.goto('http://127.0.0.1:3103/paciente');
  await page.getByRole('button', { name: /Falar com a Lia/ }).click();
  await page.getByRole('button', { name: 'Prefiro digitar', exact: true }).click();
  await page.getByRole('textbox', { name: /Mensagem para a Lia/ }).fill('Qual é minha próxima etapa?');
  await page.getByRole('button', { name: 'Enviar', exact: true }).click();
  await page.getByRole('button', { name: 'Ver minha jornada', exact: true }).last().waitFor();
  await page.getByRole('button', { name: 'Falar com a Lia', exact: true }).click();
  if (!(await page.getByRole('button', { name: 'Ver minha jornada', exact: true }).isVisible())) throw new Error('A tela de voz perdeu a ação de abrir a jornada.');
  await page.getByRole('button', { name: 'Ver minha jornada', exact: true }).click();
  await page.getByRole('heading', { name: 'Minha jornada', exact: true }).waitFor();
  return { voiceActionsPreserved: true };
}
