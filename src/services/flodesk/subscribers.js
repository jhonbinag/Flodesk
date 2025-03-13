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
      console.log('Attempting to get subscriber by email:', { email });

      // Get all subscribers first
      const response = await client.get(ENDPOINTS.subscribers.base);

      console.log('All subscribers response:', {
        total: response.data?.subscribers?.length,
        data: response.data
      });

      // Find the subscriber with matching email
      const subscribers = response.data?.subscribers || [];
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

      // Return in the same format as other responses
      return { 
        data: {
          subscriber: subscriber
        }
      };
    } catch (error) {
      console.error('Flodesk API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        endpoint: ENDPOINTS.subscribers.base
      });

      if (error.response?.status === 404) {
        throw error;
      }

      throw {
        response: {
          status: error.response?.status || 500,
          data: {
            message: error.response?.data?.message || 'Failed to get subscriber',
            code: error.response?.data?.code || 'error'
          }
        }
      };
    }
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