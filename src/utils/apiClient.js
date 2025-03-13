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

  // Add request logging
  client.interceptors.request.use(config => {
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      params: config.params,
      data: config.data
    });
    return config;
  });

  // Add response logging
  client.interceptors.response.use(
    response => {
      console.log('API Response:', {
        status: response.status,
        data: response.data
      });
      return response;
    },
    error => {
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  );

  return client;
}; 