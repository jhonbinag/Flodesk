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
      }

      // Get all subscribers
      const subscribersResponse = await client.get(ENDPOINTS.subscribers.base);
      console.log('All Subscribers Response:', JSON.stringify(subscribersResponse.data, null, 2));

      // Get subscribers array and filter for active only
      let allSubscribers = [];
      if (subscribersResponse.data?.data?.data) {
        allSubscribers = subscribersResponse.data.data.data;
      } else if (subscribersResponse.data?.data) {
        allSubscribers = subscribersResponse.data.data;
      } else if (Array.isArray(subscribersResponse.data)) {
        allSubscribers = subscribersResponse.data;
      }

      // Filter for active subscribers
      const activeSubscribers = allSubscribers.filter(sub => sub.status === 'active');

      // Transform segments and match with active subscribers only
      const segmentsWithSubscribers = segments
        .filter(segment => segment.id && segment.name)
        .map(segment => {
          // Find active subscribers that belong to this segment
          const options = activeSubscribers
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

      console.log('Final segments with active subscribers:', JSON.stringify(segmentsWithSubscribers, null, 2));
      return segmentsWithSubscribers;

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