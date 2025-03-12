import { ENDPOINTS } from '../../config/constants';
import { createFlodeskClient } from '../../utils/apiClient';

export const subscribersService = {
  async createOrUpdate(apiKey, subscriberData) {
    const client = createFlodeskClient(apiKey);
    return client.post(ENDPOINTS.subscribers.base, subscriberData);
  },

  async getAllSubscribers(apiKey, params = {}) {
    const client = createFlodeskClient(apiKey);
    return client.get(ENDPOINTS.subscribers.base, { params });
  },

  async getSubscriber(apiKey, subscriberId) {
    const client = createFlodeskClient(apiKey);
    return client.get(`${ENDPOINTS.subscribers.base}/${subscriberId}`);
  },

  async removeFromSegment(apiKey, subscriberId, segmentId) {
    const client = createFlodeskClient(apiKey);
    return client.delete(`${ENDPOINTS.subscribers.base}/${subscriberId}/segments/${segmentId}`);
  },

  async addToSegments(apiKey, subscriberId, segmentIds) {
    const client = createFlodeskClient(apiKey);
    return client.post(`${ENDPOINTS.subscribers.base}/${subscriberId}/segments`, {
      segment_ids: segmentIds
    });
  },

  async unsubscribeFromAll(apiKey, subscriberId) {
    const client = createFlodeskClient(apiKey);
    return client.post(`${ENDPOINTS.subscribers.base}/${subscriberId}/unsubscribe`);
  }
}; 