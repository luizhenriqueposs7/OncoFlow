async (page) => {
  await page.screenshot({ path: 'work/lia-check/overflow-pro.png', fullPage: true });
  return await page.evaluate(() => ({ width: innerWidth, documentWidth: document.documentElement.scrollWidth,
    elements: [...document.querySelectorAll('body *')].map(el => ({ tag: el.tagName, className: el.getAttribute('class'), left: el.getBoundingClientRect().left, right: el.getBoundingClientRect().right, scroll: el.scrollWidth, client: el.clientWidth })).filter(e => e.right > innerWidth + 1 || e.left < -1).slice(0, 22)
  }));
}
