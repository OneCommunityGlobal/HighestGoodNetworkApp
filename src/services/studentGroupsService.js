import httpService from './httpService';
import { ENDPOINTS } from '../utils/URL';

export const normalizeStudent = student => ({
  id: String(student._id),
  displayName: [student.firstName, student.lastName]
    .map(part => (part || '').trim())
    .filter(Boolean)
    .join(' '),
});

// Group documents do not include membership data. Omit members until it is loaded.
export const normalizeGroup = group => ({
  id: String(group._id),
  name: group.name,
  description: group.description,
});

// A deleted user may populate as null; only populated student IDs identify learners.
export const normalizeMemberIds = memberships =>
  memberships
    .filter(membership => membership.student_id?._id != null)
    .map(membership => String(membership.student_id._id));

// Call only with a successfully retrieved membership array (including a real []).
export const hydrateGroup = (group, memberships) => ({
  ...group,
  members: normalizeMemberIds(memberships),
});

export const getStudents = async () => {
  const response = await httpService.get(ENDPOINTS.EDUCATOR_STUDENTS());
  return response.data.map(normalizeStudent);
};

export const getGroups = async () => {
  const response = await httpService.get(ENDPOINTS.EDUCATOR_GROUPS());
  return response.data.map(normalizeGroup);
};

export const createGroup = async ({ name, description, studentIds = [] }) => {
  const response = await httpService.post(ENDPOINTS.EDUCATOR_GROUPS(), {
    name,
    description,
    studentIds,
  });
  return normalizeGroup(response.data);
};

export const updateGroup = async (groupId, { name, description }) => {
  const response = await httpService.put(ENDPOINTS.EDUCATOR_GROUP(groupId), {
    name,
    description,
  });
  return normalizeGroup(response.data);
};

export const deleteGroup = async groupId => {
  await httpService.delete(ENDPOINTS.EDUCATOR_GROUP(groupId));
};

// Return the membership response for hydrateGroup or normalizeMemberIds.
export const getGroupMembers = async groupId => {
  const response = await httpService.get(ENDPOINTS.EDUCATOR_GROUP_MEMBERS(groupId));
  return response.data;
};

export const addGroupMembers = async (groupId, studentIds) => {
  const response = await httpService.post(ENDPOINTS.EDUCATOR_GROUP_MEMBERS(groupId), {
    studentIds,
  });
  return response.data;
};

export const removeGroupMembers = async (groupId, studentIds) => {
  const response = await httpService.delete(ENDPOINTS.EDUCATOR_GROUP_MEMBERS(groupId), {
    data: { studentIds },
  });
  return response.data;
};
