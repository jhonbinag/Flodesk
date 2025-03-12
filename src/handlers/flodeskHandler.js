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
    
    try {
      switch (action) {
        case 'getAllSegments':
          console.log('Getting all segments...');
          result = await segmentsService.getAllSegments(apiKey, payload);
          break;
          
        case 'createOrUpdateSubscriber':
          console.log('Creating/updating subscriber...');
          if (!payload?.email) {
            return res.status(400).json({
              success: false,
              message: 'Email is required for subscriber creation/update'
            });
          }
          result = await subscribersService.createOrUpdate(apiKey, payload);
          break;
          
        // Subscriber actions
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
        case 'getSegment':
          result = await segmentsService.getSegment(apiKey, payload.segmentId);
          break;

        default:
          return res.status(400).json({ 
            success: false, 
            message: `Invalid action specified: ${action}` 
          });
      }

      return res.json({
        success: true,
        data: result.data
      });

    } catch (apiError) {
      if (apiError.response?.status === 401) {
        return res.status(401).json({
          success: false,
          message: 'Invalid Flodesk API key'
        });
      }
      throw apiError;
    }

  } catch (error) {
    console.error('Request Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    return res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message,
      error: error.response?.data || 'An error occurred'
    });
  }
}; 