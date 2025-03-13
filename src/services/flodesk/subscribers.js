import { ENDPOINTS } from '../../config/constants.js';
import { createFlodeskClient } from '../../utils/apiClient.js';

export const subscribersService = {
  async getAllSubscribers(apiKey, params = {}) {
    const client = createFlodeskClient(apiKey);
    const response = await client.get(ENDPOINTS.subscribers.base, { params });
    return response;
  },

  async getSubscriber(apiKey, email) {
    // This function is now handled in flodeskHandler.js
    const response = await this.getAllSubscribers(apiKey);
    return response;
  },

  async createOrUpdate(apiKey, subscriberData) {
    const client = createFlodeskClient(apiKey);
    return client.post(ENDPOINTS.subscribers.base, subscriberData);
  },

  async removeFromSegment(apiKey, email, segmentId) {
    const client = createFlodeskClient(apiKey);
    // Get all subscribers and find the one with matching email
    const response = await this.getAllSubscribers(apiKey);
    const subscriber = response.data.subscribers.find(sub => 
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

    return client.delete(`${ENDPOINTS.subscribers.base}/${subscriber.id}/segments/${segmentId}`);
  },

  async addToSegments(apiKey, email, segmentIds) {
    const client = createFlodeskClient(apiKey);
    // Get all subscribers and find the one with matching email
    const response = await this.getAllSubscribers(apiKey);
    const subscriber = response.data.subscribers.find(sub => 
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

    return client.post(`${ENDPOINTS.subscribers.base}/${subscriber.id}/segments`, {
      segment_ids: segmentIds
    });
  },

  async unsubscribeFromAll(apiKey, email) {
    const client = createFlodeskClient(apiKey);
    // Get all subscribers and find the one with matching email
    const response = await this.getAllSubscribers(apiKey);
    const subscriber = response.data.subscribers.find(sub => 
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

    return client.post(`${ENDPOINTS.subscribers.base}/${subscriber.id}/unsubscribe`);
  }
}; 