import httpService from '../../../services/httpService';
import { ENDPOINTS } from '../../../utils/URL';

/**
 * API service for evaluation results
 * Handles all backend communication for student evaluation data
 */
class EvaluationApiService {
  /**
   * Fetch evaluation results for the current student
   */
  static async getEvaluationResults() {
    try {
      const response = await httpService.get(
        `${ENDPOINTS.APIEndpoint()}/student/evaluation-results`,
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('No evaluation results found');
      }
      if (error.response?.status === 403) {
        throw new Error('Access denied to evaluation results');
      }
      throw new Error('Failed to fetch evaluation results');
    }
  }

  /**
   * Check for new evaluation notifications
   */
  static async checkNewNotifications(lastChecked = null) {
    try {
      const queryParams = lastChecked ? `?since=${lastChecked}` : '';
      const response = await httpService.get(
        `${ENDPOINTS.APIEndpoint()}/student/evaluation-results/notifications${queryParams}`,
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to check for new notifications');
    }
  }

  /**
   * Mark evaluation results as viewed
   */
  static async markAsViewed(evaluationId) {
    try {
      const response = await httpService.post(
        `${ENDPOINTS.APIEndpoint()}/student/evaluation-results/${evaluationId}/mark-viewed`,
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to mark results as viewed');
    }
  }

  /**
   * Get evaluation details by category
   */
  static async getEvaluationByCategory(category) {
    try {
      const response = await httpService.get(
        `${ENDPOINTS.APIEndpoint()}/student/evaluation-results?category=${category}`,
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch ${category} evaluation data`);
    }
  }

  /**
   * Get detailed task information
   */
  static async getTaskDetails(taskId) {
    try {
      const response = await httpService.get(
        `${ENDPOINTS.APIEndpoint()}/student/evaluation-results/tasks/${taskId}`,
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch task details');
    }
  }
}

export default EvaluationApiService;
