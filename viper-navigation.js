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
const style=document.createElement('style');
style.textContent=`
.viper-dashboard-sidebar{position:fixed!important;inset:0 auto 0 0!important;width:242px!important;z-index:10000!important;display:flex!important;flex-direction:column!important;gap:12px!important;padding:22px 15px!important;overflow-y:auto!important;background:#080d16!important;color:#edf7fb!important;border-right:3px solid #39e7ff!important;box-sizing:border-box!important;font:14px/1.4 system-ui,sans-serif!important}
.viper-sidebar-brand{font:800 28px/1.05 'Barlow Condensed',Impact,sans-serif!important;letter-spacing:.06em!important;color:#f6faf7!important}
.viper-sidebar-brand span{display:block!important;margin-top:7px!important;color:#39e7ff!important;font:800 11px/1.3 system-ui,sans-serif!important;letter-spacing:.14em!important}
.viper-sidebar-label,.viper-sidebar-group h3{margin:0!important;padding:4px 10px!important;color:#9aafbd!important;font:800 10px/1.4 system-ui,sans-serif!important;letter-spacing:.14em!important;text-transform:uppercase!important}
.viper-sidebar-links{display:flex!important;flex-direction:column!important;gap:13px!important;width:100%!important}
.viper-sidebar-group{display:flex!important;flex-direction:column!important;gap:5px!important;width:100%!important}
.viper-sidebar-group[hidden],.viper-sidebar-group a[hidden]{display:none!important}
.viper-sidebar-group h3{padding-left:10px!important;color:#39e7ff!important}
.viper-sidebar-group a{display:flex!important;align-items:center!important;gap:10px!important;width:100%!important;min-height:39px!important;padding:9px 11px!important;border:1px solid #293d4d!important;border-radius:7px!important;background:#101b27!important;color:#dcebf1!important;text-decoration:none!important;font-weight:750!important;box-sizing:border-box!important}
.viper-sidebar-group a:hover,.viper-sidebar-group a[aria-current=page]{border-color:#39e7ff!important;background:#122631!important;color:#39e7ff!important}
.viper-sidebar-icon{display:inline-flex!important;width:20px!important;justify-content:center!important}
.viper-sidebar-footer{margin-top:auto!important;padding:12px 3px 0!important;color:#8da4b2!important;font-size:10px!important}
body.viper-has-sidebar{padding-left:242px!important}
@media(max-width:760px){.viper-dashboard-sidebar{width:190px!important;padding:18px 10px!important}body.viper-has-sidebar{padding-left:190px!important}}
`;
document.head.appendChild(style);
const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
if(current==='index.html'){
 const sidebar=document.createElement('aside');sidebar.className='viper-dashboard-sidebar is-visible';sidebar.setAttribute('aria-label','Dashboard navigation');
 sidebar.innerHTML='<div class="viper-sidebar-brand">VIPER<span>TEAM VENOM HPR</span></div><div class="viper-sidebar-label">NAVIGATION</div><div class="viper-sidebar-links"></div><div class="viper-sidebar-footer">VIPER AI · TEAM VENOM HPR</div>';
 const links=sidebar.querySelector('.viper-sidebar-links');
 groups.forEach(group=>{
  const section=document.createElement('section');section.className='viper-sidebar-group';section.dataset.group=group.title;
  const heading=document.createElement('h3');heading.textContent=group.title;section.append(heading);
  group.items.forEach(([label,href,icon])=>{
   const a=document.createElement('a');a.href=href;a.dataset.href=href;
   const glyph=document.createElement('span');glyph.className='viper-sidebar-icon';glyph.setAttribute('aria-hidden','true');glyph.textContent=icon;
   const name=document.createElement('span');name.textContent=label;a.append(glyph,name);
   if(current===href.toLowerCase())a.setAttribute('aria-current','page');
   section.append(a);
  });
  links.append(section);
 });
 nav.classList.add('viper-dashboard-top-nav');
 document.body.classList.add('viper-has-sidebar');
 const main=document.querySelector('main');
 if(main)document.body.insertBefore(sidebar,main);else document.body.insertBefore(sidebar,document.body.firstChild);
 function syncSidebarVisibility(){
  const leadership=document.getElementById('leadershipMenu');
  const race=document.getElementById('navRace');
  const announcements=document.getElementById('navAnnouncements');
  sidebar.querySelectorAll('a').forEach(a=>{
   const href=a.dataset.href;
   const isLeadership=['captain.html','riders.html','training.html','race-command.html','rider-availability.html'].includes(href);
   if(isLeadership) a.hidden=!leadership||leadership.hidden;
   else if(href==='race-days.html') a.hidden=!!race&&race.hidden;
   else if(href==='announcements.html') a.hidden=!!announcements&&announcements.hidden;
  });
  sidebar.querySelectorAll('.viper-sidebar-group').forEach(section=>{
   section.hidden=![...section.querySelectorAll('a')].some(a=>!a.hidden);
  });
 }
 syncSidebarVisibility();
 const authVisibilityObserver=new MutationObserver(syncSidebarVisibility);
 ['leadershipMenu','navRace','navAnnouncements'].forEach(id=>{
  const el=document.getElementById(id);
  if(el)authVisibilityObserver.observe(el,{attributes:true,attributeFilter:['hidden']});
 });
 return;
}
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