import axios from 'axios';
import { logger } from './logger.js';
import { FLODESK_API_BASE_URL } from '../config/constants.js';

export const createFlodeskClient = (apiKey) => {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  const cleanApiKey = apiKey.trim();
  
  const client = axios.create({
    baseURL: FLODESK_API_BASE_URL,
    headers: {
      'Authorization': `Basic ${cleanApiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 30000 // Increased timeout
  });

  // Add request logging
  client.interceptors.request.use(request => {
    logger.debug('Making API request', {
      url: request.baseURL + request.url,
      method: request.method
    });
    return request;
  });

  // Add response logging
  client.interceptors.response.use(
    response => {
      logger.debug('API response received', { 
        url: response.config.url,
        status: response.status,
        dataKeys: Object.keys(response.data || {})
      });
      return response;
    },
    error => {
      logger.apiError('API request failed', error, {
        url: error.config?.url,
        method: error.config?.method
      });
      throw error;
    }
  );

  return client;
};