import { subscribersService } from '../services/flodesk/subscribers.js';
import { segmentsService } from '../services/flodesk/segments.js';

export const handleFlodeskAction = async (req, res) => {
  try {
    const { action, apiKey, payload } = req.body;
    
    // Validate required fields
    if (!action || !apiKey) {
      return res.status(400).json({
        success: false,
        message: 'Action and API Key are required'
      });
    }

    let result;
    
    switch (action) {
      // Subscriber actions
      case 'createOrUpdateSubscriber':
        result = await subscribersService.createOrUpdate(apiKey, payload);
        break;
      case 'getAllSubscribers':
        result = await subscribersService.getAllSubscribers(apiKey, payload);
        break;
      case 'getSubscriber':
        result = await subscribersService.getSubscriber(apiKey, payload.subscriberId);
        break;
      case 'removeFromSegment':
        result = await subscribersService.removeFromSegment(
          apiKey, 
          payload.subscriberId, 
          payload.segmentId
        );
        break;
      case 'addToSegments':
        result = await subscribersService.addToSegments(
          apiKey, 
          payload.subscriberId, 
          payload.segmentIds
        );
        break;
      case 'unsubscribeFromAll':
        result = await subscribersService.unsubscribeFromAll(apiKey, payload.subscriberId);
        break;

      // Segment actions
      case 'getAllSegments':
        result = await segmentsService.getAllSegments(apiKey, payload);
        break;
      case 'getSegment':
        result = await segmentsService.getSegment(apiKey, payload.segmentId);
        break;

      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid action specified' 
        });
    }

    return res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Flodesk API Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while processing your request'
    });
  }
}; 