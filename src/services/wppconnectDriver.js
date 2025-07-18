import { create, Whatsapp } from '@wppconnect-team/wppconnect';
import { EventEmitter } from 'events';

// In-memory store for WhatsApp client instances per session/user
const clients = {};
const eventEmitters = {};

// Create a new event emitter for a session
function getEventEmitter(session) {
  if (!eventEmitters[session]) {
    eventEmitters[session] = new EventEmitter();
  }
  return eventEmitters[session];
}

// Helper to get or create a WhatsApp client for a session
async function getClient(session) {
  if (clients[session]) return clients[session];
  
  const eventEmitter = getEventEmitter(session);
  
  try {
    clients[session] = await create({
      session,
      catchQR: (qrCode, asciiQR, attempts, urlCode) => {
        console.log(`[WPPConnect] QR Code generated (attempt ${attempts})`);
        clients[session].lastQR = qrCode;
        clients[session].lastQRTime = Date.now();
        eventEmitter.emit('qr', { 
          qr: qrCode, 
          status: 'QR_CODE_GENERATED',
          attempts,
          timestamp: Date.now()
        });
      },
      statusFind: (statusSession, session) => {
        console.log(`[WPPConnect] Status changed: ${statusSession}`);
        clients[session].lastStatus = statusSession;
        eventEmitter.emit('status', { 
          status: statusSession,
          timestamp: Date.now()
        });
        
        // Clean up if session is failed or disconnected
        if (['PAIRING', 'FAILED', 'DISCONNECTED'].includes(statusSession)) {
          setTimeout(() => {
            if (clients[session] && clients[session].lastStatus === statusSession) {
              console.log(`[WPPConnect] Cleaning up stale session: ${session}`);
              disconnect(session).catch(console.error);
            }
          }, 30000); // 30 seconds grace period
        }
      },
      headless: true,
      logQR: true, // Enable QR code logging for debugging
      autoClose: 300000, // auto close after 5 min if not paired
      disableWelcome: true,
      updatesLog: false,
      debug: process.env.NODE_ENV === 'development',
      createPathFileToken: true,
      waitForLogin: true,
      devtools: false,
      browserArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
    
    // Add event listeners for connection state
    clients[session].onStateChange((state) => {
      console.log(`[WPPConnect] Connection state changed: ${state}`);
      eventEmitter.emit('connection-state', state);
      
      if (state === 'CONFLICT' || state === 'UNLAUNCHED') {
        console.log(`[WPPConnect] Conflict detected, trying to resolve...`);
        clients[session].useHere();
      }
    });
    
    return clients[session];
  } catch (error) {
    console.error(`[WPPConnect] Error creating client for session ${session}:`, error);
    throw new Error(`Failed to create WhatsApp client: ${error.message}`);
  }
}

export async function connect(session) {
  try {
    const client = await getClient(session);
    const status = client.lastStatus || 'INITIALIZING';
    
    // If already connected or authenticated, return status
    if (['AUTHENTICATED', 'CONNECTED'].includes(status)) {
      return { 
        status: 'CONNECTED',
        message: 'Already connected to WhatsApp'
      };
    }
    
    // If QR code is already available, return it
    if (client.lastQR) {
      return { 
        status: 'QR_CODE_GENERATED',
        message: 'Scan the QR code to connect',
        qr: client.lastQR
      };
    }
    
    // Otherwise, wait for QR code generation
    return new Promise((resolve, reject) => {
      const eventEmitter = getEventEmitter(session);
      const timeout = setTimeout(() => {
        eventEmitter.off('qr', onQR);
        reject(new Error('QR code generation timed out'));
      }, 30000); // 30 seconds timeout
      
      const onQR = ({ qr, status }) => {
        clearTimeout(timeout);
        resolve({ 
          status: status || 'QR_CODE_GENERATED',
          message: 'Scan the QR code to connect',
          qr
        });
      };
      
      eventEmitter.once('qr', onQR);
    });
  } catch (error) {
    console.error(`[WPPConnect] Error connecting session ${session}:`, error);
    throw new Error(`Failed to connect to WhatsApp: ${error.message}`);
  }
}

export async function disconnect(session) {
  try {
    if (clients[session]) {
      console.log(`[WPPConnect] Disconnecting session: ${session}`);
      await clients[session].close();
      delete clients[session];
      
      // Clean up event emitter
      if (eventEmitters[session]) {
        eventEmitters[session].removeAllListeners();
        delete eventEmitters[session];
      }
      
      return { 
        status: 'DISCONNECTED',
        message: 'Successfully disconnected from WhatsApp'
      };
    }
    return { 
      status: 'NOT_FOUND',
      message: 'No active session found to disconnect'
    };
  } catch (error) {
    console.error(`[WPPConnect] Error disconnecting session ${session}:`, error);
    throw new Error(`Failed to disconnect: ${error.message}`);
  }
}

export async function getStatus(session) {
  try {
    if (!clients[session]) {
      return { 
        status: 'NOT_CONNECTED',
        message: 'No active WhatsApp session',
        connected: false
      };
    }
    
    const client = clients[session];
    const isConnected = await client.isConnected().catch(() => false);
    const status = client.lastStatus || (isConnected ? 'CONNECTED' : 'DISCONNECTED');
    
    return {
      status,
      connected: isConnected,
      message: `WhatsApp is ${status.toLowerCase()}`,
      qr: client.lastQR || null,
      lastActivity: client.lastQRTime || null
    };
  } catch (error) {
    console.error(`[WPPConnect] Error getting status for session ${session}:`, error);
    return {
      status: 'ERROR',
      connected: false,
      message: `Failed to get status: ${error.message}`
    };
  }
}

export async function getQR(session) {
  try {
    if (!clients[session]) {
      // If no client exists, create one to trigger QR generation
      await getClient(session);
      return { 
        qr: null, 
        status: 'INITIALIZING',
        message: 'Initializing QR code generation...' 
      };
    }
    
    const client = clients[session];
    const qrData = {
      qr: client.lastQR || null,
      status: client.lastStatus || 'UNKNOWN',
      timestamp: client.lastQRTime || null,
      message: client.lastQR ? 'QR code ready' : 'Generating QR code...'
    };
    
    // If no QR after 30 seconds, consider it timed out
    if (!client.lastQR && client.lastQRTime && (Date.now() - client.lastQRTime > 30000)) {
      qrData.status = 'TIMEOUT';
      qrData.message = 'QR code generation timed out. Please try again.';
    }
    
    return qrData;
  } catch (error) {
    console.error(`[WPPConnect] Error getting QR for session ${session}:`, error);
    return { 
      qr: null, 
      status: 'ERROR', 
      message: `Failed to generate QR code: ${error.message}` 
    };
  }
}

export async function sendMessage(session, numbers, text) {
  const client = await getClient(session);
  const results = [];
  for (const number of Array.isArray(numbers) ? numbers : [numbers]) {
    try {
      const to = number.includes('@c.us') ? number : `${number}@c.us`;
      const result = await client.sendText(to, text);
      results.push({ number, result });
    } catch (err) {
      results.push({ number, error: err.message });
    }
  }
  return results;
}
