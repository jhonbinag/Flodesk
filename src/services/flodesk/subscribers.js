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
    
    // Get all subscribers
    const response = await client.get(ENDPOINTS.subscribers.base);
    
    // Debug log to see API response structure
    console.log('Flodesk API Response:', {
      hasData: !!response.data,
      dataKeys: Object.keys(response.data),
      subscribersCount: response.data.subscribers?.length,
      firstSubscriber: response.data.subscribers?.[0]
    });
    
    // Find subscriber by email (case insensitive)
    const subscribers = response.data.subscribers || [];
    const subscriber = subscribers.find(sub => 
      sub.email.toLowerCase() === email.toLowerCase()
    );
    
    if (!subscriber) {
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
    
    return { data: subscriber };
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