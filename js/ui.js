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
