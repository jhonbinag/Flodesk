import { ENDPOINTS } from '../../config/constants.js';
import { createFlodeskClient } from '../../utils/apiClient.js';

export const segmentsService = {
  async getAllSegments(apiKey) {
    const client = createFlodeskClient(apiKey);
    try {
      // Get all segments first
      const response = await client.get(ENDPOINTS.segments.base);
      console.log('Raw Segments Response:', JSON.stringify(response.data, null, 2));

      // Get segments array
      let segments = [];
      if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
        segments = response.data.data.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        segments = response.data.data;
      } else if (Array.isArray(response.data)) {
        segments = response.data;
      } else if (response.data?.segments && Array.isArray(response.data.segments)) {
        segments = response.data.segments;
      }

      // Get all subscribers
      const subscribersResponse = await client.get(ENDPOINTS.subscribers.base);
      console.log('All Subscribers Response:', JSON.stringify(subscribersResponse.data, null, 2));

      // Get subscribers array
      let allSubscribers = [];
      if (subscribersResponse.data?.data?.data) {
        allSubscribers = subscribersResponse.data.data.data;
      } else if (subscribersResponse.data?.data) {
        allSubscribers = subscribersResponse.data.data;
      } else if (Array.isArray(subscribersResponse.data)) {
        allSubscribers = subscribersResponse.data;
      }

      // Transform segments and match subscribers
      const segmentsWithSubscribers = segments
        .filter(segment => segment.id && segment.name)
        .map(segment => {
          // Find subscribers that belong to this segment
          const segmentSubscribers = allSubscribers
            .filter(sub => {
              // Check if subscriber has this segment
              return (sub.segments || []).some(subSegment => 
                subSegment.id === segment.id || 
                subSegment === segment.id
              );
            })
            .map(sub => ({
              value: sub.id || sub._id || '',
              label: sub.email || ''
            }));

          return {
            value: segment.id,
            label: segment.name,
            subscribers: segmentSubscribers
          };
        });

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