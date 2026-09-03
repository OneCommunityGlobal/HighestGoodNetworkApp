import { permissions } from './constants';

const viewWBSpermissionsRequired = [
  permissions.postWbs,
  permissions.deleteWbs,
  permissions.postTask,
  permissions.updateTask,
  permissions.deleteTask,
  permissions.resolveTask,
  permissions.putReviewStatus,
];

export default viewWBSpermissionsRequired;
