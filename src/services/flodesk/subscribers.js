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
    // First get all subscribers and filter by email
    const response = await client.get(ENDPOINTS.subscribers.base, {
      params: { email }
    });
    
    const subscribers = response.data.subscribers || [];
    const subscriber = subscribers.find(sub => sub.email === email);
    
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
    const subscriber = await this.getSubscriber(apiKey, email);
    return client.delete(`${ENDPOINTS.subscribers.base}/${subscriber.data.id}/segments/${segmentId}`);
  },

  async addToSegments(apiKey, email, segmentIds) {
    const client = createFlodeskClient(apiKey);
    const subscriber = await this.getSubscriber(apiKey, email);
    return client.post(`${ENDPOINTS.subscribers.base}/${subscriber.data.id}/segments`, {
      segment_ids: segmentIds
    });
  },

  async unsubscribeFromAll(apiKey, email) {
    const client = createFlodeskClient(apiKey);
    const subscriber = await this.getSubscriber(apiKey, email);
    return client.post(`${ENDPOINTS.subscribers.base}/${subscriber.data.id}/unsubscribe`);
  }
}; 