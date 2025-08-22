/**
 * Standardized response helper utilities
 * Ensures consistent API response format across all endpoints
 */

/**
 * Creates a standardized success response
 * @param {any} data - The response data
 * @param {string} message - Optional success message
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {object} Standardized response object
 */
export const createSuccessResponse = (data, message = null, statusCode = 200) => {
  const response = {
    success: true,
    data
  };
  
  if (message) {
    response.message = message;
  }
  
  return { response, statusCode };
};

/**
 * Creates a standardized error response
 * @param {string} message - Error message
 * @param {any} error - Error details (optional)
 * @param {number} statusCode - HTTP status code (default: 500)
 * @returns {object} Standardized error response object
 */
export const createErrorResponse = (message, error = null, statusCode = 500) => {
  const response = {
    success: false,
    message
  };
  
  if (error) {
    response.error = error;
  }
  
  return { response, statusCode };
};

/**
 * Creates a standardized options response (for dropdown/select data)
 * @param {array} options - Array of options
 * @param {string} message - Optional message
 * @returns {object} Standardized options response
 */
export const createOptionsResponse = (options, message = null) => {
  const response = {
    success: true,
    data: {
      options
    }
  };
  
  if (message) {
    response.message = message;
  }
  
  return { response, statusCode: 200 };
};

/**
 * Sends a standardized response
 * @param {object} res - Express response object
 * @param {object} responseData - Response data from helper functions
 */
export const sendResponse = (res, responseData) => {
  const { response, statusCode } = responseData;
  return res.status(statusCode).json(response);
};