/* Local project library for the design preview. No account or cloud API is called. */
const libraryKey = 'synth-website-concept-projects-v1';
const homeState = {section:'home', query:'', prompt:'', menu:false};
const library = {projects:[], active:null, persistent:true};
const projectExamples = [
  {id:'example-fieldnote',title:'Fieldnote',color:'blue',description:'USB-C environmental logger',starred:true},
  {id:'example-graphite',title:'Fieldnote · Graphite',color:'black',description:'A darker finish for the same idea',starred:false},
  {id:'example-original',title:'Fieldnote · Original',color:'green',description:'Explore the original sensor board',starred:false}
];
function initLibrary(){
  try {const saved=JSON.parse(localStorage.getItem(libraryKey)||'null');if(saved?.schema===1&&Array.isArray(saved.projects))Object.assign(library,{projects:saved.projects,active:saved.active});}catch{library.persistent=false;}
  if(!library.projects.length)library.projects=projectExamples.map(p=>({...p,example:true,updated:0,data:null}));
  const current=library.projects.find(p=>p.id===library.active);
  if(current?.data){Object.assign(state,current.data);resetWorkspace();workspace.tabs=current.tabs||[];if(state.busy){state.busy=false;state.runStatus='cancelled';}}
  else library.active=null;
}
function persistLibrary(){try{localStorage.setItem(libraryKey,JSON.stringify({schema:1,projects:library.projects,active:library.active}));library.persistent=true;}catch{library.persistent=false;}}
function saveProject(){
  if(!state.built&&!state.busy&&state.runStatus!=='cancelled')return;
  let project=library.projects.find(p=>p.id===library.active);
  if(!project){project={id:'board-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),example:false,starred:false,description:state.prompt};library.projects.unshift(project);library.active=project.id;}
  const data=JSON.parse(JSON.stringify(state));
  if(JSON.stringify(project.data)!==JSON.stringify(data))project.updated=Date.now();
  Object.assign(project,{title:state.title,color:state.color,data,tabs:[...workspace.tabs]});persistLibrary();
}
function parkProject(){clearTimeout(generation);if(state.busy){state.busy=false;state.runStatus='cancelled';}if(library.active)saveProject();library.active=null;persistLibrary();}
function openProject(id){
  const project=library.projects.find(p=>p.id===id);if(!project)return;
  parkProject();resetEngineering();
  if(project.data){Object.assign(state,JSON.parse(JSON.stringify(project.data)));workspace.tabs=[...(project.tabs||[])];}
  else {loadExample();Object.assign(state,{title:project.title,color:project.color});state.versions=[];snapshot('Example design');}
  library.active=id;homeState.menu=false;state.mobile='board';location.hash='board';render();
}
function projectArt(project){
  let svg=G.board({mini:true}).replaceAll('FIELDNOTE S1',esc(project.title.toUpperCase()));
  if(project.color==='blue')svg=svg.replaceAll('#344f3d','#284e67').replaceAll('#1e392c','#1a344f').replaceAll('#769c72','#739bae');
  if(project.color==='black')svg=svg.replaceAll('#344f3d','#333b3c').replaceAll('#1e392c','#1b2528').replaceAll('#769c72','#81918d');
  return svg.replaceAll('board-fill','board-fill-'+project.id).replaceAll('pcb-grid','pcb-grid-'+project.id);
}
function projectCards(){
  const query=homeState.query.toLowerCase().trim();
  const projects=[...library.projects].sort((a,b)=>b.updated-a.updated).filter(p=>(homeState.section!=='starred'||p.starred)&&(!query||`${p.title} ${p.description}`.toLowerCase().includes(query)));
  const visible=homeState.section==='home'?projects.slice(0,6):projects;
  if(!visible.length)return `<div class="project-empty">${icon(homeState.section==='starred'?'star':'search')}<h3>${query?'No boards found':homeState.section==='starred'?'Keep your favorites close.':'Your next idea starts here.'}</h3><p>${query?'Try a different name or description.':homeState.section==='starred'?'Star a project to find it here.':'Boards you create will appear in this workspace.'}</p>${button(query?'Clear search':homeState.section==='starred'?'Browse projects':'Create a board',query?'library-clear':homeState.section==='starred'?'library-projects':'library-new','button')}</div>`;
  return visible.map(p=>`<article class="project-card"><button class="project-open" data-action="library-open" data-project="${esc(p.id)}" aria-label="Open ${esc(p.title)}"><div class="project-art ${p.color==='black'?'graphite':p.color==='green'?'original':''}">${projectArt(p)}<span>${p.example?'Example board':p.data?.runStatus==='cancelled'?'Paused draft':'Local project'}</span></div><div class="project-info"><h3>${esc(p.title)}</h3><p>${esc(p.description||'Your next board')}</p><div class="project-meta"><span>${icon('layers')} ${p.data?'v'+p.data.version:'PCB example'}</span><span>${p.updated?'Saved in this browser':'Ready to explore'}</span></div></div></button>${button('','library-star','project-star '+(p.starred?'is-starred':''),'star',`data-project="${esc(p.id)}" aria-label="${p.starred?'Unstar':'Star'} ${esc(p.title)}" aria-pressed="${p.starred}"`)}</article>`).join('');
}
function workspaceHome(){
  const isHome=homeState.section==='home';
  return `<div class="workspace-home ${homeState.menu?'menu-open':''}"><aside class="home-sidebar" id="home-sidebar" aria-label="Workspace navigation"><div class="sidebar-brand">${brand()}${button('','library-menu','icon-button mobile-menu-close','close','aria-label="Close navigation"')}</div><div class="workspace-identity"><span class="workspace-avatar">P</span><div><strong>Personal workspace</strong><small>Your ideas, in one place</small></div></div>${button('New board','library-new','button primary sidebar-new','plus')}<nav class="home-navigation" aria-label="Projects">${[['home','Home','home'],['projects','Projects','folder'],['starred','Starred','star']].map(([id,title,sym])=>button(title,'library-'+id,'home-nav-item '+(homeState.section===id?'active':''),sym,homeState.section===id?'aria-current="page"':'')).join('')}</nav><div class="sidebar-recents"><span>RECENT</span>${[...library.projects].sort((a,b)=>b.updated-a.updated).slice(0,4).map(p=>button(esc(p.title),'library-open','recent-link','board',`data-project="${esc(p.id)}"`)).join('')}</div><div class="sidebar-bottom"><a href="../#workspace">${icon('info')} About this preview ${icon('arrow')}</a><div class="local-profile"><span class="workspace-avatar">P</span><div><strong>Personal</strong><small>Local design preview</small></div></div></div></aside><button class="home-scrim" data-action="library-menu" aria-label="Close navigation"></button><div class="home-content" ${homeState.menu?'inert':''}><header class="workspace-home-header">${button('','library-menu','icon-button mobile-menu-toggle','menu','aria-label="Open navigation" aria-controls="home-sidebar" aria-expanded="'+homeState.menu+'"')}<span>Personal workspace <b>/</b> ${isHome?'Home':homeState.section==='projects'?'Projects':'Starred'}</span><span class="concept-tag">Design preview</span></header><main id="main" class="home-main">${isHome?`<section class="workspace-hero"><div class="eyebrow">FROM IDEA TO ELECTRONICS</div><h1>What will you build next?</h1><p class="hero-sub">An idea is all you need. Let’s make it a board.</p><form id="create-form" class="idea-box"><label class="sr-only" for="idea">Describe the PCB you want to build</label><textarea id="idea" rows="3" required maxlength="4000" placeholder="A small USB-C board that measures the world around it…">${esc(homeState.prompt)}</textarea><div class="idea-bottom">${button('Import .synth','import-source','prompt-import','plus')}<button class="create-button" type="submit">Build my board ${icon('arrow')}</button></div></form><div class="idea-suggestions">${button('USB-C sensor logger','example','suggestion','plus')}${button('Indoor air monitor','air-example','suggestion','plus')}${button('Explore an example','open-example','suggestion','arrow')}</div><div class="start-note">Interactive preview · generation uses an example board</div></section>`:''}<section class="project-library" aria-labelledby="projects-heading"><div class="library-heading"><div><h2 id="projects-heading">${isHome?'Pick up where you left off':homeState.section==='starred'?'Starred projects':'Your projects'}</h2><p>${isHome?'Your boards, ready for the next idea.':homeState.section==='starred'?'The ideas you want to keep close.':'Everything you’re building, in one place.'}</p></div>${isHome?button('All projects','library-projects','button quiet small','arrow'):button('New board','library-new','button primary','plus')}</div><div class="library-toolbar"><label class="project-search">${icon('search')}<input id="project-search" type="search" placeholder="Search your boards…" aria-label="Search projects" value="${esc(homeState.query)}"></label><span>Most recent first</span></div><div class="project-grid" id="project-grid">${projectCards()}</div><p class="library-storage">${icon('info')} ${library.persistent?'Projects save in this browser. Example boards are included to explore.':'Browser storage is unavailable. Projects last for this session only.'}</p></section></main><footer class="workspace-home-footer"><a href="../">← Back to Synth</a><a href="../#workspace">About this preview ${icon('arrow')}</a></footer></div></div>`;
}
function libraryAction(name,el){
  if(!name.startsWith('library-'))return false;
  switch(name){
    case 'library-open':openProject(el.dataset.project);return true;
    case 'library-star':{const project=library.projects.find(p=>p.id===el.dataset.project);if(project){project.starred=!project.starred;persistLibrary();}break;}
    case 'library-home':case 'library-projects':case 'library-starred':homeState.section=name.slice(8);homeState.query='';homeState.menu=false;break;
    case 'library-new':parkProject();homeState.section='home';homeState.prompt='';homeState.query='';homeState.menu=false;location.hash='home';render();document.getElementById('idea')?.focus();return true;
    case 'library-clear':homeState.query='';break;
    case 'library-menu':homeState.menu=!homeState.menu;break;
    default:return false;
  }
  render();if(name==='library-menu')document.querySelector(homeState.menu?'.mobile-menu-close':'.mobile-menu-toggle')?.focus();return true;
}
function bindLibrary(){
  const search=document.getElementById('project-search');
  if(search)search.oninput=()=>{homeState.query=search.value;document.getElementById('project-grid').innerHTML=projectCards();document.querySelectorAll('#project-grid [data-action]').forEach(e=>e.onclick=()=>action(e.dataset.action,e));};
  document.querySelectorAll('.brand').forEach(a=>a.onclick=e=>{e.preventDefault();if(library.active)saveProject();homeState.section='home';homeState.query='';homeState.menu=false;location.hash='home';render();});
}
window.addEventListener('pagehide',()=>{if(library.active)saveProject();});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&homeState.menu){homeState.menu=false;render();document.querySelector('.mobile-menu-toggle')?.focus();}});

window.addEventListener('resize',()=>{if(innerWidth>760&&homeState.menu){homeState.menu=false;render();}});
