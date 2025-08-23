/**
 * Input validation and sanitization utilities
 * Provides comprehensive validation for API inputs
 */

/**
 * Email validation regex pattern
 * Validates standard email format
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * API key validation regex pattern
 * Flodesk API keys are typically alphanumeric strings
 */
const API_KEY_REGEX = /^[a-zA-Z0-9_-]+$/;

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {object} Validation result with isValid and message
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }
  
  if (typeof email !== 'string') {
    return { isValid: false, message: 'Email must be a string' };
  }
  
  const trimmedEmail = email.trim();
  
  if (trimmedEmail.length === 0) {
    return { isValid: false, message: 'Email cannot be empty' };
  }
  
  if (trimmedEmail.length > 254) {
    return { isValid: false, message: 'Email is too long (max 254 characters)' };
  }
  
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { isValid: false, message: 'Invalid email format' };
  }
  
  return { isValid: true, sanitized: trimmedEmail.toLowerCase() };
};

/**
 * Validates API key format
 * @param {string} apiKey - API key to validate
 * @returns {object} Validation result with isValid and message
 */
export const validateApiKey = (apiKey) => {
  if (!apiKey) {
    return { isValid: false, message: 'API key is required' };
  }
  
  if (typeof apiKey !== 'string') {
    return { isValid: false, message: 'API key must be a string' };
  }
  
  const trimmedKey = apiKey.trim();
  
  if (trimmedKey.length === 0) {
    return { isValid: false, message: 'API key cannot be empty' };
  }
  
  if (trimmedKey.length < 10) {
    return { isValid: false, message: 'API key is too short (minimum 10 characters)' };
  }
  
  if (trimmedKey.length > 100) {
    return { isValid: false, message: 'API key is too long (maximum 100 characters)' };
  }
  
  if (!API_KEY_REGEX.test(trimmedKey)) {
    return { isValid: false, message: 'API key contains invalid characters' };
  }
  
  return { isValid: true, sanitized: trimmedKey };
};

/**
 * Extracts API key from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Extracted API key or null if invalid format
 */
export const extractApiKeyFromAuth = (authHeader) => {
  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }
  
  const trimmed = authHeader.trim();
  
  // Handle Basic authentication
  if (trimmed.toLowerCase().startsWith('basic ')) {
    return trimmed.substring(6).trim();
  }
  
  // Handle Bearer authentication
  if (trimmed.toLowerCase().startsWith('bearer ')) {
    return trimmed.substring(7).trim();
  }
  
  // If no prefix, assume it's the raw API key
  return trimmed;
};

/**
 * Validates segment IDs array
 * @param {array} segmentIds - Array of segment IDs to validate
 * @returns {object} Validation result with isValid and message
 */
export const validateSegmentIds = (segmentIds) => {
  if (!segmentIds) {
    return { isValid: false, message: 'Segment IDs are required' };
  }
  
  if (!Array.isArray(segmentIds)) {
    return { isValid: false, message: 'Segment IDs must be an array' };
  }
  
  if (segmentIds.length === 0) {
    return { isValid: false, message: 'At least one segment ID is required' };
  }
  
  if (segmentIds.length > 50) {
    return { isValid: false, message: 'Too many segment IDs (maximum 50)' };
  }
  
  const sanitized = [];
  
  for (let i = 0; i < segmentIds.length; i++) {
    const segmentId = segmentIds[i];
    
    if (!segmentId || typeof segmentId !== 'string') {
      return { isValid: false, message: `Invalid segment ID at index ${i}` };
    }
    
    const trimmed = segmentId.trim();
    
    if (trimmed.length === 0) {
      return { isValid: false, message: `Empty segment ID at index ${i}` };
    }
    
    sanitized.push(trimmed);
  }
  
  // Remove duplicates
  const uniqueIds = [...new Set(sanitized)];
  
  return { isValid: true, sanitized: uniqueIds };
};

/**
 * Sanitizes string input by trimming and limiting length
 * @param {string} input - Input string to sanitize
 * @param {number} maxLength - Maximum allowed length (default: 1000)
 * @returns {string} Sanitized string
 */
export const sanitizeString = (input, maxLength = 1000) => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input.trim().substring(0, maxLength);
};

/**
 * Validates and sanitizes subscriber data
 * @param {object} subscriberData - Subscriber data to validate
 * @returns {object} Validation result with isValid, message, and sanitized data
 */
export const validateSubscriberData = (subscriberData) => {
  if (!subscriberData || typeof subscriberData !== 'object') {
    return { isValid: false, message: 'Subscriber data must be an object' };
  }
  
  const emailValidation = validateEmail(subscriberData.email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }
  
  const sanitized = {
    email: emailValidation.sanitized
  };
  
  // Sanitize optional fields
  if (subscriberData.first_name) {
    sanitized.first_name = sanitizeString(subscriberData.first_name, 50);
  }
  
  if (subscriberData.last_name) {
    sanitized.last_name = sanitizeString(subscriberData.last_name, 50);
  }
  
  if (subscriberData.custom_fields && typeof subscriberData.custom_fields === 'object') {
    sanitized.custom_fields = {};
    for (const [key, value] of Object.entries(subscriberData.custom_fields)) {
      if (typeof value === 'string') {
        sanitized.custom_fields[sanitizeString(key, 50)] = sanitizeString(value, 500);
      }
    }
  }
  
  return { isValid: true, sanitized };
};