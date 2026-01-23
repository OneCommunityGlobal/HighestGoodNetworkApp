// Re-export all actions from studentTasks
// intermediateTasks uses the same logic as studentTasks
export {
  setStudentTasksStart,
  setStudentTasks,
  setStudentTasksError,
  updateStudentTask,
  fetchStudentTasks,
  markStudentTaskAsDone,
  // Aliases for backward compatibility
  fetchStudentTasks as fetchIntermediateTasks,
  markStudentTaskAsDone as markIntermediateTaskAsDone,
} from './studentTasks';
