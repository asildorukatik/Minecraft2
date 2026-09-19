'use strict';
(function(root){
  const VERSION='0.22.5';
  const CACHE_KEY='dorukcraft-lighting-backend-v1';
  const DIRS=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
  const now=()=>root.performance?.now?.() ?? Date.now();
  const clamp15=v=>v<0?0:v>15?15:v|0;

  function emitterLevelForName(name){
    const n=String(name||'').toLowerCase().replaceAll('_',' ').trim();
    if(n.includes('redstone torch'))return 7;
    if(n.includes('soul torch')||n.includes('soul fire'))return 10;
    if(n.includes('torch'))return 14;
    if(n.includes('glowstone')||n.includes('sea lantern')||n.includes('jack o')||n.includes('jack-o')||n==='lava'||n.includes('lava ')||n.includes(' fire')||n==='fire')return 15;
    if(n.includes('magma'))return 3;
    if(n.includes('redstone ore'))return 9;
    if(n.includes('end portal'))return 15;
    return 0;
  }

  function seedVolume({world,width,height,depth,dimension='overworld',passableById,emissionById}){
    const n=width*height*depth,layer=width*depth,state=new Uint8Array(n),passable=new Uint8Array(n);
    const idx=(x,y,z)=>x+z*width+y*layer;
    for(let i=0;i<n;i++){
      const id=world[i]|0,can=passableById[id]?1:0,emit=clamp15(emissionById[id]||0);
      passable[i]=can;
      if(emit)state[i]|=emit<<4;
    }
    if(dimension==='overworld'){
      for(let z=0;z<depth;z++)for(let x=0;x<width;x++){
        let open=true;
        for(let y=height-1;y>=0;y--){const i=idx(x,y,z);if(!open)continue;if(passable[i])state[i]=(state[i]&0xf0)|15;else open=false;}
      }
    }else{
      const ambient=dimension==='nether'?6:7;
      for(let i=0;i<n;i++)if(passable[i])state[i]=(state[i]&0xf0)|ambient;
    }
    return{state,passable};
  }
  function packRenderRG(state,passable,width,height,depth){
    const n=state.length,layer=width*depth,rg=new Uint8Array(n*2);
    for(let i=0;i<n;i++){
      let sky=state[i]&15,block=(state[i]>>4)&15;
      if(!passable[i]){
        const y=Math.floor(i/layer),rem=i-y*layer,z=Math.floor(rem/width),x=rem-z*width;
        for(const [dx,dy,dz]of DIRS){const nx=x+dx,ny=y+dy,nz=z+dz;if(nx<0||nx>=width||ny<0||ny>=height||nz<0||nz>=depth)continue;const nv=state[nx+nz*width+ny*layer];sky=Math.max(sky,nv&15);block=Math.max(block,(nv>>4)&15);}
      }
      rg[i*2]=sky*17;rg[i*2+1]=block*17;
    }
    return rg;
  }

  function computeVoxelLight(opts){
    const {world,width,height,depth,dimension='overworld',passableById,emissionById}=opts;
    if(!world||!width||!height||!depth||!passableById||!emissionById)throw new Error('Invalid lighting volume');
    const n=width*height*depth,layer=width*depth,{state,passable}=seedVolume(opts),queue=new Int32Array(Math.max(1,n*2));
    let qh=0,qt=0;
    // Any seeded light can spread. Direct-sky cells at 15 and emitters are both seeds.
    for(let i=0;i<n;i++)if(state[i])queue[qt++]=i;
    while(qh<qt){
      const i=queue[qh++],v=state[i],sky=v&15,block=(v>>4)&15;
      if(sky<=1&&block<=1)continue;
      const y=Math.floor(i/layer),rem=i-y*layer,z=Math.floor(rem/width),x=rem-z*width;
      for(const [dx,dy,dz] of DIRS){
        const nx=x+dx,ny=y+dy,nz=z+dz;if(nx<0||nx>=width||ny<0||ny>=height||nz<0||nz>=depth)continue;
        const ni=nx+nz*width+ny*layer;if(!passable[ni])continue;
        const old=state[ni],oldSky=old&15,oldBlock=(old>>4)&15,newSky=Math.max(oldSky,sky-1),newBlock=Math.max(oldBlock,block-1);
        const nv=newSky|(newBlock<<4);if(nv!==old){state[ni]=nv;if(qt>=queue.length){ // Extremely pathological reseeding: finish with a JS queue fallback.
            const rest=[ni];while(rest.length){const ri=rest.shift(),rv=state[ri],rs=rv&15,rb=(rv>>4)&15,ry=Math.floor(ri/layer),rr=ri-ry*layer,rz=Math.floor(rr/width),rx=rr-rz*width;for(const [ddx,ddy,ddz]of DIRS){const ax=rx+ddx,ay=ry+ddy,az=rz+ddz;if(ax<0||ax>=width||ay<0||ay>=height||az<0||az>=depth)continue;const ai=ax+az*width+ay*layer;if(!passable[ai])continue;const ao=state[ai],as=ao&15,ab=(ao>>4)&15,ns=Math.max(as,rs-1),nb=Math.max(ab,rb-1),av=ns|(nb<<4);if(av!==ao){state[ai]=av;rest.push(ai);}}}qh=qt;break;}queue[qt++]=ni;}
      }
    }
    const sky=new Uint8Array(n),block=new Uint8Array(n);for(let i=0;i<n;i++){sky[i]=state[i]&15;block[i]=(state[i]>>4)&15;}
    const rg=packRenderRG(state,passable,width,height,depth);
    return{sky,block,rg,width,height,depth,backend:'cpu'};
  }

  function benchmarkCPU({size=22,iterations=1}={}){
    const width=size,height=Math.max(12,Math.floor(size*.7)),depth=size,n=width*height*depth,world=new Uint8Array(n),passableById=new Uint8Array(256),emissionById=new Uint8Array(256);passableById[0]=1;passableById[2]=1;emissionById[2]=14;
    const layer=width*depth,idx=(x,y,z)=>x+z*width+y*layer;
    for(let z=2;z<depth-2;z++)for(let x=2;x<width-2;x++)world[idx(x,height-3,z)]=1;
    for(let k=0;k<Math.max(1,Math.floor(size/6));k++)world[idx(3+k*4,2,3+k*3%Math.max(1,depth-4))]=2;
    const start=now();for(let i=0;i<iterations;i++)computeVoxelLight({world,width,height,depth,passableById,emissionById,dimension:'overworld'});return(now()-start)/iterations;
  }

  let gpuCtx=null;
  async function ensureGPU(){
    if(gpuCtx?.device)return gpuCtx;if(!root.navigator?.gpu)return null;
    try{
      let adapter=null,device=null;
      if(root.DorukGPUBridge){try{if(!root.DorukGPUBridge.ready)await root.DorukGPUBridge.init();adapter=root.DorukGPUBridge.adapter||null;device=root.DorukGPUBridge.device||null;}catch{}}
      if(!adapter)adapter=await root.navigator.gpu.requestAdapter({powerPreference:'high-performance'});if(!adapter)return null;
      if(!device)device=await adapter.requestDevice();
      const code=`struct P{w:u32,h:u32,d:u32,n:u32};@group(0)@binding(0)var<storage,read> src:array<u32>;@group(0)@binding(1)var<storage,read_write> dst:array<u32>;@group(0)@binding(2)var<storage,read> passable:array<u32>;@group(0)@binding(3)var<uniform> p:P;
      fn take(i:u32,s:u32,b:u32)->vec2<u32>{let v=src[i];return vec2<u32>(max(s,(v&15u)-select(1u,0u,(v&15u)==0u)),max(b,((v>>4u)&15u)-select(1u,0u,((v>>4u)&15u)==0u)));}
      @compute @workgroup_size(64)fn main(@builtin(global_invocation_id)gid:vec3<u32>){let i=gid.x;if(i>=p.n){return;}let own=src[i];if(passable[i]==0u){dst[i]=own;return;}let layer=p.w*p.d;let y=i/layer;let rem=i-y*layer;let z=rem/p.w;let x=rem-z*p.w;var s=own&15u;var b=(own>>4u)&15u;var q:vec2<u32>;
      if(x>0u){q=take(i-1u,s,b);s=q.x;b=q.y;}if(x+1u<p.w){q=take(i+1u,s,b);s=q.x;b=q.y;}if(z>0u){q=take(i-p.w,s,b);s=q.x;b=q.y;}if(z+1u<p.d){q=take(i+p.w,s,b);s=q.x;b=q.y;}if(y>0u){q=take(i-layer,s,b);s=q.x;b=q.y;}if(y+1u<p.h){q=take(i+layer,s,b);s=q.x;b=q.y;}dst[i]=s|(b<<4u);}`;
      const module=device.createShaderModule({code}),pipeline=device.createComputePipeline({layout:'auto',compute:{module,entryPoint:'main'}});
      gpuCtx={adapter,device,pipeline};device.lost.then(()=>{gpuCtx=null;try{root.localStorage?.removeItem(CACHE_KEY);}catch{}}).catch(()=>{gpuCtx=null;try{root.localStorage?.removeItem(CACHE_KEY);}catch{}});return gpuCtx;
    }catch(e){console.warn('DorukCraft WebGPU lighting unavailable',e);return null;}
  }

  async function computeGPU(opts){
    const ctx=await ensureGPU();if(!ctx)throw new Error('WebGPU lighting unavailable');
    const {device,pipeline}=ctx,{width,height,depth}=opts,n=width*height*depth,{state,passable}=seedVolume(opts);
    const state32=new Uint32Array(n),pass32=new Uint32Array(n);for(let i=0;i<n;i++){state32[i]=state[i];pass32[i]=passable[i];}
    const bytes=Math.max(4,n*4),usage=root.GPUBufferUsage;if(!usage)throw new Error('WebGPU buffer constants unavailable');const limits=device.limits||{};if((limits.maxStorageBufferBindingSize&&bytes>limits.maxStorageBufferBindingSize)||(limits.maxBufferSize&&bytes>limits.maxBufferSize))throw new Error('Lighting volume exceeds this GPU\'s buffer limits');if(limits.maxComputeWorkgroupsPerDimension&&Math.ceil(n/64)>limits.maxComputeWorkgroupsPerDimension)throw new Error('Lighting volume exceeds this GPU\'s compute dispatch limit');
    const mk=(label,extra=0)=>device.createBuffer({label,size:bytes,usage:usage.STORAGE|usage.COPY_DST|usage.COPY_SRC|extra});
    const a=mk('Doruk light A'),b=mk('Doruk light B'),pb=mk('Doruk passable'),params=device.createBuffer({size:16,usage:usage.UNIFORM|usage.COPY_DST}),read=device.createBuffer({size:bytes,usage:usage.MAP_READ|usage.COPY_DST});
    device.queue.writeBuffer(a,0,state32);device.queue.writeBuffer(b,0,state32);device.queue.writeBuffer(pb,0,pass32);device.queue.writeBuffer(params,0,new Uint32Array([width,height,depth,n]));
    let src=a,dst=b;const start=now();
    for(let iter=0;iter<15;iter++){
      const bind=device.createBindGroup({layout:pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:src}},{binding:1,resource:{buffer:dst}},{binding:2,resource:{buffer:pb}},{binding:3,resource:{buffer:params}}]});
      const enc=device.createCommandEncoder(),pass=enc.beginComputePass();pass.setPipeline(pipeline);pass.setBindGroup(0,bind);pass.dispatchWorkgroups(Math.ceil(n/64));pass.end();device.queue.submit([enc.finish()]);[src,dst]=[dst,src];
    }
    const enc=device.createCommandEncoder();enc.copyBufferToBuffer(src,0,read,0,bytes);device.queue.submit([enc.finish()]);await device.queue.onSubmittedWorkDone();await read.mapAsync(root.GPUMapMode.READ);const final32=new Uint32Array(read.getMappedRange().slice(0));read.unmap();
    const finalState=new Uint8Array(n),sky=new Uint8Array(n),block=new Uint8Array(n);for(let i=0;i<n;i++){const v=final32[i];finalState[i]=v&255;sky[i]=v&15;block[i]=(v>>4)&15;}const rg=packRenderRG(finalState,passable,width,height,depth);
    for(const buf of[a,b,pb,params,read])buf.destroy?.();return{sky,block,rg,width,height,depth,backend:'gpu',computeMs:now()-start};
  }

  async function benchmarkGPU({size=22}={}){
    const width=size,height=Math.max(12,Math.floor(size*.7)),depth=size,n=width*height*depth,world=new Uint8Array(n),passableById=new Uint8Array(256),emissionById=new Uint8Array(256);passableById[0]=1;passableById[2]=1;emissionById[2]=14;const layer=width*depth,idx=(x,y,z)=>x+z*width+y*layer;for(let z=2;z<depth-2;z++)for(let x=2;x<width-2;x++)world[idx(x,height-3,z)]=1;world[idx(3,2,3)]=2;const start=now();await computeGPU({world,width,height,depth,passableById,emissionById,dimension:'overworld'});return now()-start;
  }
  async function gpuSignature(){const ctx=await ensureGPU();if(!ctx)return'none';const l=ctx.device.limits||{},i=ctx.adapter?.info||{};return[String(root.navigator?.userAgent||''),i.vendor||'',i.architecture||'',i.device||'',i.description||'',l.maxBufferSize||0,l.maxComputeWorkgroupsPerDimension||0,l.maxStorageBufferBindingSize||0].join('|');}
  async function chooseBackend(preference='auto'){
    preference=String(preference||'auto').toLowerCase();if(preference==='cpu')return{backend:'cpu',reason:'manual'};
    const ctx=await ensureGPU();if(preference==='gpu')return ctx?{backend:'gpu',reason:'manual'}:{backend:'cpu',reason:'gpu-unavailable'};
    if(!ctx)return{backend:'cpu',reason:'webgpu-unavailable'};
    const sig=await gpuSignature();try{const cached=JSON.parse(root.localStorage?.getItem(CACHE_KEY)||'null');if(cached?.version===VERSION&&cached?.sig===sig&&['cpu','gpu'].includes(cached.backend))return{backend:cached.backend,reason:'cached-benchmark',cpuMs:cached.cpuMs,gpuMs:cached.gpuMs};}catch{}
    const cpuMs=benchmarkCPU({size:22,iterations:1});let gpuMs=Infinity;try{gpuMs=await benchmarkGPU({size:22});}catch{}
    const backend=gpuMs<cpuMs*.95?'gpu':'cpu';try{root.localStorage?.setItem(CACHE_KEY,JSON.stringify({version:VERSION,sig,backend,cpuMs,gpuMs,time:Date.now()}));}catch{}
    return{backend,reason:'benchmark',cpuMs,gpuMs};
  }

  const api={VERSION,computeVoxelLight,computeCPU:computeVoxelLight,computeGPU,benchmarkCPU,benchmarkGPU,chooseBackend,ensureGPU,emitterLevelForName,seedVolume,packRenderRG};
  root.DorukLighting=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:self);
