async (page) => {
  await page.goto('http://127.0.0.1:3104/paciente');
  await page.getByRole('button', { name: 'Preferências de leitura e voz', exact: true }).click();
  const result = { focusInsidePreferences: await page.evaluate(() => !!document.activeElement.closest('[role="dialog"]')) };
  await page.keyboard.press('Escape');
  result.escapeClosedPreferences = await page.getByRole('dialog').count() === 0;
  return result;
}
