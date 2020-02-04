const APIEndpoint = process.env.REACT_APP_APIENDPOINT

export const ENDPOINTS = {
  USER_PROFILE: userId => `${APIEndpoint}/userprofile/${userId}`,
  USER_TEAM: userId => `${APIEndpoint}/userprofile/teammembers/${userId}`,
  LOGIN: `${APIEndpoint}/login`,
  PROJECTS: () => `${APIEndpoint}/projects`,
  PROJECT: () => `${APIEndpoint}/project/`,
  PROJECT_MEMBER: projectId => `${APIEndpoint}/project/${projectId}/users`,
  UPDATE_PASSWORD: userId => `${APIEndpoint}/userprofile/${userId}/updatePassword`,
  FORCE_PASSWORD: `${APIEndpoint}/forcepassword`
};