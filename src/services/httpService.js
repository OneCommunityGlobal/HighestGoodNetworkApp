import axios from 'axios';
import { toast } from 'react-toastify';
import logService from './logService';

// Keep existing content-type setting
if (axios.defaults && axios.defaults.headers && axios.defaults.headers.post) {
  axios.defaults.headers.post['Content-Type'] = 'application/json';
}

// Performance tracking map
const pendingRequests = {};
let requestCounter = 0;

// Get the current timestamp (cross-browser compatible)
const now = () => {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
};

// Extract caller information from stack trace
function getCallerInfo() {
  try {
    const stack = new Error().stack?.split('\n') || [];
    for (let i = 3; i < stack.length && i < 10; i++) {
      const line = stack[i].trim();

      // Skip internal lines
      if (line.includes('httpService') || line.includes('node_modules/axios')) {
        continue;
      }

      // Extract component name
      let component = 'unknown';
      const componentMatch = line.match(/at\s+([^(\s]+)/);
      if (componentMatch && componentMatch[1]) {
        component = componentMatch[1].trim();
      }

      // Extract file name
      let file = 'unknown';
      const fileMatch = line.match(/\((.+?):\d+:\d+\)/) || line.match(/at\s+(.+?):\d+:\d+/);
      if (fileMatch) {
        const filePath = fileMatch[1];
        const parts = filePath.split(/[\/\\]/);
        file = parts[parts.length - 1];
      }

      return { component, file };
    }
    return { component: 'unknown', file: 'unknown' };
  } catch (e) {
    return { component: 'unknown', file: 'unknown' };
  }
}

// Keep original error handling logic but add performance tracking
if (axios.interceptors && axios.interceptors.response && axios.interceptors.response.use) {
  axios.interceptors.response.use(
    // Success handler with timing information
    response => {
      try {
        const requestId = response.config?.headers?.['X-Request-ID'];
        if (requestId && pendingRequests[requestId]) {
          const request = pendingRequests[requestId];
          const duration = now() - request.startTime;

          console.log(
            `✅ API RESPONSE: ${request.method} ${request.url} | ` +
              `Duration: ${duration.toFixed(2)}ms | Status: ${response.status} | ` +
              `From: ${request.caller.component} (${request.caller.file})`,
          );
          delete pendingRequests[requestId];
        }
      } catch (err) {
        // Silent fail for logging
      }
      return response;
    },
    // Error handler - keep original logic and add logging
    error => {
      try {
        const requestId = error.config?.headers?.['X-Request-ID'];
        if (requestId && pendingRequests[requestId]) {
          const request = pendingRequests[requestId];
          const duration = now() - request.startTime;

          console.error(
            `❌ API ERROR: ${request.method} ${request.url} | ` +
              `Duration: ${duration.toFixed(2)}ms | Status: ${error.response?.status ||
                'unknown'} | ` +
              `From: ${request.caller.component} (${request.caller.file})`,
            error.response?.data || error.message,
          );
          delete pendingRequests[requestId];
        }
      } catch (err) {
        // Silent fail for logging
      }

      // Original error handling
      if (!(error.response && error.response.status >= 400 && error.response.status <= 500)) {
        logService.log(error);
        toast.error('An unexpected error occurred.');
      }

      return Promise.reject(error);
    },
  );
}

// Enhanced request interceptor that logs caller information
axios.interceptors.request.use(request => {
  try {
    const requestId = ++requestCounter;
    const callerInfo = getCallerInfo();
    const method = request.method?.toUpperCase() || 'GET';

    // Store request information for later
    pendingRequests[requestId] = {
      startTime: now(),
      method: method,
      url: request.url,
      caller: callerInfo,
    };

    // Add ID to track request/response
    request.headers = request.headers || {};
    request.headers['X-Request-ID'] = requestId;

    // Log with caller information
    console.log(
      `🔍 API REQUEST: ${method} ${request.url} | ` +
        `From: ${callerInfo.component} (${callerInfo.file})`,
      request.data || '',
    );
  } catch (err) {
    // Fallback to simpler logging
    console.log(
      `[API CALL] ${request.method?.toUpperCase() || 'GET'} ${request.url}`,
      request.data || '',
    );
  }

  return request;
});

// JWT handling - same as original
function setjwt(jwt) {
  if (jwt) {
    axios.defaults.headers.common.Authorization = jwt;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
}

// Export the same interface as original
export default {
  get: axios.get,
  post: axios.post,
  delete: axios.delete,
  patch: axios.patch,
  put: axios.put,
  setjwt,
};
