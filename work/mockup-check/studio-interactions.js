async (page) => {
  page.setDefaultTimeout(6500);
  const result={errors:[]};
  page.on('pageerror',e=>result.errors.push(e.message));
  await page.setViewportSize({width:1056,height:1200});
  await page.emulateMedia({colorScheme:'light'});
  await page.goto('http://127.0.0.1:3106');
  const f=page.frameLocator('iframe');
  const iframe=page.frames().find(frame=>frame.parentFrame());
  await iframe.evaluate(()=>window.dispatchEvent(new CustomEvent('openai:set_globals',{detail:{globals:{widgetState:{modelContent:{language:'pt',density:'Standard',detailVisible:true,reviewedPatientIds:[],selectedPatients:{list:'jose',station:'jose',review:'jose'}}}}}})));
  const a=f.locator('[data-variant="Lista clínica"]');
  await a.getByRole('button',{name:'Maria Oliveira Costa',exact:true}).click();
  await a.locator('aside').getByRole('heading',{name:'Maria Oliveira Costa',exact:true}).waitFor();
  await a.getByRole('button',{name:'Prazos vencidos',exact:true}).click();
  await a.locator('aside').getByRole('heading',{name:'José Pereira da Silva',exact:true}).waitFor();
  await a.getByRole('button',{name:'Todos',exact:true}).click();
  await a.getByRole('searchbox').fill('Jose');
  if(await a.locator('tbody tr').count()!==1)throw new Error('Busca não filtrou');
  await a.getByRole('searchbox').fill('zzzz');
  await a.getByText('Nenhum paciente selecionado.',{exact:true}).waitFor();
  await a.getByRole('searchbox').fill('');
  result.searchAndSelection=true;
  await f.getByRole('button',{name:'Próximo',exact:true}).click();
  const b=f.locator('[data-variant="Estação de atendimento"]');
  await b.getByRole('button',{name:/Maria Oliveira Costa/}).click();
  await b.locator('.oc-tabs').getByRole('button',{name:'Documentos',exact:true}).click();
  await b.getByRole('heading',{name:'Documentos liberados',exact:true}).waitFor();
  await b.locator('.oc-tabs').getByRole('button',{name:'Conversa',exact:true}).click();
  await b.getByRole('textbox',{name:'Responder a este paciente',exact:true}).fill('Resposta fictícia para validar a prévia.');
  await b.getByRole('button',{name:'Enviar resposta',exact:true}).click();
  await b.getByText('Resposta fictícia para validar a prévia.').waitFor();
  result.documentsAndReply=true;
  await f.getByRole('button',{name:'Próximo',exact:true}).click();
  const c=f.locator('[data-variant="Central de revisão"]');
  await c.getByRole('button',{name:'Assumir tarefa',exact:true}).click();
  await c.getByText('Atribuída a você',{exact:true}).waitFor();
  const outcome=c.getByRole('combobox',{name:'Desfecho da revisão',exact:true});
  await c.getByRole('button',{name:'Concluir revisão',exact:true}).click();
  if(await c.locator('.oc-inbox-item').count()!==3)throw new Error('Revisão sem desfecho foi aceita');
  await outcome.selectOption('contact');
  await c.getByRole('button',{name:'Concluir revisão',exact:true}).click();
  if(await c.locator('.oc-inbox-item').count()!==2)throw new Error('Revisão não concluiu');
  if(await c.locator('.oc-inbox-item').filter({hasText:'José Pereira da Silva'}).count())throw new Error('Revisão concluída permaneceu na fila');
  result.requiredOutcomeAndReview=true;
  const layouts=[];
  for(const width of [1056,768,422,352]){
    await page.setViewportSize({width,height:1200});
    const heights=[];
    for(let i=0;i<3;i++){
      const bounds=await f.locator('[data-variant]:visible').evaluate(el=>({viewport:innerWidth,content:document.documentElement.scrollWidth,height:el.getBoundingClientRect().height}));
      if(bounds.content>bounds.viewport)throw new Error(JSON.stringify(bounds));
      heights.push(bounds.height);
      if(i<2)await f.getByRole('button',{name:'Anterior',exact:true}).click();
    }
    if(new Set(heights).size!==1)throw new Error(JSON.stringify({width,heights}));
    layouts.push({width:width-32,height:heights[0]});
    await f.getByRole('button',{name:'Próximo',exact:true}).click();
    await f.getByRole('button',{name:'Próximo',exact:true}).click();
  }
  result.portugueseLayouts=layouts;
  await page.setViewportSize({width:1056,height:1200});
  await page.emulateMedia({colorScheme:'dark'});
  await c.screenshot({path:'work/mockup-check/studio-dark.png'});
  result.darkTheme=await c.evaluate(el=>getComputedStyle(el.querySelector('.oc-review-shell')).backgroundColor);
  await iframe.evaluate(()=>window.dispatchEvent(new CustomEvent('openai:set_globals',{detail:{globals:{widgetState:{modelContent:{language:'en',density:'Compact'}}}}})));
  await c.getByRole('heading',{name:'What needs a response',exact:true}).waitFor();
  result.englishAndCompact=true;
  return result;
}
