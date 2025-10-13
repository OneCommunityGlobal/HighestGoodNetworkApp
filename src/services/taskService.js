import axios from 'axios';

export async function replicateTask({
  taskId,
  resourceUserIds,
  includeAttachments = true,
  requestor,
}) {
  const { data } = await axios.post(`/api/task/replicate/${taskId}`, {
    requestor,
    resourceUserIds,
    includeAttachments,
  });
  return data;
}
