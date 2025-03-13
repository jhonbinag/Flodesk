import { ENDPOINTS } from '../../config/constants.js';
import { createFlodeskClient } from '../../utils/apiClient.js';

export const subscribersService = {
  async getAllSubscribers(apiKey) {
    const client = createFlodeskClient(apiKey);
    try {
      const response = await client.get(ENDPOINTS.subscribers.base);
      
      // Add logging to debug the response
      console.log('Raw Flodesk Response:', response.data);

      // Get subscribers array from response
      let subscribers = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          subscribers = response.data;
        } else if (response.data.subscribers && Array.isArray(response.data.subscribers)) {
          subscribers = response.data.subscribers;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          subscribers = response.data.data;
        }
      }

      // Transform into array of value-label pairs
      const options = subscribers
        .filter(subscriber => subscriber.email && (subscriber.id || subscriber._id))
        .map(subscriber => ({
          value: subscriber.id || subscriber._id,
          label: subscriber.email
        }));

      // Return just the options array
      return options;
    } catch (error) {
      console.error('Error getting subscribers:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Return empty array on error
      return [];
    }
  },

  async getSubscriber(apiKey, email) {
    const client = createFlodeskClient(apiKey);
    try {
      // Use the direct endpoint to get subscriber by email
      const response = await client.get(`${ENDPOINTS.subscribers.base}/${email}`);
      
      console.log('Raw Subscriber Response:', response.data);

      // Transform the response to include all required fields
      const subscriber = response.data;

      // Transform segments into options format
      const segmentOptions = (subscriber.segments || []).map(segment => ({
        value: segment.id || '',
        label: segment.name || ''
      }));

      return {
        id: subscriber.id || '',
        status: subscriber.status || 'active',
        email: subscriber.email || '',
        source: subscriber.source || 'manual',
        first_name: subscriber.first_name || '',
        last_name: subscriber.last_name || '',
        segments: {
          options: segmentOptions
        },
        custom_fields: subscriber.custom_fields || {},
        optin_ip: subscriber.optin_ip || '',
        optin_timestamp: subscriber.optin_timestamp || null,
        created_at: subscriber.created_at || null
      };
    } catch (error) {
      console.error('Error getting subscriber:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
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

  async createOrUpdate(apiKey, subscriberData) {
    const client = createFlodeskClient(apiKey);
    return client.post(ENDPOINTS.subscribers.base, subscriberData);
  },

  async removeFromSegment(apiKey, email, segmentId) {
    const client = createFlodeskClient(apiKey);
    // Get all subscribers and find the one with matching email
    const subscribers = await this.getAllSubscribers(apiKey);
    const subscriber = subscribers.find(sub => 
      sub.label.toLowerCase() === email.toLowerCase()
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

    return client.delete(`${ENDPOINTS.subscribers.base}/${subscriber.value}/segments/${segmentId}`);
  },

  async addToSegments(apiKey, email, segmentIds) {
    const client = createFlodeskClient(apiKey);
    // Get all subscribers and find the one with matching email
    const subscribers = await this.getAllSubscribers(apiKey);
    const subscriber = subscribers.find(sub => 
      sub.label.toLowerCase() === email.toLowerCase()
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

    return client.post(`${ENDPOINTS.subscribers.base}/${subscriber.value}/segments`, {
      segment_ids: segmentIds
    });
  },

  async unsubscribeFromAll(apiKey, email) {
    const client = createFlodeskClient(apiKey);
    // Get all subscribers and find the one with matching email
    const subscribers = await this.getAllSubscribers(apiKey);
    const subscriber = subscribers.find(sub => 
      sub.label.toLowerCase() === email.toLowerCase()
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

    return client.post(`${ENDPOINTS.subscribers.base}/${subscriber.value}/unsubscribe`);
  }
}; 