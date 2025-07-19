import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK with service account
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

// Initialize Firebase Admin if not already initialized
if (serviceAccount.private_key) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

/**
 * Middleware to verify Firebase ID token
 */
export const verifyToken = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the ID token
    const decodedToken = await getAuth().verifyIdToken(idToken);
    
    // Check if the token is valid and not expired
    if (!decodedToken || !decodedToken.uid) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    // Add the decoded token to the request object
    req.user = decodedToken;
    req.userId = decodedToken.uid;
    
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ 
      error: 'Unauthorized: Invalid or expired token',
      details: error.message 
    });
  }
};

/**
 * Middleware to check if user is authenticated
 */
export const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};
