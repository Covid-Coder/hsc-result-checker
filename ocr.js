import * as pdfjs from './vendor/pdf.min.mjs';
pdfjs.GlobalWorkerOptions.workerSrc=new URL('./vendor/pdf.worker.min.mjs',import.meta.url).href;
export async function readCard(file,onProgress,signal){
 if(file.size>15*1024*1024)throw Error('সর্বোচ্চ ১৫ MB ফাইল দিন।');
 const isPDF=file.type==='application/pdf'||/\.pdf$/i.test(file.name);
 if(!isPDF&&!['image/jpeg','image/png','image/bmp'].includes(file.type))throw Error('JPG, PNG, BMP বা PDF দিন।');
 let worker,pdf,loadingTask,timer,stopped=false;
 const cancel=()=>{stopped=true;worker?.terminate();loadingTask?.destroy();};
 signal.addEventListener('abort',cancel,{once:true});
 try{
  if(signal.aborted)throw Error('কার্ড পড়া বন্ধ করা হয়েছে।');
  const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{cancel();reject(Error('দুই মিনিটে পড়া শেষ হয়নি। ছোট পরিষ্কার ফাইল দিন।'));},120000);});
  const process=async()=>{
   worker=await Tesseract.createWorker('eng',1,{workerPath:new URL('./vendor/worker.min.js',import.meta.url).href,corePath:new URL('./vendor/',import.meta.url).href,langPath:new URL('./vendor/',import.meta.url).href.replace(/\/$/,''),workerBlobURL:false,cacheMethod:'none',logger:m=>onProgress(m.progress||0)});
   if(stopped){await worker.terminate();throw Error('কার্ড পড়া বন্ধ করা হয়েছে।');}
   if(!isPDF){const bitmap=await createImageBitmap(file);try{if(bitmap.width>5000||bitmap.height>5000)throw Error('ছবি সর্বোচ্চ ৫০০০ pixel দৈর্ঘ্য/প্রস্থের দিন।');const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;canvas.getContext('2d').drawImage(bitmap,0,0);const result=await worker.recognize(canvas);return {text:result.data.text,pages:1};}finally{bitmap.close();}}
   loadingTask=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false,stopAtErrors:true,disableFontFace:true,useSystemFonts:true});
   pdf=await loadingTask.promise;if(pdf.numPages>3)throw Error('PDF সর্বোচ্চ ৩ পৃষ্ঠার দিন।');
   const texts=[];for(let n=1;n<=pdf.numPages;n++){
    if(stopped)throw Error('কার্ড পড়া বন্ধ করা হয়েছে।');
    const page=await pdf.getPage(n),base=page.getViewport({scale:1}),viewport=page.getViewport({scale:Math.min(2.5,2500/Math.max(base.width,base.height))}),canvas=document.createElement('canvas');
    canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
    const result=await worker.recognize(canvas);texts.push(result.data.text);canvas.width=canvas.height=1;page.cleanup();onProgress(n/pdf.numPages);
   }return {text:texts.join('\n\n'),pages:pdf.numPages};
  };
  return await Promise.race([process(),deadline]);
 }catch(e){if(signal.aborted)throw Error('কার্ড পড়া বন্ধ করা হয়েছে।');if(e.name==='PasswordException')throw Error('Password ছাড়া unlocked PDF দিন।');if(e.name==='InvalidPDFException')throw Error('PDF নষ্ট বা পড়া যাচ্ছে না। সঠিক PDF দিন।');throw e;}
 finally{clearTimeout(timer);signal.removeEventListener('abort',cancel);await worker?.terminate();await pdf?.destroy();}
}
