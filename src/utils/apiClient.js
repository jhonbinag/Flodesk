import axios from 'axios';
import { FLODESK_API_BASE_URL } from '../config/constants';

export const createFlodeskClient = (apiKey) => {
  return axios.create({
    baseURL: FLODESK_API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }
  });
}; 