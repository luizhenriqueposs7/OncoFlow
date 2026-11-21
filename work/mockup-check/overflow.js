async (page) => { return page.frames().find(f => f.parentFrame()).evaluate(() => ({
  width: innerWidth,
  variant: document.querySelector('[data-variant]:not([hidden])')?.dataset.variant,
  overflow: [...document.querySelectorAll('[data-variant]:not([hidden]) *')].map(e => ({tag:e.tagName,cls:e.className,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right,text:e.textContent.slice(0,100)})).filter(e=>e.right>innerWidth+1||e.left<0).slice(0,12)
})); }
