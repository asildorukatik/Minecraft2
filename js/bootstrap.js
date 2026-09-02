
(()=>{
  if(globalThis.DorukGPUBridge)globalThis.DorukGPUBridge.init().catch(()=>{});
  if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){navigator.serviceWorker.register('./sw.js').then(async()=>{try{const reg=await navigator.serviceWorker.ready;(reg.active||reg.waiting)?.postMessage({type:'warm-audio-cache'});}catch{}}).catch(error=>console.warn('DorukCraft service worker unavailable',error));}
})();
