async (page) => {
  page.setDefaultTimeout(6000);
  const result={ variants:[],errors:[] };
  page.on('pageerror',e=>result.errors.push(e.message));
  await page.setViewportSize({width:1056,height:1200});
  await page.emulateMedia({colorScheme:'light'});
  await page.goto('http://127.0.0.1:3106');
  const frame=page.frameLocator('iframe');
  await frame.getByRole('heading',{name:'Pacientes em acompanhamento',exact:true}).waitFor();
  for(const [name,file] of [['Lista clínica','lista-studio'],['Estação de atendimento','atendimento-studio'],['Central de revisão','revisao-studio']]){
    const stage=frame.locator(`[data-variant="${name}"]`);
    await stage.screenshot({path:`work/mockup-check/${file}.png`});
    const sizes=[];
    for(const width of [1056,768,422,352]){
      await page.setViewportSize({width,height:1200});
      const bounds=await stage.evaluate(el=>({viewport:innerWidth,content:document.documentElement.scrollWidth,height:el.getBoundingClientRect().height,childHeight:el.firstElementChild.getBoundingClientRect().height}));
      if(bounds.content>bounds.viewport)throw new Error(JSON.stringify({name,...bounds}));
      sizes.push(bounds);
    }
    result.variants.push({name,sizes});
    await page.setViewportSize({width:1056,height:1200});
    if(name!=='Central de revisão')await frame.getByRole('button',{name:'Próximo',exact:true}).click();
  }
  return result;
}
