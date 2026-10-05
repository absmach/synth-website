/* Tabbed workspace with optional engineering tools and persistent chat. */
const workspace = {
  tabs: [], inspector: null, drawer: false, drawerTab: 'timeline', menu: false,
  capture: false, captured: null, search: '', scroll: {}
};
let workspaceTabObserver;
const workspaceTools = [
  ['source','Synth source','code','view'], ['parts','Parts & BOM','box','view'],
  ['nets','Connections','layers','view'], ['architecture','Architecture','layers','view'],
  ['constraints','Board constraints','box','panel'], ['routing','Placement & routing','spark','panel'],
  ['checks','Checks & diagnostics','check','view'], ['versions','Versions','undo','view'],
  ['activity','Generation activity','spark','drawer']
];
function resetWorkspace() {
  Object.assign(workspace,{tabs:[],inspector:null,drawer:false,menu:false,search:'',scroll:{}});
}
function closeWorkspaceInspector(){workspace.inspector=null;workspace.menu=false;}
function toolSurface(kind,title,content){
  if(workspace.capture){workspace.captured={kind,title,content};return;}
  if(location.hash!=='#board'){dialog(title,content);return;}
  document.getElementById('dialog').close();workspace.menu=false;state.mobile='board';
  if(kind==='activity'){workspace.drawer=true;}
  else if(['parts','nets','checks','versions'].includes(kind)){
    state.view=kind;workspace.inspector=null;
    if(!workspace.tabs.includes(kind))workspace.tabs.push(kind);
  }else workspace.inspector={kind,title,content};
  render();
}
function captureWorkspaceTool(kind){
  const builders={parts:partsDialog,nets:netsDialog,checks:checksDialog,versions:versionsDialog};
  workspace.capture=true;
  try{builders[kind]();return workspace.captured;}finally{workspace.capture=false;workspace.captured=null;}
}
function workspaceNavigation(){
  const core=[['pcb','PCB','layers'],['schematic','Schematic','code'],['3d','3D','box']];
  if(['source','architecture'].includes(state.view)&&!workspace.tabs.includes(state.view))workspace.tabs.push(state.view);
  return [...core,...workspace.tabs.map(key=>workspaceTools.find(t=>t[0]===key))].map(([key,label,sym])=>`<div class="workspace-tab ${state.view===key?'active':''}">${button(label,'workspace-view','view-button',sym,`data-view="${key}" aria-pressed="${state.view===key}"`)}${workspace.tabs.includes(key)?button('','workspace-close-tab','tab-close','close',`data-close-view="${key}" aria-label="Close ${label}"`):''}</div>`).join('');
}
function workspaceMenu(){
  return `<section class="details-menu" aria-label="Design tools"><div class="menu-label">Explore your design</div>${workspaceTools.map(([key,label,sym,type],i)=>`${i===4||i===8?'<div class="menu-divider"></div>':''}${button(`<span>${label}</span><small>${type==='view'?'View':type==='panel'?'Settings':'Drawer'}</small>`,key,'details-menu-item',sym)}`).join('')}</section>`;
}
function workspaceParts(){
  return `<div class="parts-workspace"><div class="workspace-page-heading"><div><span class="workspace-eyebrow">YOUR DESIGN / REFERENCE DATA</span><h1>Parts & BOM</h1><p>Every component, with its connections one click away.</p></div>${button('Download BOM','bom-download','button small','download')}</div><div class="parts-table-toolbar"><div class="parts-count"><strong>${engineering.parts.length}</strong> components <span>·</span> ${new Set(engineering.parts.map(p=>p.id)).size} unique parts</div>${button('Add a part','part-intake','button small','plus')}</div><label class="sr-only" for="workspace-part-search">Search components</label><input id="workspace-part-search" class="tool-input" placeholder="Search reference, part or value…" value="${esc(workspace.search)}"><div class="bom-table-scroll"><table class="bom-table"><thead><tr><th>Reference</th><th>Component</th><th>Value / type</th><th>Footprint</th><th><span class="sr-only">Inspect</span></th></tr></thead><tbody>${engineering.parts.map(p=>`<tr data-search="${esc([p.ref,p.id,p.value,p.kind].join(' ').toLowerCase())}" class="${state.selectedPart===p.ref?'selected':''}"><td><button class="part-reference" data-action="inspect-component" data-ref="${p.ref}" aria-label="Inspect ${p.ref}">${esc(p.ref)}</button></td><td><strong>${esc(p.id)}</strong></td><td>${esc(p.value||p.kind)}</td><td class="footprint-cell">${esc(p.footprint)}</td><td>${button('','inspect-component','icon-button','arrow',`data-ref="${p.ref}" aria-label="Inspect ${p.ref} pins"`)}</td></tr>`).join('')}</tbody></table><p id="workspace-parts-empty" class="empty-tool" hidden>No matching components.</p></div><div class="workspace-footnote">${icon('info')}<span>Bundled core source · price and stock unknown. ${state.sourceChanged?'Edited source has not been resolved.':'This reference BOM is separate from the board illustration.'}</span></div></div>`;
}
function workspacePage(kind){
  if(kind==='parts')return workspaceParts();
  const tool=captureWorkspaceTool(kind);
  return `<div class="tool-workspace"><div class="workspace-page-heading"><div><span class="workspace-eyebrow">YOUR DESIGN / ${esc(workspaceTools.find(t=>t[0]===kind)[1].toUpperCase())}</span><h1>${tool.title}</h1></div></div><div class="workspace-page-content">${tool.content}</div></div>`;
}
function workspaceInspector(){
  if(!workspace.inspector)return '';
  const {kind,title,content}=workspace.inspector;
  return `<aside class="design-inspector" aria-label="${esc(kind==='component'?'Component inspector':'Design settings')}" data-inspector="${kind}"><div class="inspector-heading"><div><span>${['component','net','sourcing'].includes(kind)?'INSPECT':'DESIGN SETTINGS'}</span><h2>${title}</h2></div>${button('','workspace-close-inspector','icon-button','close','aria-label="Close inspector"')}</div><div class="inspector-content">${content}</div></aside>`;
}
function workspaceDrawer(){
  if(!workspace.drawer)return '';
  const stageLabels=['Understand request','Resolve components','Place & route','Validate','Present design'];
  return `<section class="generation-drawer" aria-label="Generation drawer"><div class="drawer-heading"><div class="drawer-tabs" aria-label="Generation details">${button('Agent timeline','workspace-drawer-tab',workspace.drawerTab==='timeline'?'active':'','spark','data-tab="timeline"')}${button('Compiler output','workspace-drawer-tab',workspace.drawerTab==='compiler'?'active':'','code','data-tab="compiler"')}</div><span class="drawer-status">${state.busy?'Simulated generation':state.runStatus==='cancelled'?'Stopped':'Preview · tools not connected'}</span>${button('','workspace-close-drawer','icon-button','close','aria-label="Close generation drawer"')}</div><div class="drawer-content">${workspace.drawerTab==='timeline'?`<div class="timeline-caption"><span>${state.busy?'Your idea is taking shape.':state.runStatus==='cancelled'?'Your request is retained.':'The steps behind a design.'}</span><small>Illustrative sequence · no tools have run</small></div><ol class="horizontal-timeline">${stageLabels.map((s,i)=>`<li><span class="timeline-index">${String(i+1).padStart(2,'0')}</span><strong>${s}</strong><small>${state.runStatus==='cancelled'?'Stopped':'Example stage'}</small></li>`).join('')}</ol><div class="drawer-footer"><span>Actual runs will show step status, retries and evidence here.</span>${state.busy?button('Stop generation','cancel-generation','button small','close'):state.runStatus==='cancelled'?button('Resume example','resume-generation','button small','spark'):button('Retry generation','retry-physical','button small','undo')}</div>`:`<div class="compiler-drawer-content"><div><strong>No compiler output yet.</strong><p>Connect the compiler to see diagnostics and captured output for this source.</p>${button('Download debug snapshot','debug-download','button small','download')}</div><pre class="debug-log">${esc('SOURCE      '+state.sourceName+'\nCOMPILER    not connected\nVALIDATION  unknown\nRENDERER    not connected\nOUTPUT      none captured')}</pre></div>`}</div></section>`;
}
function mountWorkspace(){
  workspaceTabObserver?.disconnect();
  if(location.hash!=='#board')return;
  const board=document.querySelector('.board-space');board.classList.add('workspace-board');
  const toolbar=board.querySelector('.board-toolbar');toolbar.classList.add('workspace-toolbar');
  const nav=toolbar.querySelector('nav');nav.innerHTML=workspaceNavigation();
  const strip=document.createElement('div');strip.className='workspace-tabstrip';nav.before(strip);
  strip.innerHTML=button('','workspace-scroll-tabs','tab-scroll tab-scroll-left','arrow','data-direction="-1" aria-label="Scroll tabs left" hidden');
  strip.append(nav);strip.insertAdjacentHTML('beforeend',button('','workspace-scroll-tabs','tab-scroll tab-scroll-right','arrow','data-direction="1" aria-label="Scroll tabs right" hidden'));
  nav.onscroll=()=>updateWorkspaceOverflow();
  workspaceTabObserver=new ResizeObserver(()=>updateWorkspaceOverflow(true));workspaceTabObserver.observe(strip);
  const details=toolbar.querySelector('[data-action=details]');details.setAttribute('aria-expanded',String(workspace.menu));details.innerHTML='Details '+icon('down');
  if(workspace.menu)toolbar.insertAdjacentHTML('beforeend',workspaceMenu());
  const content=board.querySelector('.canvas,.source-workspace');
  const area=document.createElement('div');area.className='workspace-area';content.before(area);area.append(content);
  if(['parts','nets','checks','versions'].includes(state.view)){content.outerHTML=workspacePage(state.view);}
  area.insertAdjacentHTML('beforeend',workspaceInspector());
  if(workspace.inspector)area.classList.add('has-inspector');
  area.insertAdjacentHTML('afterend',workspaceDrawer());
  const search=document.getElementById('workspace-part-search');
  if(search){search.oninput=()=>{workspace.search=search.value;filterWorkspaceParts();};filterWorkspaceParts();}
}
function filterWorkspaceParts(){
  let visible=0;
  document.querySelectorAll('.bom-table tbody tr').forEach(row=>{row.hidden=!row.dataset.search.includes(workspace.search.toLowerCase());if(!row.hidden)visible++;});
  const empty=document.getElementById('workspace-parts-empty');if(empty)empty.hidden=visible>0;
}
function activateWorkspaceView(view){
  workspace.menu=false;workspace.inspector=null;state.mobile='board';
  if(['parts','nets','checks','versions'].includes(view)){({parts:partsDialog,nets:netsDialog,checks:checksDialog,versions:versionsDialog})[view]();}
  else{state.view=view;render();}
}
function workspaceAction(name,el){
  if(name==='details'||name==='tools'){workspace.menu=!workspace.menu;render();if(workspace.menu)document.querySelector('.details-menu-item')?.focus();return true;}
  if(name==='workspace-view'){activateWorkspaceView(el.dataset.view);return true;}
  if(name==='workspace-scroll-tabs'){const nav=document.querySelector('.workspace-tabstrip nav');nav.scrollBy({left:Number(el.dataset.direction)*Math.max(120,nav.clientWidth*.75),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});return true;}
  if(name==='workspace-close-tab'){const key=el.dataset.closeView;workspace.tabs=workspace.tabs.filter(v=>v!==key);if(state.view===key){state.view='pcb';workspace.inspector=null;}render();document.querySelector('.workspace-tab.active [data-action=workspace-view]')?.focus();return true;}
  if(name==='workspace-close-inspector'){workspace.inspector=null;render();document.querySelector('[data-action=details]')?.focus();return true;}
  if(name==='workspace-close-drawer'){workspace.drawer=false;render();document.querySelector('[data-action=activity]')?.focus();return true;}
  if(name==='workspace-drawer-tab'){workspace.drawerTab=el.dataset.tab;render();return true;}
  if(workspace.menu)workspace.menu=false;
  return false;
}
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape'||document.getElementById('dialog').open)return;
  if(workspace.menu){workspace.menu=false;render();document.querySelector('[data-action=details]')?.focus();}
  else if(workspace.inspector){workspace.inspector=null;render();}
  else if(workspace.drawer){workspace.drawer=false;render();}
});
document.addEventListener('click',e=>{
  if(!workspace.menu||e.target.closest('.details-menu,[data-action=details]'))return;
  workspace.menu=false;
  document.querySelector('.details-menu')?.remove();
  document.querySelector('[data-action=details]')?.setAttribute('aria-expanded','false');
});

