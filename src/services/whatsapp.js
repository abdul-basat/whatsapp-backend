import * as wpp from './wppconnectDriver.js';
import * as baileys from './baileysDriver.js';
import redisClient from '../utils/redis.js';

// Provider selection is static; no database lookup is used.
function getProviderForUser(userId) {
  // Return 'wpp' or 'baileys'. Default to env or wpp.
  return process.env.WHATSAPP_PROVIDER || 'wpp';
}

function selectDriver(userId) {
  const provider = getProviderForUser(userId);
  return provider === 'baileys' ? baileys : wpp;
}

async function getSessionForUser(userId) {
  // Get the session name from Redis, fallback to userId
  return await redisClient.get(`wa_session:${userId}`) || userId;
}

export async function connect(userId) {
  // Call WPPConnect to create a session
  const result = await selectDriver(userId).connect(userId);
  // Store the mapping in Redis (optional: set an expiry)
  await redisClient.set(`wa_session:${userId}`, userId);
  return result;
}

export async function disconnect(userId) {
  const session = await getSessionForUser(userId);
  await redisClient.del(`wa_session:${userId}`);
  return selectDriver(userId).disconnect(session);
}

export async function getStatus(userId) {
  const session = await getSessionForUser(userId);
  return selectDriver(userId).getStatus(session);
}

export async function getQR(userId) {
  const session = await getSessionForUser(userId);
  return selectDriver(userId).getQR(session);
}

export async function sendMessage(userId, numbers, message) {
  const session = await getSessionForUser(userId);
  return selectDriver(userId).sendMessage(session, numbers, message);
}
