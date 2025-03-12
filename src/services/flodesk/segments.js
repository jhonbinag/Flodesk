import { ENDPOINTS } from '../../config/constants';
import { createFlodeskClient } from '../../utils/apiClient';

export const segmentsService = {
  async getAllSegments(apiKey, params = {}) {
    const client = createFlodeskClient(apiKey);
    return client.get(ENDPOINTS.segments.base, { params });
  },

  async getSegment(apiKey, segmentId) {
    const client = createFlodeskClient(apiKey);
    return client.get(`${ENDPOINTS.segments.base}/${segmentId}`);
  }
}; 