// Opening an inspector or a drawer should not jump the table or conversation.
function rememberWorkspaceScroll(){
  for(const selector of ['.bom-table-scroll','.conversation-scroll','#source-editor']){
    const node=document.querySelector(selector);
    if(node)workspace.scroll[selector]={top:node.scrollTop,left:node.scrollLeft};
  }
}
function restoreWorkspaceScroll(){
  for(const [selector,position] of Object.entries(workspace.scroll)){
    const node=document.querySelector(selector);
    if(node){node.scrollTop=position.top;node.scrollLeft=position.left;}
  }
  updateWorkspaceOverflow(true);
}
function updateWorkspaceOverflow(revealActive=false){
  const strip=document.querySelector('.workspace-tabstrip'),nav=strip?.querySelector('nav');
  if(!nav||!strip.clientWidth)return;
  const left=strip.querySelector('.tab-scroll-left'),right=strip.querySelector('.tab-scroll-right');
  const needsScroll=nav.scrollWidth>strip.clientWidth+1;
  left.hidden=right.hidden=!needsScroll;
  if(revealActive){const active=nav.querySelector('.workspace-tab.active');
    if(active){const rect=active.getBoundingClientRect(),box=nav.getBoundingClientRect();
      if(rect.width>box.width)nav.scrollLeft+=rect.left-box.left;
      else if(rect.right>box.right)nav.scrollLeft+=rect.right-box.right;
      else if(rect.left<box.left)nav.scrollLeft-=box.left-rect.left;
    }
  }
  left.disabled=nav.scrollLeft<=1;right.disabled=nav.scrollLeft+nav.clientWidth>=nav.scrollWidth-1;
}
