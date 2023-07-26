export const getTimeEntryFormData = (state) => ({
  currentUserRole: state.auth.user.role,
  userProfile: state.userProfile
});