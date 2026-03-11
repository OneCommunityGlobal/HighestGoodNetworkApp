/* eslint-disable no-console */
/* eslint-disable no-alert */
// import styles from './LessonPlanBuilder.module.css';

// export default function AssignLessonPlanModal({ onClose }) {
//   const handleConfirm = async () => {
//     // TODO: call /api/educator/assign-tasks with payload
//     // payload: { lesson_plan_id, assignment_date, is_auto_assigned }
//     // eslint-disable-next-line no-console
//     console.log('API request triggered');
//     onClose();
//   };

//   return (
//     <div className={styles.modalOverlay}>
//       <div className={styles.modal}>
//         <h3>Confirm Assignment</h3>
//         <p>This will assign tasks to all eligible students. Do you want to proceed?</p>
//         <div className={styles.modalActions}>
//           <button onClick={handleConfirm}>Confirm</button>
//           <button onClick={onClose}>Cancel</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// 2nd try
// Assume you have a simple utility for showing notifications or replace with your system
// const showNotification = (message, type = 'success') => {
//   // eslint-disable-next-line no-console
//   console.log(`Notification (${type}): ${message}`); // In a real app, this would trigger a Toast/Alert UI component
//   // eslint-disable-next-line no-alert
//   alert(message);
// };

// export default function AssignLessonPlanModal({ onClose, lessonPlanId }) {
//   const handleConfirm = async () => {
//     const assignmentDate = new Date().toISOString().split('T')[0]; // Current date
//     const payload = {
//       lesson_plan_id: lessonPlanId,
//       assignment_date: assignmentDate,
//       is_auto_assigned: false, // Manual trigger via UI button
//     };

//     onClose(); // Close modal immediately

//     try {
//       // TODO: Replace with your actual API endpoint URL
//       const response = await fetch('/api/educator/assign-tasks', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         const { assigned_count, skipped_count } = data; // Success/Partial Success Logic
//         if (skipped_count > 0) {
//           showNotification(
//             `${assigned_count} tasks assigned, ${skipped_count} skipped due to unmet prerequisites.`,
//             'warning',
//           );
//         } else {
//           showNotification(`${assigned_count} tasks assigned successfully.`);
//         }
//       } else {
//         // Server returned an error status (4xx, 5xx)
//         throw new Error(data.message || 'An error occurred during task assignment.');
//       }
//     } catch (error) {
//       showNotification(
//         `Task assignment failed. Please try again. Error: ${error.message}`,
//         'error',
//       );
//     }
//   };

//   return (
//     // Using standard fixed Tailwind classes for modal positioning
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//       <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
//         <h3 className="text-xl font-semibold mb-4">Confirm Assignment</h3>
//         <p className="mb-6 text-gray-700">
//           This will assign tasks to all eligible students. Do you want to proceed?
//         </p>
//         <div className="flex justify-end gap-3">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleConfirm}
//             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//           >
//             Confirm
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// 3rd try - was just to test it
// Assume you have a simple utility for showing notifications or replace with your system
// Assume you have a simple utility for showing notifications or replace with your system
// const showNotification = (message, type = 'success') => {
//   // eslint-disable-next-line no-console
//   console.log(`Notification (${type}): ${message}`);
//   // In a real app, this would trigger a Toast/Alert UI component
//   alert(message);
// };

// // Helper function to safely parse response body as JSON
// const safeJsonParse = async response => {
//   try {
//     // First, clone the response so it can be used again if parsing fails
//     const clonedResponse = response.clone();
//     // Return parsed JSON if successful
//     return await clonedResponse.json();
//   } catch (e) {
//     // If parsing fails (e.g., due to an empty body on 404), return null
//     return null;
//   }
// };

// export default function AssignLessonPlanModal({ onClose, lessonPlanId }) {
//   const handleConfirm = async () => {
//     const assignmentDate = new Date().toISOString().split('T')[0]; // Current date
//     // --- PAYLOAD GENERATION ---
//     const payload = {
//       lesson_plan_id: lessonPlanId,
//       assignment_date: assignmentDate,
//       is_auto_assigned: false, // Manual trigger via UI button
//     };

//     onClose(); // Close modal immediately to avoid re-clicks

//     // try {
//     //   // TODO: Replace with your actual API endpoint URL
//     //   const response = await fetch('/api/educator/assign-tasks', {
//     //     method: 'POST',
//     //     headers: {
//     //       'Content-Type': 'application/json',
//     //     },
//     //     body: JSON.stringify(payload),
//     //   });

