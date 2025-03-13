import axios from 'axios';
import { FLODESK_API_BASE_URL } from '../config/constants.js';

export const createFlodeskClient = (apiKey) => {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  const cleanApiKey = apiKey.trim();
  
  const client = axios.create({
    baseURL: FLODESK_API_BASE_URL,
    headers: {
      'Authorization': cleanApiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 30000 // Increased timeout
  });

  // Add request interceptor for logging
  client.interceptors.request.use(config => {
    console.log('Outgoing Request:', {
      method: config.method,
      url: config.url,
      headers: {
        ...config.headers,
        'Authorization': '[REDACTED]' // Don't log the actual API key
      },
      data: config.data
    });
    return config;
  });

  // Add response interceptor for logging
  client.interceptors.response.use(
    response => {
      console.log('API Response Success:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
      return response;
    },
    error => {
      console.error('API Response Error:', {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        message: error.message
      });
      throw error;
    }
  );

  return client;
}; 