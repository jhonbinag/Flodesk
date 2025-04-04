import { ENDPOINTS } from '../../config/constants.js';
import { createFlodeskClient } from '../../utils/apiClient.js';
import { segmentsService } from './segments.js';

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

      // Transform into array of value-label pairs, filtering for active subscribers only
      const options = subscribers
        .filter(subscriber => 
          subscriber.email && 
          (subscriber.id || subscriber._id) && 
          subscriber.status === 'active' // Only include active subscribers
        )
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

  async getSubscriber(apiKey, email, segmentsOnly = false) {
    const client = createFlodeskClient(apiKey);
    try {
      // Get subscriber details
      const response = await client.get(`${ENDPOINTS.subscribers.base}/${email}`);
      console.log('Raw Subscriber Response:', response.data);
      const subscriber = response.data;

      // Check if subscriber is inactive/unsubscribed
      if (subscriber.status !== 'active') {
        throw {
          response: {
            status: 404,
            data: {
              message: `Subscriber ${email} is not active`,
              code: 'inactive_subscriber'
            }
          }
        };
      }

      // Get all segments to match with subscriber's segments
      const segmentsResponse = await client.get(ENDPOINTS.segments.base);
      let allSegments = [];
      if (segmentsResponse.data?.data?.data) {
        allSegments = segmentsResponse.data.data.data;
      } else if (segmentsResponse.data?.data) {
        allSegments = segmentsResponse.data.data;
      } else if (Array.isArray(segmentsResponse.data)) {
        allSegments = segmentsResponse.data;
      }

      // Match subscriber's segments with complete segment data
      const subscriberSegments = (subscriber.segments || [])
        .map(subscriberSegment => {
          const matchingSegment = allSegments.find(segment => 
            segment.id === subscriberSegment.id
          );
          return matchingSegment ? {
            value: matchingSegment.id,
            label: matchingSegment.name
          } : null;
        })
        .filter(Boolean); // Remove any null values

      // If only segments are requested, return in options format
      if (segmentsOnly) {
        return {
          id: subscriber.id || '',
          email: subscriber.email || '',
          first_name: subscriber.first_name || '',
          last_name: subscriber.last_name || '',
          options: subscriberSegments
        };
      }

      // Otherwise return full subscriber data
      return {
        id: subscriber.id || '',
        status: subscriber.status || 'active',
        email: subscriber.email || '',
        source: subscriber.source || 'manual',
        first_name: subscriber.first_name || '',
        last_name: subscriber.last_name || '',
        segments: subscriberSegments,
        custom_fields: subscriber.custom_fields || {},
        optin_ip: subscriber.optin_ip || '',
        optin_timestamp: subscriber.optin_timestamp || null,
        created_at: subscriber.created_at || null
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

  async updateSubscriberSegments(apiKey, email, segment_ids) {
    const client = createFlodeskClient(apiKey);
    try {
      const segmentIdsArray = Array.isArray(segment_ids) ? segment_ids : [segment_ids];
      
      // PATCH request to update segments
      const response = await client.patch(`${ENDPOINTS.subscribers.base}/${email}/segments`, {
        segment_ids: segmentIdsArray
      });

      return response;
    } catch (error) {
      console.error('Error updating segments:', error);
      throw error;
    }
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
  },

  async removeFromSegment(apiKey, email, segment_ids) {
    const client = createFlodeskClient(apiKey);
    try {
      const segmentIdsArray = Array.isArray(segment_ids) ? segment_ids : [segment_ids];
      
      // DELETE request with body
      const response = await client.delete(`${ENDPOINTS.subscribers.base}/${email}/segments`, {
        data: {
          segment_ids: segmentIdsArray
        }
      });

      return response;
    } catch (error) {
      console.error('Error removing segments:', error);
      throw error;
    }
  }
}; 