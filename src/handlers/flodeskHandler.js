import { subscribersService } from '../services/flodesk/subscribers.js';
import { segmentsService } from '../services/flodesk/segments.js';
import { createSuccessResponse, createErrorResponse, createOptionsResponse, sendResponse } from '../utils/responseHelper.js';
import { validateEmail, validateApiKey, validateSegmentIds, validateSubscriberData } from '../utils/validation.js';
import { logger } from '../utils/logger.js';

export const handleFlodeskAction = async (req, res, customBody = null) => {
  try {
    // Extract parameters from customBody (for route handlers) or req.body (for direct calls)
    const bodyData = customBody || req.body || {};
    const { action, payload } = bodyData;
    
    // Get API key from customBody, req.body, or headers
    const apiKey = bodyData.apiKey || req.headers.authorization;
    
    // Validate required fields
    if (!action) {
      return sendResponse(res, createErrorResponse('Action is required', null, 400));
    }
    
    const apiKeyValidation = validateApiKey(apiKey);
    if (!apiKeyValidation.isValid) {
      return sendResponse(res, createErrorResponse(apiKeyValidation.message, null, 400));
    }
    
    // Use sanitized API key
    const sanitizedApiKey = apiKeyValidation.sanitized;

    let result;
    
    try {
      switch (action) {
        case 'getAllSegments':
          logger.info('Getting all segments');
          try {
            const segments = await segmentsService.getAllSegments(sanitizedApiKey);
            return sendResponse(res, createOptionsResponse(segments));
          } catch (error) {
          logger.apiError('getAllSegments', error);
            return sendResponse(res, createErrorResponse(
        error.message,
        error.response?.data,
        error.response?.status || 500
      ));
          }
          break;
          
        case 'createOrUpdateSubscriber':
          logger.info('Creating/updating subscriber');
          const subscriberValidation = validateSubscriberData(payload);
           if (!subscriberValidation.isValid) {
             return sendResponse(res, createErrorResponse(subscriberValidation.message, null, 400));
           }
           result = await subscribersService.createOrUpdate(sanitizedApiKey, subscriberValidation.sanitized);
          break;
          
        // Subscriber actions
        case 'getAllSubscribers':
          try {
            const subscribers = await subscribersService.getAllSubscribers(sanitizedApiKey, payload);
            return sendResponse(res, createOptionsResponse(subscribers));
          } catch (error) {
            logger.apiError('getAllSubscribers', error);
            // If it's an authentication error, return proper error response
            if (error.message.includes('Invalid API key') || error.message.includes('insufficient permissions')) {
              return sendResponse(res, createErrorResponse('Invalid API key or insufficient permissions', null, 401));
            }
            // For other errors, return empty options
            return sendResponse(res, createOptionsResponse([]));
          }
          break;
        case 'getSubscriber':
          logger.info('Getting subscriber by email');
          const emailValidation = validateEmail(payload.email);
           if (!emailValidation.isValid) {
             return sendResponse(res, createErrorResponse(emailValidation.message, null, 400));
           }
          try {
            const result = await subscribersService.getSubscriber(
              sanitizedApiKey, 
              emailValidation.sanitized,
              payload.segmentsOnly
            );
            return sendResponse(res, createSuccessResponse(result));
          } catch (error) {
            if (error.response?.status === 404) {
              return sendResponse(res, createErrorResponse(
               error.response.data.message,
               error.response.data,
               404
             ));
            }
            throw error;
          }
          break;
        case 'removeFromSegment':
          const segmentValidation = validateSegmentIds(payload.segment_ids);
          if (!segmentValidation.isValid) {
            return sendResponse(res, createErrorResponse(segmentValidation.message, null, 400));
          }
          
          const emailValidationRemove = validateEmail(payload.email);
          if (!emailValidationRemove.isValid) {
            return sendResponse(res, createErrorResponse(emailValidationRemove.message, null, 400));
          }
          
          result = await subscribersService.removeFromSegment(
            sanitizedApiKey, 
            emailValidationRemove.sanitized,
            segmentValidation.sanitized
          );
          break;
        case 'addToSegments':
          const segmentValidationAdd = validateSegmentIds(payload.segmentIds);
          if (!segmentValidationAdd.isValid) {
            return sendResponse(res, createErrorResponse(segmentValidationAdd.message, null, 400));
          }
          
          const emailValidationAdd = validateEmail(payload.email);
          if (!emailValidationAdd.isValid) {
            return sendResponse(res, createErrorResponse(emailValidationAdd.message, null, 400));
          }
          
          result = await subscribersService.addToSegments(
            sanitizedApiKey, 
            emailValidationAdd.sanitized,
            segmentValidationAdd.sanitized
          );
          break;
        case 'unsubscribeFromAll':
          const emailValidationUnsub = validateEmail(payload.email);
          if (!emailValidationUnsub.isValid) {
            return sendResponse(res, createErrorResponse(emailValidationUnsub.message, null, 400));
          }
          
          result = await subscribersService.unsubscribeFromAll(sanitizedApiKey, emailValidationUnsub.sanitized);
          break;

        // Segment actions
        case 'getSegment':
          logger.info('Getting specific segment');
          if (!payload?.id) {
            return sendResponse(res, createErrorResponse('Segment ID is required', null, 400));
          }
          try {
            const result = await segmentsService.getSegment(sanitizedApiKey, payload.id);
            return sendResponse(res, createOptionsResponse(result));
          } catch (error) {
            if (error.response?.status === 404) {
              return sendResponse(res, createErrorResponse(
                error.response.data.message,
                error.response.data,
                404
              ));
            }
            throw error;
          }
          break;

        default:
          return sendResponse(res, createErrorResponse(`Invalid action specified: ${action}`, null, 400));
      }

      return sendResponse(res, createSuccessResponse(result?.data));

    } catch (apiError) {
      if (apiError.response?.status === 401) {
        return sendResponse(res, createErrorResponse('Invalid Flodesk API key', null, 401));
      }
      throw apiError;
    }

  } catch (error) {
      logger.apiError('handleFlodeskAction', error, {
        action,
        hasPayload: !!payload
      });
    
    return sendResponse(res, createErrorResponse(
      error.response?.data?.message || error.message,
      error.response?.data || 'An error occurred',
      error.response?.status || 500
    ));
  }
};