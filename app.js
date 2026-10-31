import {readCard} from './ocr.js';
if(new URLSearchParams(location.search).get('reset')==='1'){try{sessionStorage.removeItem('hsc-public-draft');}catch{}history.replaceState(null,'',location.pathname);}
const $=id=>document.getElementById(id),form=document.querySelector('form'),keys=['exam','year','board','roll','registration'],labels={exam:'পরীক্ষার নাম',year:'পরীক্ষার বছর',board:'বোর্ড',roll:'রোল',registration:'রেজিস্ট্রেশন'};
let controller,revision=0;const connected=false;
const read=()=>Object.fromEntries(keys.map(k=>[k,form.elements.namedItem(k).value]));
function draft(){try{return JSON.parse(sessionStorage.getItem('hsc-public-draft')||'{}');}catch{return {};}}
function save(){const data=read();try{sessionStorage.setItem('hsc-public-draft',JSON.stringify(data));}catch{}return data;}
const choices={exam:[['jsc','JSC/JDC'],['ssc','SSC/Dakhil/Equivalent'],['hsc','HSC/Alim/Equivalent'],['dibs','DIBS']],year:Array.from({length:31},(_,i)=>[String(2026-i),String(2026-i)]),board:[['barisal','Barisal'],['chittagong','Chittagong'],['comilla','Comilla'],['dhaka','Dhaka'],['dinajpur','Dinajpur'],['jessore','Jessore'],['madrasah','Madrasah'],['mymensingh','Mymensingh'],['rajshahi','Rajshahi'],['sylhet','Sylhet'],['tec','Technical']]};
for(const k of ['exam','year','board']){const el=form.elements.namedItem(k);el.replaceChildren(new Option('নির্বাচন করুন',''));for(const [value,label] of choices[k])el.add(new Option(label,value));el.disabled=false;}
function optionValue(el,value){const aliases={cumilla:'comilla',jashore:'jessore',chattogram:'chittagong',technical:'tec'};const found=[...el.options].filter(o=>[value,aliases[value]].includes(o.value));return found.length===1?found[0].value:null;}
function showCardOption(k,value){const el=form.elements.namedItem(k),match=optionValue(el,value);if(match)el.value=match;else{el.add(new Option('কার্ড থেকে: '+value,value));el.value=value;}}
for(const k of keys){const value=draft()[k];if(value){if(form.elements.namedItem(k).tagName==='SELECT')showCardOption(k,value);else form.elements.namedItem(k).value=value;}}
function openBackend(){if(!form.reportValidity())return;const data=save();location.assign('https://hsc-result-backend-covid-coder.onrender.com/#draft='+encodeURIComponent(JSON.stringify(data)));}
$('connect-site').onclick=openBackend;form.onsubmit=e=>{e.preventDefault();openBackend();};form.addEventListener('input',save);
$('choose-card').onclick=()=>$('card-file').click();
$('cancel-ocr').onclick=()=>{revision++;controller?.abort();$('card-status').textContent='কার্ড পড়া বন্ধ করা হয়েছে।';$('cancel-ocr').hidden=true;$('ocr-progress').hidden=true;};
$('card-file').onchange=async()=>{
 controller?.abort();controller=new AbortController();const run=++revision,file=$('card-file').files[0];if(!file)return;
 $('card-status').textContent='এই browser-এ কার্ড পড়া হচ্ছে: '+file.name;$('ocr-progress').hidden=false;$('cancel-ocr').hidden=false;
 try{const data=await readCard(file,p=>{if(run===revision)$('ocr-progress').value=p;},controller.signal);if(run!==revision)return;
  const parsed=PARSE_CARD(data.text),current=read(),old=draft(),filled=[],review=[];
  for(const k of keys){const el=form.elements.namedItem(k),value=parsed[k];if(!value){review.push(labels[k]+' শনাক্ত হয়নি—নিজে পূরণ করুন।');continue;}if(el.tagName==='SELECT'&&!connected){if(current[k]&&current[k]!==value){review.push(labels[k]+' আগের লেখার সঙ্গে মেলেনি—নিজে মিলিয়ে নিন।');continue;}old[k]=value;showCardOption(k,value);filled.push(labels[k]);review.push(labels[k]+' কার্ড থেকে বসেছে—official যাচাই বাকি।');continue;}const match=el.tagName==='SELECT'?optionValue(el,value):value;if(!match){review.push(labels[k]+' official option-এ মেলেনি।');continue;}if(current[k]&&current[k]!==match){review.push(labels[k]+' আগের লেখার সঙ্গে মেলেনি—নিজে মিলিয়ে নিন।');continue;}el.value=match;old[k]=match;filled.push(labels[k]);}
  try{sessionStorage.setItem('hsc-public-draft',JSON.stringify({...old,...Object.fromEntries(keys.filter(k=>!form.elements.namedItem(k).disabled).map(k=>[k,form.elements.namedItem(k).value]))}));}catch{}
  $('card-status').textContent='';
  const missing=keys.find(k=>!form.elements.namedItem(k).value&&!form.elements.namedItem(k).disabled);if(missing)form.elements.namedItem(missing).focus();
 }catch(e){if(run===revision)$('card-status').textContent=e.message+'\nতথ্য নিজে লিখে official site ব্যবহার করতে পারেন।';}finally{if(run===revision){$('ocr-progress').hidden=true;$('cancel-ocr').hidden=true;}}
};
$('reset').onclick=()=>{revision++;controller?.abort();form.reset();for(const k of keys)form.elements.namedItem(k).value='';$('card-file').value='';$('card-status').textContent=$('status').textContent='';$('ocr-progress').hidden=$('cancel-ocr').hidden=true;try{sessionStorage.removeItem('hsc-public-draft');}catch{}};
