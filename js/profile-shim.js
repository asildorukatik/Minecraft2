
(function(){
  const q=new URLSearchParams(location.search);
  let profile=q.get('dsProfile')||'',profileInfo=null,parentStore=null;
  try{
    if(parent!==window){
      parentStore=parent.localStorage;
      const rows=JSON.parse(parentStore.getItem('ds-profiles-v12')||'[]');
      if(!profile)profile=parentStore.getItem('ds-last-profile-v12')||'';
      if(Array.isArray(rows))profileInfo=rows.find(p=>p&&p.id===profile)||null;
    }
  }catch{}
  const suppliedName=(q.get('dsUsername')||'').trim();
  window.__dorukstationProfileId=profile||null;
  window.__dorukstationProfileName=(suppliedName||profileInfo?.name||'').slice(0,24);
  window.__dorukstationProfileFolder=q.get('dsFolder')||profileInfo?.folder||`users/${profile||'default'}/`;
  window.__dorukstationGuest=q.get('dsGuest')==='1';

  // The current DorukStation v0.18 launcher passes dsProfile/dsFolder for profiled
  // DorukCraft launches. Match its storage convention exactly. If there is no
  // explicit dsProfile (ordinary standalone/legacy launch), leave storage untouched.
  if(!q.get('dsProfile'))return;
  const app=q.get('dsApp')||'dorukcraft',folder=window.__dorukstationProfileFolder;
  const guest=window.__dorukstationGuest,foldered=q.get('dsFoldered')==='1'||guest;
  const P=foldered?`dorukstation:${folder}games/${app}/`:`dorukstation:${profile}:${app}:`;
  window.__dorukstationAppId=app;window.__dorukstationUserFolder=folder;
  try{
    const p=Storage.prototype,g=p.getItem,st=p.setItem,r=p.removeItem,k=p.key;
    p.getItem=function(x){return g.call(this,P+String(x))};
    p.setItem=function(x,v){return st.call(this,P+String(x),v)};
    p.removeItem=function(x){return r.call(this,P+String(x))};
    p.clear=function(){const a=[];for(let i=0;i<this.length;i++){const x=k.call(this,i);if(x&&x.startsWith(P))a.push(x)}for(const x of a)r.call(this,x)};
    p.key=function(i){let n=-1;for(let j=0;j<this.length;j++){const x=k.call(this,j);if(x&&x.startsWith(P)&&++n===i)return x.slice(P.length)}return null};
  }catch{}
  try{
    const d=indexedDB,o=d.open.bind(d),del=d.deleteDatabase?.bind(d);
    d.open=(n,v)=>{const full=P+n;if(guest)parent.postMessage({type:'dorukstation:guest-db',name:full},'*');return v===undefined?o(full):o(full,v)};
    if(del)d.deleteDatabase=n=>del(P+n);
  }catch{}
})();
