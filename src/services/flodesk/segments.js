import { ENDPOINTS } from '../../config/constants.js';
import { createFlodeskClient } from '../../utils/apiClient.js';

export const segmentsService = {
  async getAllSegments(apiKey) {
    const client = createFlodeskClient(apiKey);
    try {
      const response = await client.get(ENDPOINTS.segments.base);
      
      // Debug log to see raw response
      console.log('Raw Segments Response:', JSON.stringify(response.data, null, 2));

      // Get segments array from response
      let segments = [];
      
      // Try to get segments from various possible response structures
      if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
        segments = response.data.data.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        segments = response.data.data;
      } else if (Array.isArray(response.data)) {
        segments = response.data;
      } else if (response.data?.segments && Array.isArray(response.data.segments)) {
        segments = response.data.segments;
      }

      // Transform segments and fetch subscribers for each
      const segmentsWithSubscribers = await Promise.all(
        segments
          .filter(segment => segment.id && segment.name)
          .map(async segment => {
            try {
              // Get subscribers for this segment
              const subscribersResponse = await client.get(`${ENDPOINTS.segments.base}/${segment.id}/subscribers`);
              console.log(`Subscribers Response for ${segment.id}:`, JSON.stringify(subscribersResponse.data, null, 2));

              // Extract subscribers from response
              let subscribersList = [];
              if (subscribersResponse.data?.data?.subscribers) {
                subscribersList = subscribersResponse.data.data.subscribers;
              } else if (subscribersResponse.data?.subscribers) {
                subscribersList = subscribersResponse.data.subscribers;
              } else if (subscribersResponse.data?.data) {
                subscribersList = subscribersResponse.data.data;
              } else if (Array.isArray(subscribersResponse.data)) {
                subscribersList = subscribersResponse.data;
              }

              // Map subscribers to value-label format
              const subscribers = subscribersList.map(sub => ({
                value: sub.id || sub._id || '',
                label: sub.email || ''
              }));

              console.log(`Processed subscribers for segment ${segment.id}:`, subscribers);

              return {
                value: segment.id,
                label: segment.name,
                subscribers
              };
            } catch (error) {
              console.error(`Error fetching subscribers for segment ${segment.id}:`, error.response?.data || error.message);
              // Continue with empty subscribers array on error
              return {
                value: segment.id,
                label: segment.name,
                subscribers: []
              };
            }
          })
      );

      console.log('Final segments with subscribers:', JSON.stringify(segmentsWithSubscribers, null, 2));
      return segmentsWithSubscribers;

    } catch (error) {
      console.error('Error getting segments:', error.response?.data || error.message);
      throw error;
    }
  },

  async getSegment(apiKey, segmentId) {
    const client = createFlodeskClient(apiKey);
    try {
      // Get segment details
      const response = await client.get(`${ENDPOINTS.segments.base}/${segmentId}`);
      console.log('Raw Segment Response:', response.data);
      const segment = response.data;

      // Get subscribers in this segment
      const subscribersResponse = await client.get(`${ENDPOINTS.segments.base}/${segmentId}/subscribers`);
      console.log('Segment Subscribers Response:', subscribersResponse.data);

      // Transform subscribers into value-label pairs
      const subscribers = (subscribersResponse.data?.subscribers || []).map(sub => ({
        value: sub.id || '',
        label: sub.email || ''
      }));

      // Return segment with its subscribers
      return {
        value: segment.id || '',
        label: segment.name || '',
        subscribers: {
          options: subscribers // Using same format as other endpoints
        }
      };
    } catch (error) {
      console.error('Error getting segment:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.response?.status === 404) {
        throw {
          response: {
            status: 404,
            data: {
              message: `Segment with id ${segmentId} not found`,
              code: 'not_found'
            }
          }
        };
      }

      throw error;
    }
  },

  async getSegmentSubscribers(apiKey, segmentId) {
    const client = createFlodeskClient(apiKey);
    return client.get(`${ENDPOINTS.segments.base}/${segmentId}/subscribers`);
  }
}; 