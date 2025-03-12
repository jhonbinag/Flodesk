import axios from 'axios';
import { FLODESK_API_BASE_URL } from '../config/constants.js';

export const createFlodeskClient = (apiKey) => {
  return axios.create({
    baseURL: FLODESK_API_BASE_URL,
    headers: {
      'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}`,
      'Content-Type': 'application/json',
    }
  });
}; 