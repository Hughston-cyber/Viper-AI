/* VIPER AI — unified app navigation. Does not create or modify auth sessions. */
(function(){
'use strict';
const header=document.querySelector('header.bar');
const nav=document.querySelector('header .site-nav,header .links,.sidebar .nav');
if(!header||!nav||document.querySelector('.viper-redesign-sidebar'))return;
const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
const groups=[
 {title:'WORKSPACE',items:[['Dashboard','index.html','⌂'],['Race Days','race-days.html','▣'],['Rider Data','rider-data.html','↗'],['Data Analysis','team-analysis.html','⌁'],['Performance Dashboard','performance-dashboard.html','◫']]},
 {title:'TEAM',items:[['Roll Call','attendance.html','✓'],['Announcements','announcements.html','▤'],['Training Planner','training.html','◷'],['Rider Availability','rider-availability.html','◉']]},
 {title:'RACE OPERATIONS',items:[['Race Day Command Centre','race-command.html','⚑']]},
 {title:'LEADERSHIP',leadership:true,items:[['Captain Controls','captain.html','⚙'],['Rider Management','riders.html','♧']]}
];
const sidebar=document.createElement('aside');
sidebar.className='viper-redesign-sidebar';
sidebar.setAttribute('aria-label','VIPER AI main navigation');
sidebar.innerHTML='<div class="viper-redesign-brand"><div class="viper-redesign-mark">V</div><div><strong>VIPER AI</strong><span>TEAM VENOM HPR</span></div></div><div class="viper-redesign-caption">TEAM PLATFORM</div><div class="viper-redesign-nav"></div><div class="viper-redesign-footer">INTELLIGENCE · PERFORMANCE · RESULTS</div>';
const list=sidebar.querySelector('.viper-redesign-nav');
const permissionLinks={
 'race-days.html':'navRace','rider-data.html':'navRiders','team-analysis.html':'navAnalysis',
 'performance-dashboard.html':'navPerformance','announcements.html':'navAnnouncements',
 'captain.html':'navCaptain'
};
groups.forEach(group=>{
 const section=document.createElement('section');section.className='viper-redesign-group';section.dataset.group=group.title;
 const heading=document.createElement('div');heading.className='viper-redesign-caption';heading.textContent=group.title;section.append(heading);
 const links=document.createElement('div');links.className='viper-redesign-links';
 group.items.forEach(([label,href,glyph])=>{
  const a=document.createElement('a');a.href=href;a.dataset.href=href;
  const icon=document.createElement('span');icon.className='viper-nav-icon';icon.setAttribute('aria-hidden','true');icon.textContent=glyph;
  const text=document.createElement('span');text.textContent=label;a.append(icon,text);
  if(current===href.toLowerCase())a.setAttribute('aria-current','page');
  links.append(a);
 });
 section.append(links);list.append(section);
});
document.body.insertBefore(sidebar,document.body.firstChild);
const scrim=document.createElement('div');scrim.className='viper-redesign-scrim';scrim.setAttribute('aria-hidden','true');document.body.append(scrim);
const toggle=document.createElement('button');toggle.type='button';toggle.className='viper-mobile-nav-toggle';toggle.setAttribute('aria-label','Open navigation');toggle.setAttribute('aria-expanded','false');toggle.textContent='☰';
const brand=header.querySelector('.site-brand');
if(brand)header.querySelector('.topbar-inner')?.insertBefore(toggle,brand);
function closeNav(){document.body.classList.remove('viper-nav-open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation')}
toggle.addEventListener('click',()=>{const open=!document.body.classList.contains('viper-nav-open');document.body.classList.toggle('viper-nav-open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation')});
scrim.addEventListener('click',closeNav);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeNav()});
sidebar.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeNav));
function syncVisibility(){
 sidebar.querySelectorAll('a[data-href]').forEach(a=>{
  const href=a.dataset.href;
  const sourceId=permissionLinks[href];
  const source=sourceId&&document.getElementById(sourceId);
  if(source)a.hidden=source.hidden;
  if(['captain.html','riders.html','training.html','race-command.html','rider-availability.html','attendance.html'].includes(href)){
   const gate=document.getElementById('leadershipMenu');
   if(gate && gate.hidden)a.hidden=true;
  }
 });
 sidebar.querySelectorAll('.viper-redesign-group').forEach(section=>{
  section.hidden=![...section.querySelectorAll('a')].some(a=>!a.hidden);
 });
}
syncVisibility();
const observer=new MutationObserver(syncVisibility);
nav.querySelectorAll('[id]').forEach(el=>observer.observe(el,{attributes:true,attributeFilter:['hidden','class','style']}));
const gate=document.getElementById('leadershipMenu');if(gate)observer.observe(gate,{attributes:true,attributeFilter:['hidden','class','style']});
nav.querySelectorAll('a[href],.lead-menu,.viper-menu-wrap').forEach(el=>{el.style.setProperty('display','none','important')});
})();
