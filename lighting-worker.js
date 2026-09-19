'use strict';
importScripts('./js/lighting-engine.js');
self.onmessage=event=>{try{const d=event.data||{},world=new Uint8Array(d.worldBuffer),passableById=new Uint8Array(d.passableBuffer),emissionById=new Uint8Array(d.emissionBuffer),r=self.DorukLighting.computeCPU({world,width:d.width,height:d.height,depth:d.depth,dimension:d.dimension,passableById,emissionById});self.postMessage({ok:true,rgBuffer:r.rg.buffer,width:r.width,height:r.height,depth:r.depth,backend:'cpu'},[r.rg.buffer]);}catch(error){self.postMessage({ok:false,error:String(error?.message||error)});}};
