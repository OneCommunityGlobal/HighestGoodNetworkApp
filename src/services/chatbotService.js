import httpService from './httpService';
import { ENDPOINTS } from '../utils/URL';

/**
 * Send a message to the chatbot API (Pinecone-backed). Optionally pass conversation history.
 * @param {string} message - User message
 * @param {Array<{role: 'user'|'assistant', content: string}>} history - Recent messages for context
 * @returns {Promise<{ reply: string, sources?: Array }>}
 */
export function sendChatMessage(message, history = []) {
  return httpService
    .post(ENDPOINTS.CHATBOT_QUERY, { message, history })
    .then(res => res.data)
    .catch(err => {
      const reply =
        err.response?.data?.reply ||
        err.response?.data?.error ||
        err.message ||
        'Unable to reach the chatbot. Please try again.';
      return { reply, sources: [] };
    });
}

export default { sendChatMessage };
