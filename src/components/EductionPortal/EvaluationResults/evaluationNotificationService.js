import { toast } from 'react-toastify';
import httpService from '../../../services/httpService';
import { ENDPOINTS } from '../../../utils/URL';

/**
 * Service for handling evaluation results notifications
 */
class EvaluationNotificationService {
  /**
   * Trigger notification when new evaluation results are published
   */
  static triggerNewResultsNotification(studentId, evaluationData) {
    try {
      // Show immediate toast notification
      toast.success(
        `🎓 New evaluation results available! Overall score: ${evaluationData.student.overallScore}%`,
        {
          position: 'top-right',
          autoClose: 8000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        },
      );

      // Send system notification to student
      this.createSystemNotification(studentId, {
        type: 'evaluation_results',
        title: 'New Evaluation Results Available',
        message: `Your evaluation results have been published. Overall score: ${evaluationData.student.overallScore}%. View detailed feedback and task breakdown.`,
        data: {
          evaluationId: evaluationData.student.id,
          overallScore: evaluationData.student.overallScore,
          publishedDate: new Date().toISOString(),
        },
        priority: 'medium',
        actionUrl: 'http://localhost:5173/educationportal/evaluation-results',
      });

      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error triggering evaluation notification:', error);
      return false;
    }
  }

  /**
   * Create system notification for student
   */
  static async createSystemNotification(studentId, notificationData) {
    try {
      const notification = {
        recipient: studentId,
        message: `<div>
          <h5><i class="fa fa-graduation-cap"></i> ${notificationData.title}</h5>
          <p>${notificationData.message}</p>
          <p><strong>Published:</strong> ${new Date(
            notificationData.data.publishedDate,
          ).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}</p>
          <a href="${
            notificationData.actionUrl
          }" style="color: white; text-decoration: underline;">View Results</a>
        </div>`,
        isSystemGenerated: true,
        type: notificationData.type,
        priority: notificationData.priority,
        data: notificationData.data,
      };

      // Send to notification service
      const response = await httpService.post(
        `${ENDPOINTS.APIEndpoint()}/notification/`,
        notification,
      );

      if (response.status === 201) {
        // eslint-disable-next-line no-console
        console.log('Evaluation notification created successfully');
        return response.data;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating system notification:', error);
      // Fallback to toast if system notification fails
      toast.info('📚 Check your notifications for new evaluation results!');
    }
  }

  /**
   * Check for new evaluation results and notify if found
   */
  static async checkForNewResults(studentId, lastChecked = null) {
    try {
      const queryParams = lastChecked ? `?since=${lastChecked}` : '';
      const response = await httpService.get(
        `${ENDPOINTS.APIEndpoint()}/student/evaluation-results/notifications${queryParams}`,
      );

      if (response.data?.hasNewResults) {
        this.triggerNewResultsNotification(studentId, response.data.evaluationData);
        return true;
      }

      return false;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error checking for new evaluation results:', error);
      return false;
    }
  }

  /**
   * Mark evaluation notification as viewed
   */
  static async markResultsAsViewed(studentId, evaluationId) {
    try {
      await httpService.post(
        `${ENDPOINTS.APIEndpoint()}/student/evaluation-results/${evaluationId}/mark-viewed`,
        { studentId },
      );
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error marking results as viewed:', error);
      return false;
    }
  }

  /**
   * Show specific notification for performance level
   */
  static showPerformanceNotification(score, studentName = 'Student') {
    let message = '';
    let type = 'info';

    if (score >= 90) {
      message = `🏆 Excellent work, ${studentName}! You scored ${score}%`;
      type = 'success';
    } else if (score >= 80) {
      message = `👏 Great job, ${studentName}! You scored ${score}%`;
      type = 'success';
    } else if (score >= 70) {
      message = `📈 Good progress, ${studentName}. You scored ${score}%`;
      type = 'info';
    } else {
      message = `💪 Keep working hard, ${studentName}. You scored ${score}%`;
      type = 'warning';
    }

    toast[type](message, {
      position: 'top-right',
      autoClose: 6000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });
  }

  /**
   * Batch notification for multiple students (educator use)
   */
  static async notifyMultipleStudents(studentIds, evaluationData) {
    try {
      const notifications = studentIds.map(studentId => ({
        studentId,
        evaluationData,
      }));

      const response = await httpService.post(
        `${ENDPOINTS.APIEndpoint()}/evaluation-results/batch-notify`,
        { notifications },
      );

      if (response.status === 200) {
        toast.success(`Notifications sent to ${studentIds.length} students successfully!`);
        return true;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error sending batch notifications:', error);
      toast.error('Failed to send notifications to some students');
      return false;
    }
  }
}

export default EvaluationNotificationService;
