// Placeholder legacy Baileys driver. It should match the API used by whatsapp.js service.
// You can keep your existing implementation or adapt it here.

export async function connect(session) {
  console.log('[Baileys] connect session', session);
  // TODO: implement
  return { status: 'connecting' };
}

export async function disconnect(session) {
  console.log('[Baileys] disconnect session', session);
  // TODO: implement
  return { status: 'disconnected' };
}

export async function getStatus(session) {
  console.log('[Baileys] getStatus', session);
  // TODO: implement
  return 'unknown';
}

export async function getQR(session) {
  console.log('[Baileys] getQR', session);
  // TODO: implement
  return { qr: null, status: 'unknown' };
}

export async function sendMessage(session, numbers, text) {
  console.log('[Baileys] sendMessage', session, numbers.length);
  // TODO: implement
  return { ok: true };
}
