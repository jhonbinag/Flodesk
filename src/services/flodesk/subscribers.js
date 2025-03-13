import { ENDPOINTS } from '../../config/constants.js';
import { createFlodeskClient } from '../../utils/apiClient.js';

export const subscribersService = {
  async createOrUpdate(apiKey, subscriberData) {
    const client = createFlodeskClient(apiKey);
    return client.post(ENDPOINTS.subscribers.base, subscriberData);
  },

  async getAllSubscribers(apiKey, params = {}) {
    const client = createFlodeskClient(apiKey);
    return client.get(ENDPOINTS.subscribers.base, { params });
  },

  async getSubscriber(apiKey, email) {
    const client = createFlodeskClient(apiKey);
    
    try {
      console.log('Attempting to get subscriber:', {
        email,
        endpoint: `${ENDPOINTS.subscribers.base}/${encodeURIComponent(email)}`
      });

      // Use the direct subscriber endpoint with email
      const response = await client.get(`${ENDPOINTS.subscribers.base}/${encodeURIComponent(email)}`);

      console.log('Flodesk API Response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });

      return response;
    } catch (error) {
      console.error('Flodesk API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        stack: error.stack
      });

      if (error.response?.status === 404) {
        throw {
          response: {
            status: 404,
            data: {
              message: `Subscriber with email ${email} not found`,
              code: 'not_found'
            }
          }
        };
      }
      throw error;
    }
  },

  async removeFromSegment(apiKey, email, segmentId) {
    const client = createFlodeskClient(apiKey);
    return client.delete(`${ENDPOINTS.subscribers.base}/${encodeURIComponent(email)}/segments/${segmentId}`);
  },

  async addToSegments(apiKey, email, segmentIds) {
    const client = createFlodeskClient(apiKey);
    return client.post(`${ENDPOINTS.subscribers.base}/${encodeURIComponent(email)}/segments`, {
      segment_ids: segmentIds
    });
  },

  async unsubscribeFromAll(apiKey, email) {
    const client = createFlodeskClient(apiKey);
    return client.post(`${ENDPOINTS.subscribers.base}/${encodeURIComponent(email)}/unsubscribe`);
  }
}; 