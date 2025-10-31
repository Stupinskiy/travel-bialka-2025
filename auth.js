// auth.js — password gate for the travel site
const PASSWORD_SHA256 = "e2a77af20c526a95d65f63a78082a8f247b17d947dbcee7cbfb9da736ae74700";
const PASS_KEY = "travel.pass.ok";

async function sha256(text){
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
}

(function(){
  const here = location.pathname.split('/').pop() || '';
  const onLogin = here === '' || here === 'index.html' || here === 'login.html';
  if (!localStorage.getItem(PASS_KEY) && !onLogin){
    location.href = 'index.html';
  }
})();
