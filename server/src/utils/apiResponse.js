/**
 * @fileoverview Standardized API Response Utilities.
 * Formats API JSON responses uniformly across all endpoints.
 */

/**
 * Sends a standardized success JSON response.
 * @param {import('express').Response} res - Express response object
 * @param {any} [data=null] - Payload to return
 * @param {string} [message='Success'] - Human-readable success message
 * @param {number} [statusCode=200] - HTTP status code
 * @returns {import('express').Response}
 */
export function success(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    status: 'success',
    statusCode,
    message,
    data
  });
}

/**
 * Sends a standardized error JSON response.
 * @param {import('express').Response} res - Express response object
 * @param {string} [message='Internal Server Error'] - Human-readable error message
 * @param {number} [statusCode=500] - HTTP status code
 * @param {any} [errors=null] - Validation errors or extra debug details
 * @returns {import('express').Response}
 */
export function error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
  const responsePayload = {
    status: 'error',
    statusCode,
    message
  };

  if (errors !== null && errors !== undefined) {
    responsePayload.errors = errors;
  }

  return res.status(statusCode).json(responsePayload);
}

export default {
  success,
  error
};
