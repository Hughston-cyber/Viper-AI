/* VIPER AI unified left navigation */
(function(){
'use strict';
if(document.querySelector('.viper-universal-sidebar'))return;
const groups=[
{title:'Home',items:[['Dashboard','index.html','⌂'],['Race Days','race-days.html','🏁']]},
{title:'Performance',items:[['Rider Data','rider-data.html','↗'],['Data Analysis','team-analysis.html','▥'],['Performance Dashboard','performance-dashboard.html','◫']]},
{title:'Team',items:[['Roll Call','attendance.html','✓'],['Announcements','announcements.html','▤']]},
{title:'Leadership',items:[['Captain Controls','captain.html','⚙'],['Rider Management','riders.html','♧'],['Training Planner','training.html','▦'],['Race Day Command Centre','race-command.html','🏁'],['Rider Availability','rider-availability.html','◉'],['Online Race Mode','online-race.html','↗'],['Offline Race Mode','offline-race.html','⏱']]}
];
const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
const sidebar=document.createElement('aside');sidebar.className='viper-universal-sidebar';sidebar.setAttribute('aria-label','Main navigation');
sidebar.innerHTML='<a class="viper-universal-brand" href="./index.html">VIPER<span>TEAM VENOM HPR</span></a><div class="viper-universal-label">NAVIGATION</div><div class="viper-universal-links"></div><div class="viper-universal-footer">VIPER AI · TEAM VENOM HPR</div>';
const links=sidebar.querySelector('.viper-universal-links');
groups.forEach(group=>{const section=document.createElement('section');section.className='viper-universal-group';section.dataset.group=group.title;const h=document.createElement('h3');h.textContent=group.title;section.append(h);group.items.forEach(([label,href,glyph])=>{const a=document.createElement('a');a.href='./'+href;a.dataset.href=href;const icon=document.createElement('span');icon.className='viper-universal-icon';icon.setAttribute('aria-hidden','true');icon.textContent=glyph;const name=document.createElement('span');name.textContent=label;a.append(icon,name);if(current===href.toLowerCase())a.setAttribute('aria-current','page');section.append(a)});links.append(section)});
document.body.classList.add('viper-universal-layout');document.body.insertBefore(sidebar,document.body.firstChild);
const nav=document.querySelector('header .site-nav,header nav.links,.top nav.links,header .links,.top .links,header .nav,header nav');
if(nav){const out=nav.querySelector('#signout,#out,#signOut,#logout,[data-action="signout"]');if(out)sidebar.querySelector('.viper-universal-footer').appendChild(out);nav.classList.add('viper-universal-hidden-nav')}
const old=document.querySelector('body > .layout > .sidebar,body > .sidebar');if(old&&!old.classList.contains('viper-universal-sidebar'))old.classList.add('viper-universal-old-sidebar');
function setAccess(role,status){const leadership=status==='approved'&&(role==='captain'||role==='leadership');let offlinePrepared=false;try{const access=JSON.parse(localStorage.getItem('viper_offline_leadership_access_v1')||'null');offlinePrepared=!!(access&&access.approved===true&&access.expiresAt>Date.now())}catch(e){}sidebar.querySelectorAll('a[data-href]').forEach(a=>{const leadershipOnly=['captain.html','riders.html','training.html','race-command.html','rider-availability.html','online-race.html'].includes(a.dataset.href);a.hidden=leadershipOnly&&!leadership;if(a.dataset.href==='offline-race.html')a.hidden=!(leadership||offlinePrepared)});sidebar.querySelectorAll('.viper-universal-group').forEach(s=>{s.hidden=![...s.querySelectorAll('a')].some(a=>!a.hidden)})}
setAccess('','');
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(e=>console.warn('VIPER offline app setup was not available.',e)));}
(async()=>{try{if(!window.supabase||!window.supabase.createClient)return;const client=window.VIPER_SUPABASE_CLIENT||(window.VIPER_SUPABASE_CLIENT=window.supabase.createClient('https://kzazuetxlklmyyrcvgif.supabase.co','sb_publishable_sqN8XOmc9fzf0YJ1Xx0Vhw_38cmCyKR'));const s=await client.auth.getSession();if(s.error||!s.data.session)return;const p=await client.from('profiles').select('status,role').eq('id',s.data.session.user.id).single();if(p.error||!p.data)return;setAccess(p.data.role,p.data.status);client.auth.onAuthStateChange(async(event,session)=>{if(event==='SIGNED_OUT'||!session){setAccess('','');return}const q=await client.from('profiles').select('status,role').eq('id',session.user.id).single();setAccess(q.data?.role,q.data?.status)})}catch(e){console.warn('VIPER navigation permissions could not be refreshed.',e)}})();
})();