import axios from 'axios';
import { FLODESK_API_BASE_URL } from '../config/constants.js';

export const createFlodeskClient = (apiKey) => {
  // Remove any whitespace from the API key
  const cleanApiKey = apiKey.trim();
  
  return axios.create({
    baseURL: FLODESK_API_BASE_URL,
    headers: {
      // Just use the API key directly
      'Authorization': cleanApiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    // Add timeout and validation
    timeout: 10000,
    validateStatus: (status) => {
      return status >= 200 && status < 500;
    }
  });
}; 