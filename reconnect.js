const reason=document.getElementById('reason'),button=document.getElementById('connect'),statusBox=document.getElementById('status');
try{reason.textContent=sessionStorage.getItem('hsc-public-reason')||'Official tab সংযোগ করুন।';}catch{}
function accept(data){if(data.phase==='form'&&data.options){button.textContent='Connected';location.replace('index.html');return;}button.textContent='Connect to Site';statusBox.textContent=data.error||data.message||'Official tab-এ verification নিজে শেষ করে আবার Connect করুন।';}
HSC_BRIDGE.onState(accept);
button.onclick=async()=>{button.disabled=true;button.textContent='Connecting…';try{accept(await HSC_BRIDGE.request('connect'));}catch(e){button.textContent='Connect to Site';statusBox.textContent=e.message+'\nমোবাইলে official site-এর link ব্যবহার করুন।';}finally{button.disabled=false;}};
