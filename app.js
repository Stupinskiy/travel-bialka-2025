if ('serviceWorker' in navigator)
  window.addEventListener('load', ()=> navigator.serviceWorker.register('./sw.js'));

let deferredPrompt;
window.addEventListener('beforeinstallprompt', e=>{
  e.preventDefault();
  deferredPrompt = e;
  const btn=document.querySelector('#installBtn');
  if(btn) btn.style.display='inline-block';
});
async function installPWA(){
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt=null;
  const btn=document.querySelector('#installBtn');
  if(btn) btn.style.display='none';
}