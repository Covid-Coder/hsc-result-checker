import {readCard} from './ocr.js';
const $=id=>document.getElementById(id),form=document.querySelector('form'),keys=['exam','year','board','roll','registration'],labels={exam:'পরীক্ষার নাম',year:'পরীক্ষার বছর',board:'বোর্ড',roll:'রোল',registration:'রেজিস্ট্রেশন'};
let controller,revision=0,connected=false,busy=false;
const read=()=>Object.fromEntries(keys.map(k=>[k,form.elements.namedItem(k).value]));
function draft(){try{return JSON.parse(sessionStorage.getItem('hsc-public-draft')||'{}');}catch{return {};}}
function save(){const old=draft(),data=read();for(const k of keys)if(form.elements.namedItem(k).disabled)data[k]=old[k]||'';try{sessionStorage.setItem('hsc-public-draft',JSON.stringify(data));}catch{}return data;}
for(const k of ['roll','registration'])form.elements.namedItem(k).value=draft()[k]||'';
function showCardOption(key,value){const el=form.elements.namedItem(key);el.replaceChildren(new Option('কার্ড থেকে: '+value+' (official যাচাই বাকি)',value));el.disabled=false;}
for(const k of ['exam','year','board'])if(draft()[k])showCardOption(k,draft()[k]);
function toReconnect(reason){save();try{sessionStorage.setItem('hsc-public-reason',reason);}catch{}location.assign('reconnect.html');}
function options(state){
 const saved=draft();for(const key of ['exam','year','board']){const el=form.elements.namedItem(key),value=el.value||saved[key];el.replaceChildren(new Option('নির্বাচন করুন',''));for(const o of state.options[key])el.add(new Option(o.label,o.value));el.disabled=false;const match=optionValue(el,value);if(match)el.value=match;else if(value)$('status').textContent=labels[key]+' কার্ডের পাঠ official option-এ মেলেনি—নিজে নির্বাচন করুন।';}
 connected=true;busy=false;$('official-submit').disabled=false;$('connect-site').textContent='Connected';$('connection-status').textContent='একই official tab-এর বর্তমান form সংযুক্ত।';
}
function state(data){
 if(data.phase==='form'&&data.options){options(data);return;}
 if(data.phase==='official_response'){$('entry-step').hidden=true;$('captcha-step').hidden=false;$('captcha-status').textContent=data.message;$('official-response').textContent=data.responseText||'';busy=false;$('official-submit').disabled=false;return;}
 if(data.phase==='captcha_mismatch'){$('entry-step').hidden=false;$('captcha-step').hidden=true;$('status').textContent=data.message+'\n'+(data.responseText||'');busy=false;$('official-submit').disabled=false;return;}
 if(data.phase==='loading'||data.phase==='submitting'){$('captcha-status').textContent=data.message||data.error||'Official tab লোড হচ্ছে…';return;}
 if(['disconnected','human_verification'].includes(data.phase)){connected=false;toReconnect(data.error||'পুনরায় সংযোগ করুন।');}
}
HSC_BRIDGE.onState(state);
$('connect-site').onclick=async()=>{const button=$('connect-site');button.disabled=true;button.textContent='Connecting…';try{const result=await HSC_BRIDGE.request('connect');if(result.phase==='form')state(result);else if(result.phase==='official_response')state(result);else toReconnect(result.error||result.message||'Official tab প্রস্তুত হচ্ছে। সেখানে verification সম্পন্ন করুন।');}catch(e){toReconnect(e.message);}finally{button.disabled=false;button.textContent=connected?'Connected':'Connect to Site';}};
form.addEventListener('input',()=>{save();$('status').textContent='তথ্য বদলেছে। Submit-এর আগে মিলিয়ে নিন।';});
$('choose-card').onclick=()=>$('card-file').click();
$('cancel-ocr').onclick=()=>{revision++;controller?.abort();$('card-status').textContent='কার্ড পড়া বন্ধ করা হয়েছে।';$('cancel-ocr').hidden=true;$('ocr-progress').hidden=true;};
function optionValue(el,value){const aliases={cumilla:'comilla',jashore:'jessore',chattogram:'chittagong',technical:'tec'};const vals=[value,aliases[value]].filter(Boolean);const found=[...el.options].filter(o=>vals.includes(o.value));return found.length===1?found[0].value:null;}
$('card-file').onchange=async()=>{
 controller?.abort();controller=new AbortController();const run=++revision,file=$('card-file').files[0];if(!file)return;
 $('card-status').textContent='এই browser-এ কার্ড পড়া হচ্ছে: '+file.name;$('ocr-progress').hidden=false;$('cancel-ocr').hidden=false;
 try{const data=await readCard(file,p=>{if(run===revision)$('ocr-progress').value=p;},controller.signal);if(run!==revision)return;
  const parsed=PARSE_CARD(data.text),current=read(),old=draft(),filled=[],review=[];
  for(const k of keys){const el=form.elements.namedItem(k),value=parsed[k];if(!value){review.push(labels[k]+' শনাক্ত হয়নি—নিজে পূরণ করুন।');continue;}if(el.tagName==='SELECT'&&!connected){if(current[k]&&current[k]!==value){review.push(labels[k]+' আগের লেখার সঙ্গে মেলেনি—নিজে মিলিয়ে নিন।');continue;}old[k]=value;showCardOption(k,value);filled.push(labels[k]);review.push(labels[k]+' কার্ড থেকে বসেছে—official যাচাই বাকি।');continue;}const match=el.tagName==='SELECT'?optionValue(el,value):value;if(!match){review.push(labels[k]+' official option-এ মেলেনি।');continue;}if(current[k]&&current[k]!==match){review.push(labels[k]+' আগের লেখার সঙ্গে মেলেনি—নিজে মিলিয়ে নিন।');continue;}el.value=match;old[k]=match;filled.push(labels[k]);}
  try{sessionStorage.setItem('hsc-public-draft',JSON.stringify({...old,...Object.fromEntries(keys.filter(k=>!form.elements.namedItem(k).disabled).map(k=>[k,form.elements.namedItem(k).value]))}));}catch{}
  $('card-status').textContent='পড়া পৃষ্ঠা: '+data.pages+'\nবসেছে: '+(filled.join(', ')||'কোনো ঘর নয়')+'\n'+review.join('\n')+'\nOCR ভুল করতে পারে; মূল কার্ডের সঙ্গে মিলিয়ে নিন।';
  const missing=keys.find(k=>!form.elements.namedItem(k).value&&!form.elements.namedItem(k).disabled);if(missing)form.elements.namedItem(missing).focus();
 }catch(e){if(run===revision)$('card-status').textContent=e.message+'\nতথ্য নিজে লিখে official site ব্যবহার করতে পারেন।';}finally{if(run===revision){$('ocr-progress').hidden=true;$('cancel-ocr').hidden=true;}}
};
async function submit(event){event.preventDefault();if(!connected){toReconnect('PC extension সংযুক্ত নয়। মোবাইলে Official সাইটে ফল দেখুন ব্যবহার করুন।');return;}if(!form.reportValidity())return;const values=save();try{const live=await HSC_BRIDGE.request('state');if(!['form','captcha_mismatch'].includes(live.phase)&&!live.canFill){state(live);return;}const result=await HSC_BRIDGE.request('fill',values);if(!result.filled){$('status').textContent=result.error||'Official form প্রস্তুত নয়।';return;}$('entry-step').hidden=true;$('captcha-step').hidden=false;$('submission-summary').textContent=keys.map(k=>labels[k]+': '+values[k]).join('\n');$('captcha-status').textContent=result.message;$('official-response').textContent='';}catch(e){toReconnect(e.message);}}
form.addEventListener('submit',submit);$('fill').onclick=()=>form.requestSubmit();
$('back-entry').onclick=()=>{$('entry-step').hidden=false;$('captcha-step').hidden=true;};
$('reset').onclick=()=>{revision++;controller?.abort();form.reset();for(const k of ['exam','year','board']){const el=form.elements.namedItem(k);if(!connected){el.replaceChildren(new Option('Connect to Site',''));el.disabled=true;}else el.value='';}$('card-file').value='';$('card-status').textContent=$('status').textContent='';$('ocr-progress').hidden=$('cancel-ocr').hidden=true;try{sessionStorage.removeItem('hsc-public-draft');}catch{}};
for(const [id,action] of [['focus-official','focus'],['refresh-official','state']])$(id).onclick=()=>HSC_BRIDGE.request(action).then(state).catch(e=>toReconnect(e.message));
$('official-submit').onclick=async()=>{if(busy)return;busy=true;$('official-submit').disabled=true;try{const result=await HSC_BRIDGE.request('submit');if(result.phase==='error'){$('captcha-status').textContent=result.error;busy=false;$('official-submit').disabled=false;}else state(result);}catch(e){busy=false;$('official-submit').disabled=false;toReconnect(e.message);}};
// Only a local extension probe, with a quiet failure for mobile/no-extension users.
HSC_BRIDGE.request('state').then(data=>{if(data.phase==='form')options(data);}).catch(()=>{});
