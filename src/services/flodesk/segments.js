import { ENDPOINTS } from '../../config/constants.js';
import { createFlodeskClient } from '../../utils/apiClient.js';

export const segmentsService = {
  async getAllSegments(apiKey) {
    const client = createFlodeskClient(apiKey);
    try {
      // Get all segments
      const response = await client.get(ENDPOINTS.segments.base);
      
      // Get segments array
      let segments = [];
      if (response.data?.data?.data) {
        segments = response.data.data.data;
      } else if (response.data?.data) {
        segments = response.data.data;
      } else if (Array.isArray(response.data)) {
        segments = response.data;
      }

      // Transform segments into simple value-label pairs
      const segmentOptions = segments
        .filter(segment => segment.id && segment.name)
        .map(segment => ({
          value: segment.id,
          label: segment.name
        }));

      return segmentOptions;
    } catch (error) {
      console.error('Error getting segments:', error.response?.data || error.message);
      throw error;
    }
  },

  async getSegment(apiKey, id) {
    const client = createFlodeskClient(apiKey);
    try {
      // Check if id is a segment ID (looks like a MongoDB ObjectId)
      const isSegmentId = /^[0-9a-fA-F]{24}$/.test(id);
      
      if (isSegmentId) {
        // Get all segments
        const response = await client.get(ENDPOINTS.segments.base);
        let allSegments = [];
        if (response.data?.data?.data) {
          allSegments = response.data.data.data;
        } else if (response.data?.data) {
          allSegments = response.data.data;
        } else if (Array.isArray(response.data)) {
          allSegments = response.data;
        }

        // Find the specific segment
        const segment = allSegments.find(s => s.id === id);
        if (!segment) {
          throw {
            response: {
              status: 404,
              data: {
                message: `Segment with ID ${id} not found`,
                code: 'not_found'
              }
            }
          };
        }

        return [{
          value: segment.id,
          label: segment.name
        }];
      } else {
        // Handle email case (existing code)
        const subscriberResponse = await client.get(`${ENDPOINTS.subscribers.base}/${id}`);
        console.log('Subscriber Response:', JSON.stringify(subscriberResponse.data, null, 2));
        
        const subscriber = subscriberResponse.data;
        if (!subscriber.segments || subscriber.segments.length === 0) {
          return []; // Return empty array if subscriber has no segments
        }

        // Get all segments
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
        const subscriberSegments = subscriber.segments
          .map(subscriberSegment => {
            const matchingSegment = allSegments.find(segment => 
              segment.id === subscriberSegment.id
            );
            if (!matchingSegment) return null;

            return {
              value: matchingSegment.id,
              label: matchingSegment.name,
              email: subscriber.email // Include subscriber's email
            };
          })
          .filter(Boolean); // Remove any null values

        return subscriberSegments;
      }
    } catch (error) {
      console.error('Error getting segment:', error.response?.data || error.message);
      throw error;
    }
  },

  async getSegmentSubscribers(apiKey, segmentId) {
    const client = createFlodeskClient(apiKey);
    return client.get(`${ENDPOINTS.segments.base}/${segmentId}/subscribers`);
  }
}; 