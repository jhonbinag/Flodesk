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

      // Debug log to see what segments we found
      console.log('Found Segments:', JSON.stringify(segments, null, 2));

      if (segments.length === 0) {
        console.log('No segments found in response structure:', response.data);
        return [];
      }

      // Transform segments and fetch subscribers for each
      const segmentsWithSubscribers = await Promise.all(
        segments
          .filter(segment => {
            if (!segment.id || !segment.name) {
              console.log('Filtered out invalid segment:', segment);
              return false;
            }
            return true;
          })
          .map(async segment => {
            try {
              console.log(`Fetching subscribers for segment: ${segment.id}`);
              const subscribersResponse = await client.get(`${ENDPOINTS.segments.base}/${segment.id}/subscribers`);
              console.log(`Subscribers response for ${segment.id}:`, subscribersResponse.data);

              const subscribers = (subscribersResponse.data?.subscribers || []).map(sub => ({
                value: sub.id || '',
                label: sub.email || ''
              }));

              return {
                value: segment.id,
                label: segment.name,
                subscribers
              };
            } catch (error) {
              console.error(`Error fetching subscribers for segment ${segment.id}:`, error);
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
      console.error('Error getting segments:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error; // Let the handler deal with the error
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