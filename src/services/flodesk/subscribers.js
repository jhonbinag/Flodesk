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

      // Get all subscribers with email filter in query params
      const response = await client.get(ENDPOINTS.subscribers.base, {
        params: {
          email: email,
          per_page: 1 // Limit to 1 result since we're looking for a specific email
        }
      });

      console.log('Subscriber response:', {
        status: response.status,
        data: response.data
      });

      // Check if we got any subscribers
      if (!response.data?.subscribers?.length) {
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

      // Return the first subscriber that matches
      return { 
        data: {
          subscriber: response.data.subscribers[0]
        }
      };
    } catch (error) {
      console.error('Flodesk API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        endpoint: ENDPOINTS.subscribers.base,
        params: { email }
      });

      if (error.response?.status === 404 || !error.response) {
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