async function api(path,opts={}){
  const res=await fetch(SB_URL+'/rest/v1/'+path,{...opts,headers:{...HDRS,...(opts.headers||{})}});
  if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e.message||('HTTP '+res.status));}
  if(res.status===204)return null;
  return res.json();
}
async function hashPass(p){
  const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(p));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
function esc(s){if(s==null)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function timeAgo(d){
  if(!d)return'';
  const s=(Date.now()-new Date(d).getTime())/1000;
  if(s<0)return 'just now';
  if(s<60)return Math.floor(s)+' seconds ago';
  if(s<3600)return Math.floor(s/60)+' minutes ago';
  if(s<86400)return Math.floor(s/3600)+' hours ago';
  if(s<604800)return Math.floor(s/86400)+' days ago';
  return new Date(d).toLocaleDateString();
}
function getSession(){try{return JSON.parse(localStorage.getItem('bb_user')||'null');}catch(e){return null;}}
function setSession(u){localStorage.setItem('bb_user',JSON.stringify(u));}
function clearSession(){localStorage.removeItem('bb_user');}
function isProtectedUser(name){
  const n=(name||'').toLowerCase();
  return n==='tomodachi'||n==='sprinklolz!';
}
function isBanned(){
  const u=getSession();
  if(u&&isProtectedUser(u.username))return false;
  return localStorage.getItem('bb_banned')==='1';
}
function banLocal(reason){
  const u=getSession();
  if(u&&isProtectedUser(u.username))return;
  localStorage.setItem('bb_banned','1');
  localStorage.setItem('bb_ban_reason',reason||'banned');
}
function canPost(){
  if(isBanned())return{ok:false,msg:'You are banned from bryanbirth.'};
  return{ok:true};
}
function markPosted(){}
function isBlockedName(name){
  const n=(name||'').toLowerCase().replace(/\s+/g,'');
  return BLOCKED_NAMES.some(b=>n===b.replace(/\s+/g,'')||n.includes(b.replace(/\s+/g,'')));
}
async function getPosts(limit=40){return api('posts?select=*&order=created_at.desc&limit='+limit);}
async function createPost(data){return api('posts',{method:'POST',body:JSON.stringify(data)});}
async function deletePost(id){return api('posts?id=eq.'+id,{method:'DELETE'});}
async function updatePost(id,data){return api('posts?id=eq.'+id,{method:'PATCH',body:JSON.stringify(data)});}
async function getProfile(username){
  const d=await api('profiles?username=eq.'+encodeURIComponent(username)+'&select=*');
  return d&&d[0]?d[0]:null;
}
async function loginUser(username,password){
  const p=await getProfile(username);
  if(!p)throw new Error('User not found');
  if(p.banned&&!isProtectedUser(p.username))throw new Error('This account is banned');
  const h=await hashPass(password);
  if(p.password_hash!==h)throw new Error('Wrong password');
  return{username:p.username,display_name:p.display_name||p.username,avatar_url:p.avatar_url||'',is_admin:!!p.is_admin};
}
async function registerUser(username,password,displayName){
  if(isBlockedName(username))throw new Error('This username is not allowed');
  if(isBlockedName(displayName))throw new Error('This display name is not allowed');
  const existing=await getProfile(username);
  if(existing)throw new Error('Username taken');
  const h=await hashPass(password);
  await api('profiles',{method:'POST',body:JSON.stringify({username,display_name:displayName||username,avatar_url:'',bio:'',password_hash:h,is_admin:false,banned:false})});
  return{username,display_name:displayName||username,avatar_url:'',is_admin:false};
}
async function banUser(username){
  if(isProtectedUser(username))throw new Error('Cannot ban this user');
  return api('profiles?username=eq.'+encodeURIComponent(username),{method:'PATCH',body:JSON.stringify({banned:true})});
}
function fileToDataUrl(file,maxMB){
  return new Promise((res,rej)=>{
    if(file.size>(maxMB||8)*1024*1024){rej(new Error('File too large (max '+(maxMB||8)+'MB)'));return;}
    const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file);
  });
}
function applyTheme(t){
  document.documentElement.setAttribute('data-theme',t||'light');
  localStorage.setItem('bb_theme',t||'light');
}
function initTheme(){applyTheme(localStorage.getItem('bb_theme')||'light');}
