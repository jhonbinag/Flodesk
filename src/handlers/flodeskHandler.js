import { subscribersService } from '../services/flodesk/subscribers.js';
import { segmentsService } from '../services/flodesk/segments.js';

export const handleFlodeskAction = async (req, res, customBody = null) => {
  try {
    const { action, apiKey, payload } = customBody || req.body;
    
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
          try {
            const segments = await segmentsService.getAllSegments(apiKey);
            return res.json({
              options: segments
            });
          } catch (error) {
            console.error('Error in getAllSegments:', error);
            return res.status(error.response?.status || 500).json({
              options: [],
              error: error.message
            });
          }
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
          try {
            const subscribers = await subscribersService.getAllSubscribers(apiKey, payload);
            return res.json({
              options: subscribers
            });
          } catch (error) {
            console.error('Error in getAllSubscribers:', error);
            return res.json({
              options: []
            });
          }
          break;
        case 'getSubscriber':
          console.log('Getting subscriber by email...');
          if (!payload?.email) {
            return res.status(400).json({
              success: false,
              message: 'Email is required to get subscriber'
            });
          }
          try {
            const result = await subscribersService.getSubscriber(
              apiKey, 
              payload.email,
              payload.segmentsOnly
            );
            return res.json(result);
          } catch (error) {
            if (error.response?.status === 404) {
              return res.status(404).json({
                success: false,
                message: error.response.data.message,
                error: error.response.data
              });
            }
            throw error;
          }
          break;
        case 'removeFromSegment':
          if (!payload.segment_ids) {
            return res.status(400).json({
              success: false,
              message: 'segment_ids array is required'
            });
          }
          result = await subscribersService.removeFromSegment(
            apiKey, 
            payload.email,
            payload.segment_ids
          );
          break;
        case 'addToSegments':
          result = await subscribersService.addToSegments(
            apiKey, 
            payload.email,
            payload.segmentIds
          );
          break;
        case 'unsubscribeFromAll':
          result = await subscribersService.unsubscribeFromAll(apiKey, payload.email);
          break;

        // Segment actions
        case 'getSegment':
          console.log('Getting specific segment...');
          if (!payload?.id) {
            return res.status(400).json({
              success: false,
              message: 'Email is required'
            });
          }
          try {
            const result = await segmentsService.getSegment(apiKey, payload.id);
            return res.json({
              options: result
            });
          } catch (error) {
            if (error.response?.status === 404) {
              return res.status(404).json({
                options: [],
                error: error.response.data.message
              });
            }
            throw error;
          }
          break;

        default:
          return res.status(400).json({ 
            success: false, 
            message: `Invalid action specified: ${action}` 
          });
      }

      return res.json({
        success: true,
        data: result?.data
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