/**
 * Unified API Error Translator for DRF and HTTP status errors.
 * Formats errors into user-friendly Bangla messages and extracts field errors.
 */

/**
 * Extracts a top-level human-readable error message in Bangla.
 * @param {any} error Axios or standard Error object
 * @param {string} fallback Default message if extraction yields nothing
 * @returns {string} User-facing Bangla error message
 */
export const getErrorMessage = (error, fallback = 'একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।') => {
  if (!error) return fallback;

  // Network or offline errors
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return 'অনুরোধের সময় শেষ হয়ে গেছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
    }
    return 'সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হচ্ছে না। আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন।';
  }

  const status = error.response.status;
  const data = error.response.data;

  // HTTP 429: Rate Limit Exceeded
  if (status === 429) {
    return 'অনেকবার চেষ্টা করেছেন, কিছুক্ষণ পরে আবার চেষ্টা করুন।';
  }

  // HTTP 5xx: Server Errors
  if (status >= 500) {
    return 'সার্ভারে সাময়িক সমস্যা হচ্ছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
  }

  // HTTP 403: Forbidden
  if (status === 403) {
    return data?.detail || 'আপনার এই কাজটি করার অনুমতি নেই।';
  }

  // HTTP 401: Unauthorized
  if (status === 401) {
    return data?.detail || 'সেশনের মেয়াদ শেষ হয়েছে অথবা ক্রেডেনশিয়াল সঠিক নয়।';
  }

  // Parse DRF response payloads
  if (data && typeof data === 'object') {
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message;
    }
    if (typeof data.detail === 'string' && data.detail.trim()) {
      return data.detail;
    }
    if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
      return String(data.non_field_errors[0]);
    }
    if (typeof data.non_field_errors === 'string') {
      return data.non_field_errors;
    }

    // Extract the first field's error if present
    for (const key of Object.keys(data)) {
      const val = data[key];
      if (Array.isArray(val) && val.length > 0) {
        return String(val[0]);
      }
      if (typeof val === 'string' && val.trim()) {
        return val;
      }
    }
  }

  return fallback;
};

/**
 * Extracts a map of field-specific errors from a DRF 400 Bad Request response.
 * @param {any} error
 * @returns {Record<string, string>} Map of fieldName -> errorMessage
 */
export const getFieldErrors = (error) => {
  const fieldErrors = {};
  const data = error?.response?.data;

  if (data && typeof data === 'object') {
    for (const [field, messages] of Object.entries(data)) {
      if (Array.isArray(messages) && messages.length > 0) {
        fieldErrors[field] = String(messages[0]);
      } else if (typeof messages === 'string') {
        fieldErrors[field] = messages;
      }
    }
  }

  return fieldErrors;
};

/**
 * Extracts Retry-After header seconds from HTTP 429 response.
 * @param {any} error
 * @returns {number | null} Number of seconds to wait, or null
 */
export const getRetryAfterSeconds = (error) => {
  if (error?.response?.status !== 429) return null;

  const headers = error.response.headers || {};
  const retryHeader =
    headers['retry-after'] ||
    headers['Retry-After'] ||
    (typeof headers.get === 'function' ? headers.get('retry-after') : null);

  if (!retryHeader) return null;

  const seconds = parseInt(retryHeader, 10);
  if (!Number.isNaN(seconds) && seconds > 0) {
    return seconds;
  }

  // Handle HTTP-date format if present
  const dateParsed = Date.parse(retryHeader);
  if (!Number.isNaN(dateParsed)) {
    const diff = Math.ceil((dateParsed - Date.now()) / 1000);
    return diff > 0 ? diff : null;
  }

  return null;
};

export default { getErrorMessage, getFieldErrors, getRetryAfterSeconds };
