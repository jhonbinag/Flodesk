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

  // Add response interceptor for better error handling
  client.interceptors.response.use(
    response => response,
    error => {
      console.error('Flodesk API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  );

  return client;
}; 