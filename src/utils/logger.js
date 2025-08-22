/**
 * Structured logging utility
 * Provides consistent logging with different levels and proper formatting
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const LOG_LEVEL_NAMES = {
  0: 'ERROR',
  1: 'WARN',
  2: 'INFO',
  3: 'DEBUG'
};

// Set log level based on environment (default to INFO for production)
const currentLogLevel = process.env.LOG_LEVEL ? 
  LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] || LOG_LEVELS.INFO : 
  LOG_LEVELS.INFO;

/**
 * Formats log message with timestamp and level
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {object} meta - Additional metadata
 * @returns {string} Formatted log message
 */
const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const baseLog = `[${timestamp}] [${level}] ${message}`;
  
  if (Object.keys(meta).length > 0) {
    return `${baseLog} ${JSON.stringify(meta)}`;
  }
  
  return baseLog;
};

/**
 * Generic log function
 * @param {number} level - Log level number
 * @param {string} message - Log message
 * @param {object} meta - Additional metadata
 */
const log = (level, message, meta = {}) => {
  if (level <= currentLogLevel) {
    const levelName = LOG_LEVEL_NAMES[level];
    const formattedMessage = formatMessage(levelName, message, meta);
    
    if (level === LOG_LEVELS.ERROR) {
      console.error(formattedMessage);
    } else if (level === LOG_LEVELS.WARN) {
      console.warn(formattedMessage);
    } else {
      console.log(formattedMessage);
    }
  }
};

/**
 * Logger object with different log levels
 */
export const logger = {
  /**
   * Log error messages
   * @param {string} message - Error message
   * @param {object} meta - Additional error metadata
   */
  error: (message, meta = {}) => {
    log(LOG_LEVELS.ERROR, message, meta);
  },
  
  /**
   * Log warning messages
   * @param {string} message - Warning message
   * @param {object} meta - Additional metadata
   */
  warn: (message, meta = {}) => {
    log(LOG_LEVELS.WARN, message, meta);
  },
  
  /**
   * Log info messages
   * @param {string} message - Info message
   * @param {object} meta - Additional metadata
   */
  info: (message, meta = {}) => {
    log(LOG_LEVELS.INFO, message, meta);
  },
  
  /**
   * Log debug messages (only in development)
   * @param {string} message - Debug message
   * @param {object} meta - Additional metadata
   */
  debug: (message, meta = {}) => {
    log(LOG_LEVELS.DEBUG, message, meta);
  },
  
  /**
   * Log API requests
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {object} meta - Additional request metadata
   */
  apiRequest: (method, url, meta = {}) => {
    log(LOG_LEVELS.INFO, `API Request: ${method} ${url}`, meta);
  },
  
  /**
   * Log API responses
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {number} status - Response status code
   * @param {object} meta - Additional response metadata
   */
  apiResponse: (method, url, status, meta = {}) => {
    const level = status >= 400 ? LOG_LEVELS.ERROR : LOG_LEVELS.INFO;
    log(level, `API Response: ${method} ${url} - ${status}`, meta);
  },
  
  /**
   * Log API errors
   * @param {string} operation - Operation being performed
   * @param {Error} error - Error object
   * @param {object} meta - Additional error metadata
   */
  apiError: (operation, error, meta = {}) => {
    const errorMeta = {
      operation,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      ...meta
    };
    
    log(LOG_LEVELS.ERROR, `API Error in ${operation}`, errorMeta);
  }
};

export default logger;