/**
 * Enum representing the different status of a user
 */
export const UserStatus = {
  Active: 'Active',
  InActive: 'Inactive',
};

/**
 * Enum representing the different roles of a user
 */
export const UserRole = {
  Administrator: 'Administrator',
  Volunteer: 'Volunteer',
  Manager: 'Manager',
  CoreTeam: 'Core Team',
  Mentor: 'Mentor',
  Owner: 'Owner',
};

export const UserDeleteType = {
  HardDelete: 'delete',
  SoftDelete: 'archive',
  Inactive: 'Inactive',
};
