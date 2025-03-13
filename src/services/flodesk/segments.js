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
          const options = allSubscribers
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
            options
          };
        });

      console.log('Final segments with options:', JSON.stringify(segmentsWithSubscribers, null, 2));
      return segmentsWithSubscribers;

    } catch (error) {
      console.error('Error getting segments:', error.response?.data || error.message);
      throw error;
    }
  },

  async getSegment(apiKey, email) {
    const client = createFlodeskClient(apiKey);
    try {
      // First get the subscriber to find their segments
      const subscriberResponse = await client.get(`${ENDPOINTS.subscribers.base}/${email}`);
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
            label: matchingSegment.name
          };
        })
        .filter(Boolean); // Remove any null values

      return subscriberSegments;

    } catch (error) {
      console.error('Error getting segment:', error.response?.data || error.message);
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

  async getSegmentSubscribers(apiKey, segmentId) {
    const client = createFlodeskClient(apiKey);
    return client.get(`${ENDPOINTS.segments.base}/${segmentId}/subscribers`);
  }
}; 