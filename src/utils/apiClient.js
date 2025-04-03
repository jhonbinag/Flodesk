import axios from 'axios';
import { FLODESK_API_BASE_URL } from '../config/constants.js';

export const createFlodeskClient = (apiKey) => {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  const cleanApiKey = apiKey.trim();
  
  // Create Authorization header with Basic Authentication
  // Flodesk uses the API key as the username with an empty password
  const base64ApiKey = Buffer.from(`${cleanApiKey}:`).toString('base64');
  const authHeader = `Basic ${base64ApiKey}`;
  
  const client = axios.create({
    baseURL: FLODESK_API_BASE_URL,
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 30000 // Increased timeout
  });

  // Add request logging
  client.interceptors.request.use(request => {
    console.log('Making request to:', request.baseURL + request.url);
    return request;
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