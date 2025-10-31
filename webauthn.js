// webauthn.js — локальная Face ID/Touch ID блокировка (статичный сайт)
// ВАЖНО: это локальная защита на устройстве. Без сервера мы не валидируем подпись,
// а считаем успешный WebAuthn как условие входа. Для реальной криптопроверки нужен бэкенд.

const FACE_CFG = {
  enabledKey: 'face.enabled',      // '1' если включена локальная блокировка на этом устройстве
  sessionKey: 'face.ok',           // отметка разблокировки на текущую сессию (sessionStorage)
  credIdKey: 'face.cred.id',       // сохранённый credentialId (base64url)
  userIdKey: 'face.user.id',       // случайный userId (base64url)
};

// Base64url helpers
function b64uToBuf(b64u){
  const s = b64u.replace(/-/g,'+').replace(/_/g,'/');
  const pad = s.length % 4 ? '='.repeat(4 - (s.length % 4)) : '';
  const str = atob(s + pad);
  const buf = new ArrayBuffer(str.length);
  const view = new Uint8Array(buf);
  for (let i=0;i<str.length;i++) view[i] = str.charCodeAt(i);
  return buf;
}
function bufToB64u(buf){
  const bytes = new Uint8Array(buf);
  let s = '';
  for (let b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

function randomBytes(n=32){
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return a.buffer;
}

// ====== API ======

/** Включить Face ID: создаёт discoverable credential и сохраняет credentialId */
async function faceEnroll(){
  // userId генерим и сохраняем (локально)
  let userIdB64 = localStorage.getItem(FACE_CFG.userIdKey);
  if (!userIdB64){
    userIdB64 = bufToB64u(randomBytes(32));
    localStorage.setItem(FACE_CFG.userIdKey, userIdB64);
  }
  const userId = b64uToBuf(userIdB64);

  const publicKey = {
    challenge: randomBytes(32),
    rp: { name: 'Tatry 2025', id: location.hostname }, // rpId = домен GitHub Pages/свой домен
    user: {
      id: userId,
      name: 'viachaslau',          // произвольно
      displayName: 'Tatry 2025',   // произвольно
    },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 },   // ES256
      { type: 'public-key', alg: -257 }, // RS256 (на всякий)
    ],
    timeout: 60000,
    attestation: 'none',
    authenticatorSelection: {
      residentKey: 'preferred',      // discoverable
      userVerification: 'required',  // Face/Touch/PIN обязателен
      authenticatorAttachment: 'platform' // встроенный (Face ID / Touch ID)
    }
  };

  const cred = await navigator.credentials.create({ publicKey });
  if (!cred) throw new Error('Не удалось создать Passkey');

  // Сохраняем credentialId локально
  const credIdB64 = bufToB64u(cred.rawId);
  localStorage.setItem(FACE_CFG.credIdKey, credIdB64);
  localStorage.setItem(FACE_CFG.enabledKey, '1');

  // Разрешаем текущую сессию
  sessionStorage.setItem(FACE_CFG.sessionKey, '1');
  return true;
}

/** Разблокировка Face ID: запрашивает get() по сохранённому credentialId */
async function faceUnlock(){
  const credIdB64 = localStorage.getItem(FACE_CFG.credIdKey);
  if (!credIdB64) throw new Error('Face ID не настроен на этом устройстве');

  const allow = [{ type: 'public-key', id: b64uToBuf(credIdB64) }];

  const publicKey = {
    challenge: randomBytes(32),
    timeout: 60000,
    rpId: location.hostname,
    allowCredentials: allow,
    userVerification: 'required'
  };

  const assertion = await navigator.credentials.get({ publicKey });
  if (!assertion) throw new Error('Аутентификация отменена');

  // Без сервера мы не проверяем подпись, считаем успешный get() достаточным.
  sessionStorage.setItem(FACE_CFG.sessionKey, '1');
  return true;
}

/** Выключить Face ID на этом устройстве */
function faceDisable(){
  localStorage.removeItem(FACE_CFG.credIdKey);
  localStorage.removeItem(FACE_CFG.userIdKey);
  localStorage.removeItem(FACE_CFG.enabledKey);
  sessionStorage.removeItem(FACE_CFG.sessionKey);
}

/** Проверить, требуется ли локальная разблокировка */
function faceGateShouldLock(){
  const enabled = localStorage.getItem(FACE_CFG.enabledKey) === '1';
  const ok = sessionStorage.getItem(FACE_CFG.sessionKey) === '1';
  return enabled && !ok;
}

window.FaceLock = { faceEnroll, faceUnlock, faceDisable, faceGateShouldLock, FACE_CFG };

