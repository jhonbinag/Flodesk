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

      // Get all subscribers with email filter
      const response = await client.get(ENDPOINTS.subscribers.base, {
        params: {
          email: email // This will filter on Flodesk's side
        }
      });

      console.log('Search response:', {
        total: response.data?.subscribers?.length,
        data: response.data
      });

      // Check if we got any results
      const subscribers = response.data?.subscribers || [];
      const exactMatch = subscribers.find(sub => 
        sub.email.toLowerCase() === email.toLowerCase()
      );

      if (!exactMatch) {
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

      // Return the exact matching subscriber
      return { 
        data: exactMatch
      };
    } catch (error) {
      console.error('Flodesk API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        endpoint: `${ENDPOINTS.subscribers.base}`,
        params: { email }
      });

      // If it's already our custom 404 error, throw it as is
      if (error.response?.status === 404) {
        throw error;
      }

      // For other errors, throw a generic error
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
    // First get the subscriber to ensure they exist
    const subscriber = await this.getSubscriber(apiKey, email);
    return client.delete(`${ENDPOINTS.subscribers.base}/${subscriber.data.id}/segments/${segmentId}`);
  },

  async addToSegments(apiKey, email, segmentIds) {
    const client = createFlodeskClient(apiKey);
    // First get the subscriber to ensure they exist
    const subscriber = await this.getSubscriber(apiKey, email);
    return client.post(`${ENDPOINTS.subscribers.base}/${subscriber.data.id}/segments`, {
      segment_ids: segmentIds
    });
  },

  async unsubscribeFromAll(apiKey, email) {
    const client = createFlodeskClient(apiKey);
    // First get the subscriber to ensure they exist
    const subscriber = await this.getSubscriber(apiKey, email);
    return client.post(`${ENDPOINTS.subscribers.base}/${subscriber.data.id}/unsubscribe`);
  }
}; 