//     //   const data = await response.json();

//     //   if (response.ok) {
//     //     const { assigned_count, skipped_count } = data;

//     //     // Success/Partial Success Logic
//     //     if (skipped_count > 0) {
//     //       showNotification(
//     //         `${assigned_count} tasks assigned, ${skipped_count} skipped due to unmet prerequisites.`,
//     //         'warning',
//     //       );
//     //     } else {
//     //       showNotification(`${assigned_count} tasks assigned successfully.`);
//     //     }
//     //   } else {
//     //     // Server returned an error status (4xx, 5xx)
//     //     throw new Error(data.message || 'An error occurred during task assignment.');
//     //   }
//     // } catch (error) {
//     //   showNotification(
//     //     `Task assignment failed. Please try again. Error: ${error.message}`,
//     //     'error',
//     //   );
//     // }
//     // --- API INTEGRATION (This is the new implementation) ---
//     try {
//       console.log('Sending payload to API:', payload); // Log for debugging

//       const response = await fetch('/api/educator/assign-tasks', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//       });

//       // Safely parse the response body, which will be null if the body is empty (e.g., 404)
//       const data = await safeJsonParse(response);

//       // Check if the server responded with an error status (e.g., 404, 500)
//       if (!response.ok) {
//         const errorMessage = data?.message || 'Task assignment failed. Please try again.';

//         // This specifically handles the 404 case you encountered, where the error message is vague.
//         if (response.status === 404) {
//           showNotification(`Task assignment failed. Error: Endpoint not found (404).`, 'error');
//         } else {
//           showNotification(`Task assignment failed. Error: ${errorMessage}`, 'error');
//         }

//         // We throw an error to exit the try block cleanly after logging the failure
//         throw new Error(`API Error: ${response.status}`);
//       }

//       // If we get here, the request was successful. We will handle the data in the next step.
//       // const data = await response.json();
//       // console.log('API Success Response:', data);
//       // --- HANDLE SUCCESS/PARTIAL SUCCESS (2xx Status) ---
//       if (data) {
//         const assignedCount = data.assigned_count || 0;
//         const skippedCount = data.skipped_count || 0;

//         if (skippedCount > 0) {
//           // Partial success notification
//           showNotification(
//             `${assignedCount} tasks assigned, ${skippedCount} skipped due to unmet prerequisites.`,
//             'warning', // Use 'warning' for partial success
//           );
//         } else {
//           // Full success notification
//           showNotification(`${assignedCount} tasks assigned successfully.`, 'success');
//         }

//         // TODO: Update local state/UI dashboard after successful assignment
//       } else {
//         // Should not happen on a successful 200 response, but handles empty body just in case
//         showNotification('Tasks assigned, but response data was incomplete.', 'warning');
//       }
//     } catch (error) {
//       // This block catches network failures or errors thrown from the !response.ok check
//       console.error('An error occurred during task assignment:', error);
//       showNotification(`Error: ${error.message}`, 'error');
//     }
//   };
//   // --- The UI PART ---
//   return (
//     // Using standard Bootstrap modal structure
//     <div
//       className="modal d-block"
//       tabIndex="-1"
//       role="dialog"
//       style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
//     >
//       <div className="modal-dialog modal-sm modal-dialog-centered" role="document">
//         <div className="modal-content">
//           <div className="modal-header">
//             <h5 className="modal-title">Confirm Assignment</h5>
//             <button type="button" className="close" onClick={onClose} aria-label="Close">
//               <span aria-hidden="true">&times;</span>
//             </button>
//           </div>
//           <div className="modal-body">
//             <p>This will assign tasks to all eligible students. Do you want to proceed?</p>
//           </div>
//           <div className="modal-footer">
//             <button type="button" className="btn btn-secondary" onClick={onClose}>
//               Cancel
//             </button>
//             <button type="button" className="btn btn-primary" onClick={handleConfirm}>
//               Confirm
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

export default function AssignLessonPlanModal({ onClose, lessonPlanId, assignTasks }) {
  const handleConfirm = async () => {
    // Close the modal immediately
    onClose();

    // Call the centralized API function passed from the parent, with `isAutoAssigned = false`
    await assignTasks(false);
  };

  return (
    // Modal JSX is unchanged
    <div
      className="modal d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="modal-dialog modal-sm modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Confirm Assignment</h5>
            <button type="button" className="close" onClick={onClose} aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <p>This will assign tasks to all eligible students. Do you want to proceed?</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleConfirm}>
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
