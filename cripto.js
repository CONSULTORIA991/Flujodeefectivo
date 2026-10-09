/* Cifrado compartido por el login (index.html) y el tablero (tablero.html).
   Datos: AES-256-GCM con clave derivada de la contraseña por PBKDF2-SHA256.
   Sesión: al entrar, el login guarda en sessionStorage la clave derivada (no la contraseña);
   se borra al cerrar la pestaña o con "Cerrar sesión". */
(function () {
  const ITER = 600000;
  const SES = 'flujo-odesa-sesion';
  const REC = 'flujo-odesa-clave';

  function b64(u8) { let s = ''; for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768)); return btoa(s); }
  function deB64(s) { return Uint8Array.from(atob(s), c => c.charCodeAt(0)); }

  async function derivar(pwd, salt, iter, extraible) {
    const km = await crypto.subtle.importKey('raw', new TextEncoder().encode(pwd), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, extraible, ['encrypt', 'decrypt']);
  }
  async function abrir(enc, key) {
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: deB64(enc.iv) }, key, deB64(enc.ct));
    return JSON.parse(new TextDecoder().decode(pt));
  }

  async function cifrarDatos(obj, pwd) {
    const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await derivar(pwd, salt, ITER, false);
    const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(obj))));
    return { v: 1, iter: ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct) };
  }

  // Comprueba la contraseña abriendo los datos. Si es correcta, deja la sesión abierta.
  async function iniciarSesion(enc, pwd, recordar) {
    const key = await derivar(pwd, deB64(enc.salt), enc.iter, true);
    const datos = await abrir(enc, key);
    const raw = new Uint8Array(await crypto.subtle.exportKey('raw', key));
    try { sessionStorage.setItem(SES, JSON.stringify({ salt: enc.salt, k: b64(raw) })); } catch (e) {}
    try { if (recordar) localStorage.setItem(REC, pwd); else localStorage.removeItem(REC); } catch (e) {}
    return datos;
  }

  // Devuelve los datos si hay una sesión abierta o una contraseña recordada; si no, null.
  async function datosDeSesion(enc) {
    try {
      const s = JSON.parse(sessionStorage.getItem(SES) || 'null');
      if (s && s.salt === enc.salt) {
        const key = await crypto.subtle.importKey('raw', deB64(s.k), { name: 'AES-GCM' }, false, ['decrypt']);
        return await abrir(enc, key);
      }
    } catch (e) {}
    let p = null;
    try { p = localStorage.getItem(REC); } catch (e) {}
    if (p) {
      try { return await iniciarSesion(enc, p, true); }
      catch (e) { try { localStorage.removeItem(REC); } catch (x) {} }
    }
    return null;
  }

  function cerrarSesion() {
    try { sessionStorage.removeItem(SES); } catch (e) {}
    try { localStorage.removeItem(REC); } catch (e) {}
  }

  const disponible = !!(window.crypto && crypto.subtle);
  window.Cripto = { disponible, cifrarDatos, iniciarSesion, datosDeSesion, cerrarSesion };
})();
