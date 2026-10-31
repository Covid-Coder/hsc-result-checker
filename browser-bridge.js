(()=>{
 const waiting=new Map(),listeners=new Set();let sequence=0;
 window.addEventListener('message',event=>{
  if(event.source!==window||event.origin!==location.origin||event.data?.source!=='hsc-extension')return;
  const message=event.data;if(message.id&&waiting.has(message.id)){const {resolve,timer}=waiting.get(message.id);clearTimeout(timer);waiting.delete(message.id);resolve(message.data);}
  else if(message.event==='state')for(const listener of listeners)listener(message.data);
 });
 globalThis.HSC_BRIDGE={request(action,values){return new Promise((resolve,reject)=>{const id='hsc-'+Date.now()+'-'+(++sequence);const timer=setTimeout(()=>{waiting.delete(id);reject(Error('Browser extension bridge পাওয়া যায়নি। PC-তে extension চালু করে তার icon-এ এই GitHub Pages সাইটের অনুমতি দিন, তারপর পৃষ্ঠা reload করুন। মোবাইলে official site link ব্যবহার করুন।'));},8000);waiting.set(id,{resolve,timer});window.postMessage({source:'hsc-page',id,action,values},location.origin);});},onState(fn){listeners.add(fn);return ()=>listeners.delete(fn);}};
})();
