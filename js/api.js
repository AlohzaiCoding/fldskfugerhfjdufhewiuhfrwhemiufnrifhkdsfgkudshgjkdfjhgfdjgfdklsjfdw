function renderTop(){
  const u=getSession();
  const links=u
    ?`<a href="index.html">Home</a><a href="profile.html?u=${encodeURIComponent(u.username)}">Profile</a><a href="settings.html">Settings</a><a href="#" id="logout-btn">Sign out</a>`
    :`<a href="login.html">Log in</a><a href="signup.html">Sign up</a>`;
  return `<div class="topbar">
    <a href="index.html"><img src="assets/logo.png" alt="bryanbirth"></a>
    <nav>${links}
      <span class="theme-btns">
        <button type="button" data-theme="light">Light</button>
        <button type="button" data-theme="normal">Normal</button>
        <button type="button" data-theme="dark">Dark</button>
      </span>
    </nav>
  </div>`;
}
function bindChrome(){
  const b=document.getElementById('logout-btn');
  if(b)b.onclick=e=>{e.preventDefault();clearSession();location.href='index.html';};
  document.querySelectorAll('[data-theme]').forEach(btn=>{
    btn.onclick=()=>applyTheme(btn.getAttribute('data-theme'));
  });
}
function checkBanGate(){
  if(isBanned()||detectTimeTravel()){
    document.body.innerHTML=`<div class="ban-screen"><h1>BANNED</h1><p>${esc(localStorage.getItem('bb_ban_reason')||'Rules broken')}</p><p style="color:#888;margin-top:12px;font-size:12px">bryanbirth · no spam · no time travel</p></div>`;
    return true;
  }
  return false;
}
function tweetHTML(t,admin){
  let media='';
  if(t.image_url)media+=`<div class="media"><img src="${esc(t.image_url)}" alt=""></div>`;
  if(t.video_url){
    if(String(t.video_url).includes('youtube')||String(t.video_url).includes('youtu.be'))
      media+=`<div class="media"><iframe src="${esc(t.video_url)}" style="width:100%;height:200px;border:none;border-radius:4px" allowfullscreen></iframe></div>`;
    else
      media+=`<div class="media"><video controls src="${esc(t.video_url)}" style="max-width:100%;max-height:280px"></video></div>`;
  }
  const adm=admin?`<button type="button" data-del="${t.id}">Delete</button>
    ${t.image_url?`<button type="button" data-rmimg="${t.id}">Remove image</button>`:''}
    ${t.video_url?`<button type="button" data-rmvid="${t.id}">Remove video</button>`:''}
    <button type="button" data-ban="${esc(t.username)}">Ban user</button>`:'';
  return `<div class="tweet" data-id="${t.id}">
    <img class="av" src="${esc(t.avatar||'https://via.placeholder.com/40')}" alt="">
    <div class="body">
      <span class="user"><a href="profile.html?u=${encodeURIComponent(t.username)}">${esc(t.display_name||t.username)}</a></span>
      <span class="meta">@${esc(t.username)} · ${timeAgo(t.created_at)}</span>
      <div class="text">${esc(t.body)}</div>
      ${media}
      <div class="actions"><a href="#">Reply</a><a href="#">Retweet</a><a href="#">Favorite</a>${adm}</div>
    </div>
  </div>`;
}

const SB_URL='https://gbdfaibmjtpxnbbhacgz.supabase.co';
const SB_KEY=(function(){
  const _0=['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9','eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZGZhaWJtanRweG5iYmhhY2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4MzE5MzIsImV4cCI6MjEwMjQwNzkzMn0','7uUMf3ZVWUtWlo3RcAzolWWH3DiafqRr5Pn_iPes-Io'];
  return _0.join('.');
})();
const HDRS={'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Content-Type':'application/json','Prefer':'return=representation'};
const BLOCKED_NAMES=['bento','cyano','blueno','bentothecoder','bluenothecoder','bento the coder','blueno the coder'];


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
  if(s<0)return 'from the future???';
  if(s<60)return Math.floor(s)+' seconds ago';
  if(s<3600)return Math.floor(s/60)+' minutes ago';
  if(s<86400)return Math.floor(s/3600)+' hours ago';
  if(s<604800)return Math.floor(s/86400)+' days ago';
  return new Date(d).toLocaleDateString();
}
function getSession(){try{return JSON.parse(localStorage.getItem('bb_user')||'null');}catch(e){return null;}}
function setSession(u){localStorage.setItem('bb_user',JSON.stringify(u));}
function clearSession(){localStorage.removeItem('bb_user');}
function isBanned(){return localStorage.getItem('bb_banned')==='1';}
function banLocal(reason){localStorage.setItem('bb_banned','1');localStorage.setItem('bb_ban_reason',reason||'banned');}
function detectTimeTravel(){
  const now=Date.now();
  const last=parseInt(localStorage.getItem('bb_last_clock')||'0',10);
  if(last&&now<last-60000){banLocal('time travel detected');return true;}
  localStorage.setItem('bb_last_clock',String(now));
  return false;
}
function getPostMeta(){try{return JSON.parse(localStorage.getItem('bb_post_meta')||'{"last":0,"strikes":0}');}catch(e){return{last:0,strikes:0};}}
function setPostMeta(m){localStorage.setItem('bb_post_meta',JSON.stringify(m));}
function canPost(){
  if(isBanned())return{ok:false,msg:'You are banned from bryanbirth.'};
  if(detectTimeTravel())return{ok:false,msg:'Time travel detected. Permanent ban.'};
  const m=getPostMeta();
  const now=Date.now();
  const wait=m.strikes>=2?(1000*365.25*24*3600*1000):(8*3600*1000);
  if(now-m.last<wait){
    const h=Math.ceil((wait-(now-m.last))/3600000);
    return{ok:false,msg:m.strikes>=2?'Rate limited for ~1000 years.':'Rate limit: wait ~'+h+' hour(s).'};
  }
  return{ok:true};
}
function markPosted(){
  const m=getPostMeta();
  const now=Date.now();
  if(m.last&&now-m.last<8*3600*1000)m.strikes=(m.strikes||0)+1;
  m.last=now;setPostMeta(m);
}
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
  if(p.banned)throw new Error('This account is banned');
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
