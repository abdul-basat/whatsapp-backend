// Rate limiting configuration
export default {
  // General API rate limits
  api: {
    points: 100, // Requests
    duration: 60, // Per 60 seconds
    blockDuration: 60 * 5, // Block for 5 minutes if exceeded
  },
  
  // Authentication endpoints
  auth: {
    points: 5, // Login attempts
    duration: 60 * 5, // Per 5 minutes
    blockDuration: 60 * 60, // Block for 1 hour
  },
  
  // WhatsApp message sending
  whatsapp: {
    points: 30, // Messages
    duration: 60, // Per minute
    blockDuration: 60 * 30, // Block for 30 minutes
  },
  
  // Webhook endpoints
  webhook: {
    points: 1000, // Requests
    duration: 60 * 60, // Per hour
    blockDuration: 60 * 60, // Block for 1 hour
  }
};
