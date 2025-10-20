import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';

export async function replicateTask({
  taskId,
  resourceUserIds,
  includeAttachments = true,
  requestor, // { requestorId, role }
}) {
  const { data } = await axios.post(ENDPOINTS.TASK_REPLICATE(taskId), {
    requestor,
    resourceUserIds,
    includeAttachments,
  });
  return data;
}
