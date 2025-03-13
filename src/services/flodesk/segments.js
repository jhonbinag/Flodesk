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
      }

      // Transform into value-label pairs
      const options = segments
        .filter(segment => segment.id && segment.name)
        .map(segment => ({
          value: segment.id,
          label: segment.name
        }));

      return options;
    } catch (error) {
      console.error('Error getting segments:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      return [];
    }
  },

  async getSegment(apiKey, segmentId) {
    const client = createFlodeskClient(apiKey);
    try {
      const response = await client.get(`${ENDPOINTS.segments.base}/${segmentId}`);
      
      console.log('Raw Segment Response:', response.data);

      const segment = response.data;

      // Return just the value-label pair
      return {
        value: segment.id || '',
        label: segment.name || ''
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