import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';

export const getTopFAQs = async () => axios.get(ENDPOINTS.FAQS);

export const searchFAQs = async query => axios.get(ENDPOINTS.SEARCH_FAQS(query));

export const logUnansweredQuestion = async question =>
    axios.post(ENDPOINTS.LOG_UNANSWERED_QUESTION, { question });

export const addFAQ = async (question, answer) =>
    axios.post(ENDPOINTS.ADD_FAQ, { question, answer });

export const editFAQ = async (id, question, answer) =>
    axios.put(ENDPOINTS.EDIT_FAQ(id), { question, answer });

export const deleteFAQ = async id => axios.delete(ENDPOINTS.DELETE_FAQ(id));