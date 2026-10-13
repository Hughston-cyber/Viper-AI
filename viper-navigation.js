/* VIPER AI shared grouped navigation. Keeps page-specific auth and feature code intact. */
(function(){
'use strict';
const nav=document.querySelector('header .site-nav,header .links,.sidebar .nav');
if(!nav)return;
if(nav.querySelector('.viper-menu-wrap'))return;
const groups=[
 {title:'Home',items:[['Dashboard','index.html','⌂'],['Race Days','race-days.html','🏁']]},
 {title:'Performance',items:[['Rider Data','rider-data.html','↗'],['Data Analysis','team-analysis.html','▥'],['Performance Dashboard','performance-dashboard.html','◫']]},
 {title:'Team',items:[['Roll Call','attendance.html','✓'],['Announcements','announcements.html','▤']]},
 {title:'Leadership',leadership:true,items:[['Captain Controls','captain.html','⚙'],['Rider Management','riders.html','♧'],['Training Planner','training.html','▦'],['Race Day Command Centre','race-command.html','🏁'],['Rider Availability','rider-availability.html','◉']]}
];
const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
if(current==='index.html')return; // Dashboard keeps its existing side navigation; all other pages use the top Navigate menu.
const wrap=document.createElement('div');wrap.className='viper-menu-wrap';
const trigger=document.createElement('button');trigger.type='button';trigger.className='viper-menu-trigger';trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-haspopup','true');
trigger.innerHTML='<span class="viper-menu-icon" aria-hidden="true">☰</span><span>Navigate</span><span aria-hidden="true">▾</span>';
const panel=document.createElement('div');panel.className='viper-menu-panel';panel.id='viperNavigationPanel';panel.setAttribute('role','menu');
trigger.setAttribute('aria-controls',panel.id);
const user=document.createElement('span');user.className='viper-menu-footer';user.textContent='VIPER AI  ·  TEAM VENOM HPR';
groups.forEach(group=>{
 const section=document.createElement('section');section.className='viper-menu-group';section.dataset.group=group.title;
 const heading=document.createElement('h3');heading.textContent=group.title;section.append(heading);
 group.items.forEach(([label,href,icon])=>{
  const a=document.createElement('a');a.href=href;a.setAttribute('role','menuitem');
  const dot=document.createElement('span');dot.className='viper-menu-dot';dot.setAttribute('aria-hidden','true');
  const name=document.createElement('span');name.textContent=label;
  a.append(dot,name);a.dataset.href=href;
  if(current===href.toLowerCase()){a.setAttribute('aria-current','page');heading.textContent=group.title+' · CURRENT'}
  section.append(a);
 });
 panel.append(section);
});
panel.append(user);wrap.append(trigger,panel);
nav.classList.add('viper-legacy-nav');
nav.insertBefore(wrap,nav.firstChild);
function close(){panel.dataset.open='false';trigger.setAttribute('aria-expanded','false')}
function toggle(){const open=panel.dataset.open!=='true';panel.dataset.open=String(open);trigger.setAttribute('aria-expanded',String(open))}
trigger.addEventListener('click',toggle);
document.addEventListener('click',e=>{if(!wrap.contains(e.target))close()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){close();trigger.focus()}});
panel.addEventListener('click',e=>{if(e.target.closest('a'))close()});
function setAccess(role,status){
 const approved=status==='approved';
 const leadership=approved&&(role==='captain'||role==='leadership');
 panel.querySelectorAll('a').forEach(a=>{
  const href=a.dataset.href;
  const isLeadership=['captain.html','riders.html','training.html','race-command.html','rider-availability.html'].includes(href);
  const allowed=!isLeadership||(approved&&leadership);
  a.hidden=!allowed;
 });
 panel.querySelectorAll('.viper-menu-group').forEach(section=>{
  const visible=[...section.querySelectorAll('a')].some(a=>!a.hidden);
  section.hidden=!visible;
 });
}
(async()=>{
 try{
  if(!window.supabase||!window.supabase.createClient){setAccess('', '');return}
  const client=window.supabase.createClient('https://kzazuetxlklmyyrcvgif.supabase.co','sb_publishable_sqN8XOmc9fzf0YJ1Xx0Vhw_38cmCyKR');
  const {data,error}=await client.auth.getSession();
  if(error||!data.session){setAccess('', '');return}
  const {data:profile,error:profileError}=await client.from('profiles').select('status,role').eq('id',data.session.user.id).single();
  if(profileError||!profile){setAccess('', '');return}
  setAccess(profile.role,profile.status);
  client.auth.onAuthStateChange(async(event,session)=>{
   if(event==='SIGNED_OUT'||!session){setAccess('', '');return}
   const p=await client.from('profiles').select('status,role').eq('id',session.user.id).single();
   setAccess(p.data?.role,p.data?.status);
  });
 }catch(e){console.warn('VIPER navigation permissions could not be refreshed.',e)}
})();
})();