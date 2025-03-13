import { ENDPOINTS } from '../../config/constants.js';
import { createFlodeskClient } from '../../utils/apiClient.js';

export const segmentsService = {
  async getAllSegments(apiKey) {
    const client = createFlodeskClient(apiKey);
    try {
      const response = await client.get(ENDPOINTS.segments.base);
      
      console.log('Raw Segments Response:', response.data);

      // Get segments array from response
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

      // Log what we found
      console.log('Parsed Segments:', segments);

      // Transform segments and fetch subscribers for each
      const segmentsWithSubscribers = await Promise.all(
        segments
          .filter(segment => {
            // Log any segments being filtered out
            if (!segment.id || !segment.name) {
              console.log('Filtered out segment:', segment);
            }
            return segment.id && segment.name;
          })
          .map(async segment => {
            try {
              // Get subscribers for this segment
              const subscribersResponse = await client.get(`${ENDPOINTS.segments.base}/${segment.id}/subscribers`);
              console.log(`Subscribers for segment ${segment.id}:`, subscribersResponse.data);
              
              // Transform subscribers into value-label pairs
              const subscribers = (subscribersResponse.data?.subscribers || []).map(sub => ({
                value: sub.id || '',
                label: sub.email || ''
              }));

              return {
                value: segment.id,
                label: segment.name,
                subscribers: {
                  options: subscribers
                }
              };
            } catch (subscriberError) {
              console.error(`Error getting subscribers for segment ${segment.id}:`, subscriberError);
              // Return segment without subscribers on error
              return {
                value: segment.id,
                label: segment.name,
                subscribers: {
                  options: []
                }
              };
            }
          })
      );

      console.log('Final segments with subscribers:', segmentsWithSubscribers);
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