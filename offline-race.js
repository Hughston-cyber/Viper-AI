(function(){
'use strict';
const SUPABASE_URL='https://kzazuetxlklmyyrcvgif.supabase.co';
const SUPABASE_KEY='sb_publishable_sqN8XOmc9fzf0YJ1Xx0Vhw_38cmCyKR';
const AUTH_KEY='viper_offline_leadership_access_v1';let supabaseClient=null;let pendingImport=null;
const DB_NAME='viper-offline-race-db';const STORE='sessions';let db;let session={id:makeId(),event:'',venue:'',raceDate:new Date().toISOString().slice(0,10),notes:'',createdAt:new Date().toISOString(),records:[]};
const $=id=>document.getElementById(id);
function makeId(){return 'race-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9)}
function setStatus(el,msg,type){el.textContent=msg;el.className='status'+(type?' '+type:'')}
function openDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE,{keyPath:'id'})};req.onsuccess=()=>{db=req.result;resolve(db)};req.onerror=()=>reject(req.error)})}
function saveLocal(){return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(JSON.parse(JSON.stringify(session)));tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
function loadLocal(id){return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const req=tx.objectStore(STORE).get(id);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
function allLocal(){return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const req=tx.objectStore(STORE).getAll();req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
function deleteLocal(){return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(session.id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
function readFields(){session.event=$('event').value.trim();session.venue=$('venue').value.trim();session.raceDate=$('race-date').value;session.notes=$('session-notes').value.trim();session.updatedAt=new Date().toISOString()}
function showFields(){ $('event').value=session.event||'';$('venue').value=session.venue||'';$('race-date').value=session.raceDate||'';$('session-notes').value=session.notes||'';render()}
function render(){const body=$('records-body');body.replaceChildren();const sorted=[...session.records].sort((a,b)=>a.createdAt.localeCompare(b.createdAt));if(!sorted.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=7;td.textContent='No records yet.';tr.append(td);body.append(tr)}sorted.slice().reverse().forEach(rec=>{const tr=document.createElement('tr');[rec.rider,rec.stint||'—',rec.lapNumber||'—',rec.lapTime||'—',rec.incident||'—',rec.notes||'—'].forEach(value=>{const td=document.createElement('td');td.textContent=String(value);tr.append(td)});const td=document.createElement('td'),btn=document.createElement('button');btn.className='secondary';btn.textContent='Remove';btn.addEventListener('click',async()=>{session.records=session.records.filter(r=>r.id!==rec.id);await saveLocal();render()});td.append(btn);tr.append(td);body.append(tr)});$('record-count').textContent=session.records.length;$('lap-count').textContent=session.records.filter(r=>r.lapNumber!==''&&r.lapNumber!==null).length;$('rider-count').textContent=new Set(session.records.map(r=>r.rider.trim().toLowerCase()).filter(Boolean)).size;$('log-title').textContent=(session.event||'Race session')+' · Recorded entries'}
function downloadJson(data,name){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
async function authorize(){const el=$('auth-status');const cached=(()=>{try{return JSON.parse(localStorage.getItem(AUTH_KEY)||'null')}catch{return null}})();const validCached=cached&&cached.approved===true&&cached.expiresAt>Date.now();if(!navigator.onLine){if(validCached){$('gate').classList.add('hidden');$('app').classList.remove('hidden');setStatus($('connection'),'Offline mode — entries are being saved on this device.','warn');return true}setStatus(el,'No internet connection and this browser has not been prepared by an approved leadership account. Connect once and sign in first.','bad');return false}
try{if(!window.supabase?.createClient){throw new Error('Sign-in service could not load.')}const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);supabaseClient=client;const result=await client.auth.getSession();const user=result.data?.session?.user;if(result.error||!user){setStatus(el,'Please sign in to VIPER AI first, then reopen Offline Race Mode.','bad');return false}const profile=await client.from('profiles').select('status,role').eq('id',user.id).single();if(profile.error||profile.data?.status!=='approved'||!['captain','leadership'].includes(profile.data?.role)){setStatus(el,'Access denied. An approved captain or leadership account is required to prepare this browser.','bad');return false}if(profile.data.role==='captain'){$('database-import').hidden=false}localStorage.setItem(AUTH_KEY,JSON.stringify({approved:true,role:profile.data.role,expiresAt:Date.now()+7*24*60*60*1000,preparedAt:Date.now()}));$('gate').classList.add('hidden');$('app').classList.remove('hidden');setStatus($('connection'),'Online leadership access verified. Race records will still be saved locally until exported.','good');return true}catch(e){if(validCached){$('gate').classList.add('hidden');$('app').classList.remove('hidden');setStatus($('connection'),'Could not reach the sign-in service. Using previously prepared offline access on this browser.','warn');return true}setStatus(el,'Could not verify leadership access. Please reconnect and try again.','bad');return false}}
async function init(){if(!('indexedDB' in window)){setStatus($('auth-status'),'This browser does not support local offline storage. Please use a recent version of Chrome.','bad');return}try{await openDb();const ok=await authorize();if(!ok)return;const saved=await allLocal();const recent=saved.sort((a,b)=>(b.updatedAt||b.createdAt).localeCompare(a.updatedAt||a.createdAt))[0];if(recent){session=recent;showFields()}else{showFields();await saveLocal()}$('connection').textContent=navigator.onLine?'Online — local-only recording is ready.':'Offline — local-only recording is ready.';window.addEventListener('online',()=>setStatus($('connection'),'Back online. Your records remain local until exported.','good'));window.addEventListener('offline',()=>setStatus($('connection'),'Offline — your entries continue saving on this device.','warn'))}catch(e){setStatus($('auth-status'),'Local storage could not be opened. Check browser storage settings.','bad')}}
$('save-session').addEventListener('click',async()=>{readFields();if(!session.event||!session.raceDate){alert('Enter an event name and race date first.');return}await saveLocal();setStatus($('connection'),'Race details saved on this device.','good')});
$('new-session').addEventListener('click',async()=>{if(!confirm('Start a separate race session? Your current session will remain saved on this device.'))return;readFields();await saveLocal();session={id:makeId(),event:'',venue:'',raceDate:new Date().toISOString().slice(0,10),notes:'',createdAt:new Date().toISOString(),records:[]};showFields();await saveLocal()});
$('add-record').addEventListener('click',async()=>{readFields();const rider=$('rider').value.trim();if(!session.event||!session.raceDate){alert('Save an event name and race date first.');return}if(!rider){alert('Enter the rider name first.');return}const stint=$('stint').value.trim(),lap=$('lap-number').value.trim();session.records.push({id:makeId(),rider,stint:stint?Number(stint):'',lapNumber:lap?Number(lap):'',lapTime:$('lap-time').value.trim(),incident:$('incident').value,notes:$('record-notes').value.trim(),createdAt:new Date().toISOString()});$('stint').value='';$('lap-number').value='';$('lap-time').value='';$('incident').value='';$('record-notes').value='';await saveLocal();render();setStatus($('connection'),'Record saved locally.','good')});
$('export').addEventListener('click',async()=>{readFields();await saveLocal();const pack={format:'VIPER_OFFLINE_RACE',version:1,exportedAt:new Date().toISOString(),source:'VIPER AI Offline Race Mode',session};const slug=(session.event||'race-session').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'race-session';downloadJson(pack,'viper-'+slug+'-'+session.raceDate+'.json')});
$('import-button').addEventListener('click',()=>$('import-file').click());
$('import-file').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const pack=JSON.parse(await file.text());if(pack.format!=='VIPER_OFFLINE_RACE'||pack.version!==1||!pack.session||!Array.isArray(pack.session.records)||typeof pack.session.event!=='string')throw new Error('This file is not a supported VIPER offline race export.');if(!confirm('Load "'+pack.session.event+'" into this browser? The current session will remain saved, and the imported session will be opened.'))return;await saveLocal();session=pack.session;if(!session.id)session.id=makeId();await saveLocal();showFields();setStatus($('connection'),'Saved race file loaded locally for review. It has not been uploaded to main VIPER AI.','good')}catch(err){alert(err.message||'Could not read that race file.')}finally{e.target.value=''}});
$('clear-session').addEventListener('click',async()=>{if(!confirm('Delete this session from this browser? Export a backup first if you need one.'))return;await deleteLocal();session={id:makeId(),event:'',venue:'',raceDate:new Date().toISOString().slice(0,10),notes:'',createdAt:new Date().toISOString(),records:[]};showFields();await saveLocal();setStatus($('connection'),'A new empty session is ready.','warn')});

function cleanText(v,max=500){return typeof v==='string'?v.trim().slice(0,max):''}
function validateRacePack(pack){
 if(!pack||pack.format!=='VIPER_OFFLINE_RACE'||pack.version!==1||!pack.session||!Array.isArray(pack.session.records))throw new Error('This is not a supported VIPER offline race export (version 1).');
 const s=pack.session;const event=cleanText(s.event,160);if(!event)throw new Error('The race event name is missing.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(cleanText(s.raceDate,10)))throw new Error('The race date is missing or invalid.');
 if(!s.records.length)throw new Error('This race file contains no records.');
 const records=s.records.map((r,i)=>{const rider=cleanText(r.rider,100);if(!rider)throw new Error('Entry '+(i+1)+' has no rider name.');
 const stint=Number(r.stint);if(!Number.isInteger(stint)||stint<1||stint>99)throw new Error('Entry '+(i+1)+' has an invalid stint number.');
 const lapRaw=(r.lapNumber===null||r.lapNumber===undefined)?'':String(r.lapNumber).trim();const lap=lapRaw===''?null:Number(lapRaw);if(lap!==null&&(!Number.isInteger(lap)||lap<1||lap>9999))throw new Error('Entry '+(i+1)+' has an invalid lap number.');
 return {rider,stint,lapNumber:lap,lapTime:cleanText(r.lapTime,80),incident:cleanText(r.incident,100),notes:cleanText(r.notes,500)}});
 return {event,raceDate:s.raceDate,venue:cleanText(s.venue,160),notes:cleanText(s.notes,1000),records};
}
function showImportPreview(data){
 pendingImport=data;$('database-preview').hidden=false;
 $('preview-records').textContent=data.records.length;
 $('preview-riders').textContent=new Set(data.records.map(r=>r.rider.toLowerCase())).size;
 $('preview-laps').textContent=data.records.filter(r=>r.lapNumber!==null).length;
 $('preview-summary').textContent=data.event+' · '+data.raceDate+(data.venue?' · '+data.venue:'')+'. Check the entries below before importing.';
 const body=$('database-preview-body');body.replaceChildren();
 data.records.forEach(r=>{const tr=document.createElement('tr');[r.rider,String(r.stint),r.lapNumber===null?'—':String(r.lapNumber),r.lapTime||'—',r.incident||'—'].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.appendChild(td)});body.appendChild(tr)});
 setStatus($('database-import-status'),'Preview ready. Nothing has been written to the database yet.','good');
}
$('database-file').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>5*1024*1024)throw new Error('File is larger than 5 MB.');const pack=JSON.parse(await file.text());showImportPreview(validateRacePack(pack))}catch(err){pendingImport=null;$('database-preview').hidden=true;setStatus($('database-import-status'),err.message||'Could not read this race file.','bad')}});
$('cancel-database-import').addEventListener('click',()=>{pendingImport=null;$('database-preview').hidden=true;$('database-file').value='';setStatus($('database-import-status'),'Import cancelled. No database changes were made.','warn')});
$('confirm-database-import').addEventListener('click',async()=>{
 if(!pendingImport)return;
 const btn=$('confirm-database-import');btn.disabled=true;
 try{
  if(!navigator.onLine)throw new Error('You are offline. Reconnect before importing to main VIPER AI.');
  if(!supabaseClient)throw new Error('Sign-in service is not ready. Reload this page while online and signed in.');
  const auth=await supabaseClient.auth.getUser();const user=auth.data?.user;
  if(auth.error||!user)throw new Error('Your sign-in session has expired. Sign in again, then reopen Offline Race Mode.');
  const prof=await supabaseClient.from('profiles').select('status,role').eq('id',user.id).single();
  if(prof.error||prof.data?.status!=='approved'||prof.data?.role!=='captain')throw new Error('Import requires an approved captain or leadership account.');
  const event=pendingImport.event;
  const rows=pendingImport.records.map((r,i)=>({
   event,rider_name:r.rider,stint:r.stint,
   lap_number_as_shown:r.lapNumber===null?'Unnumbered '+(i+1):String(r.lapNumber),
   lap_number:r.lapNumber,lap_time_as_shown:r.lapTime,
   incident:r.incident||null,
   notes:[r.notes,pendingImport.venue?'Venue: '+pendingImport.venue:'','Race date: '+pendingImport.raceDate,pendingImport.notes?'Session notes: '+pendingImport.notes:''].filter(Boolean).join(' | ')||null
  }));
  const result=await supabaseClient.from('lap_records').upsert(rows,{onConflict:'event,rider_name,stint,lap_number_as_shown',ignoreDuplicates:true}).select('id');
  if(result.error)throw new Error('Database rejected the import: '+result.error.message);
  const inserted=result.data?.length??0, skipped=rows.length-inserted;
  setStatus($('database-import-status'),'Import complete: '+inserted+' new lap entries added; '+skipped+' duplicate entries skipped. The original export remains unchanged.','good');
  $('preview-summary').textContent=event+' imported. New entries: '+inserted+'; duplicates skipped: '+skipped+'. Open Rider Data to review the lap log.';
  btn.textContent='Import complete';$('database-file').disabled=true;$('cancel-database-import').disabled=true;
 }catch(err){setStatus($('database-import-status'),err.message||'Import failed. No success was confirmed.','bad')}
 finally{btn.disabled=false}
});

init();
})();