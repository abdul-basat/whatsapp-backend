export default {
  // Basic Configuration
  secretKey: process.env.WPPCONNECT_SECRET || 'your_secure_secret',
  host: process.env.HOST || 'http://localhost',
  port: parseInt(process.env.PORT || '21465'),
  deviceName: 'WPPConnect Server',
  poweredBy: 'WPPConnect-Server',
  startAllSession: true,
  tokenStoreType: 'file',
  maxCallStartupTime: 60,
  customUserDataDir: './.wwebjs_auth/',
  
  // Webhook Configuration
  webhook: {
    url: process.env.WEBHOOK_URL || null,
    autoDownload: true,
    uploadS3: process.env.S3_ENABLED === 'true' || false,
    readMessage: true,
    allUnreadOnStart: false,
    listenAcks: true,
    onPresenceChanged: true,
    onParticipantsChanged: true,
    onReactionMessage: true,
    onPollResponse: true,
    onRevokedMessage: true,
  },
  
  // Browser Configuration
  createOptions: {
    browserArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-features=AudioServiceAudioHandler',
    ],
  },
  
  // Mapper Configuration
  mapper: {
    enable: false,
    prefix: 'tag-',
  },
  
  // Browser Settings
  debug: false,
  browserWSEndpoint: '',
  browserWS: '',
  browserArgs: [],
  
  // Puppeteer Settings
  puppeteerOptions: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-features=AudioServiceAudioHandler',
    ],
  },
  
  // Application Settings
  disableWelcome: true,
  updatesLog: true,
  autoClose: 0,
  
  // Session Management
  tokenStore: {
    maxTokens: 30,
  },
  
  // Session Data Management
  sessionData: {
    // Auto-delete tokens after 30 days of inactivity
    autoDeleteSessionDays: 30,
    // Maximum number of sessions to keep
    maxSessions: 50,
  },
  
  // Security Configuration
  security: {
    // Enable CORS with specific origins
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    },
    // Rate limiting
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },
  
  // Health Check Configuration
  healthCheck: {
    enabled: true,
    path: '/health',
    healthyStatus: 200,
    unhealthyStatus: 503,
    interval: 30000, // 30 seconds
    timeout: 5000    // 5 seconds
  },
  
  // Logging Configuration
  archiveLogs: true,
  logDirectory: './logs',
  logMaxFiles: 7,
  logMaxSize: '10M',
  logCompress: true,
  logMaxAge: '30d',
  logTimestamp: true,
  logLevel: process.env.LOG_LEVEL || 'error',
  logConsole: process.env.LOG_CONSOLE === 'true' || false,
  logFile: 'wppconnect-server.log',
  logErrorFile: 'wppconnect-server-error.log',
  logConsoleLevel: process.env.LOG_CONSOLE_LEVEL || 'error',
  logConsolePretty: false,
  logConsoleColor: true,
  logConsoleTimestamp: true,
  logConsoleStderr: false,
  logConsoleStderrLevel: 'error',
  logConsoleStderrPretty: false,
  logConsoleStderrColor: true,
  logConsoleStderrTimestamp: true,
  logFileLevel: 'error',
  logFilePretty: false,
  logFileColor: false,
  logFileTimestamp: true,
  logFileMaxSize: '10M',
  logFileMaxFiles: 7,
  logFileTailable: true,
  logFileZippedArchive: true,
  logFileMaxDays: 30,
  logFileDatePattern: 'YYYY-MM-DD',
  
  // Additional Settings
  qr: {
    waitForLogin: true,
    autoClose: 0,
    qrMaxRetries: 3,
  },
  
  // Performance Tuning
  performance: {
    // Maximum time in milliseconds to wait for a page to load
    pageLoadTimeout: 30000,
    // Maximum time in milliseconds to wait for a selector
    waitForSelectorTimeout: 30000,
    // Maximum time in milliseconds to wait for navigation
    navigationTimeout: 30000,
  },
  
  // Cache Settings
  cache: {
    enabled: true,
    ttl: 3600, // 1 hour
    checkPeriod: 600, // 10 minutes
  },
  
  // Proxy Configuration (if needed)
  proxy: process.env.HTTP_PROXY || '',
};
