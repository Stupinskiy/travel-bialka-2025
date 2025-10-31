const PASSWORD_SHA256 = "87b5c5c234a5b7270555abbdeacfea39806356fa09ad8e37ca91d17876b3a4cd";
const PASS_KEY = "travel.pass.ok";

async function sha256(text){
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
}

(function(){
  if (!localStorage.getItem(PASS_KEY) && !location.pathname.endsWith("login.html"))
    location.href = "login.html";
})();