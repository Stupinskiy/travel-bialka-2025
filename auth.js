const PASSWORD_SHA256 = "54a5b2c1af6dfbfa5edb252df5f2cb316adcc64832d5685a769ea29ee97f1464";
const PASS_KEY = "travel.pass.ok";

async function sha256(text){
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
}

(function(){
  if (!localStorage.getItem(PASS_KEY) && !location.pathname.endsWith("login.html"))
    location.href = "login.html";
})();