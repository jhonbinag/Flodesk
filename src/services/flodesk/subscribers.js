import { ENDPOINTS } from '../../config/constants.js';
import { createFlodeskClient } from '../../utils/apiClient.js';

export const subscribersService = {
  async getAllSubscribers(apiKey) {
    const client = createFlodeskClient(apiKey);
    try {
      const response = await client.get(ENDPOINTS.subscribers.base);
      
      // Add logging to debug the response
      console.log('Flodesk Response:', {
        hasData: !!response.data,
        dataKeys: Object.keys(response.data || {}),
        subscribers: response.data?.subscribers
      });

      // Check if we have valid data
      if (!response.data || !Array.isArray(response.data.subscribers)) {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response format from Flodesk API');
      }

      // Transform the subscribers array into options format
      const options = response.data.subscribers.map(subscriber => ({
        value: subscriber.id,
        label: subscriber.email
      }));

      return {
        data: {
          options
        }
      };
    } catch (error) {
      console.error('Error getting subscribers:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  async getSubscriber(apiKey, email) {
    const client = createFlodeskClient(apiKey);
    try {
      // Use the direct endpoint to get subscriber by email
      const response = await client.get(`${ENDPOINTS.subscribers.base}/${email}`);
      return {
        data: response.data
      };
    } catch (error) {
      console.error('Error getting subscriber:', error);
      throw error;
    }
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