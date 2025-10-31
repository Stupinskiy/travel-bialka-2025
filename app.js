// ===== Service Worker (PWA) =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}

// ===== Install prompt (Add to Home Screen) =====
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.querySelectorAll('#installBtn, #installHome').forEach(btn=>btn.style.display='inline-block');
});
async function installPWA(){
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  document.querySelectorAll('#installBtn, #installHome').forEach(btn=>btn.style.display='none');
}
window.installPWA = installPWA;

// ===== Theme toggle (manual + persist) =====
(function(){
  const KEY = 'ui.theme';
  const saved = localStorage.getItem(KEY);
  if (saved) document.documentElement.setAttribute('data-theme', saved);

  // create floating toggle if not exists
  window.addEventListener('DOMContentLoaded', ()=>{
    if (!document.querySelector('.theme-toggle')) {
      const btn = document.createElement('button');
      btn.className = 'theme-toggle';
      btn.title = 'Переключить тему';
      btn.textContent = (document.documentElement.getAttribute('data-theme')==='dark') ? '🌙' : '☀️';
      btn.addEventListener('click', ()=>{
        const cur = document.documentElement.getAttribute('data-theme')==='dark' ? 'light' : 'dark';
        if (cur==='light') document.documentElement.removeAttribute('data-theme');
        else document.documentElement.setAttribute('data-theme','dark');
        localStorage.setItem(KEY, cur);
        btn.textContent = (cur==='dark') ? '🌙' : '☀️';
      });
      document.body.appendChild(btn);
    }
  });
})();

// ===== D-Day timers (elements with data-date="YYYY-MM-DD") =====
function setupDDay(){
  const nodes = document.querySelectorAll('.dday[data-date]');
  function update(){
    const now = new Date();
    nodes.forEach(n=>{
      const target = new Date(n.getAttribute('data-date') + 'T00:00:00');
      // diff in days (local)
      const ms = target - now;
      const days = Math.ceil(ms / (1000*60*60*24));
      const num = n.querySelector('.num');
      const lab = n.querySelector('.label');
      if (num) num.textContent = (days >= 0 ? days : 0);
      if (lab) lab.textContent = (days>0) ? 'дн. осталось' : (days===0 ? 'сегодня' : 'прошло');
    });
  }
  update();
  setInterval(update, 60*1000);
}
window.addEventListener('DOMContentLoaded', setupDDay);

// ===== Splash screen (hide on ready or timeout) =====
window.addEventListener('load', ()=>{
  const s = document.getElementById('splash');
  if (!s) return;
  let done = false;
  const hide = ()=>{ if(done) return; done = true; s.classList.add('hide'); setTimeout(()=>s.remove(), 400); };
  // Try to hide when SW controller is ready (or fallback)
  if (navigator.serviceWorker) {
    navigator.serviceWorker.ready.then(hide).catch(()=>setTimeout(hide, 800));
  } else {
    setTimeout(hide, 800);
  }
});

// small helpers used elsewhere
function copyText(id){
  const el = document.getElementById(id);
  if(!el) return;
  navigator.clipboard.writeText(el.textContent.trim());
  const b = document.getElementById(id+'-badge');
  if(b){ b.textContent = 'Скопировано'; setTimeout(()=>b.textContent='Скопировать',1500); }
}
window.copyText = copyText;
// === Face ID gate ===
// Если на устройстве включён FaceLock и сессия не разблокирована — отправим на face.html (режим unlock)
(function(){
  if (!('credentials' in navigator) || !window.PublicKeyCredential) return; // нет поддержки — пропускаем
  const here = location.pathname.split('/').pop();
  const isFacePage = (here === 'face.html');
  if (typeof FaceLock === 'undefined') return; // webauthn.js не загружен
  if (FaceLock.faceGateShouldLock() && !isFacePage){
    location.href = 'face.html';
  }
})();

