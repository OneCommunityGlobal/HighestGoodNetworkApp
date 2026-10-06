/**
 * Enum representing the different status of a user
 */
export const UserStatus = {
  Active: 'Active',
  Inactive: 'Inactive',
  Paused: 'Paused',
  Scheduled: 'Scheduled',
};
export const FinalDay = {
  FinalDay: 'FinalDay',
  RemoveFinalDay: 'RemoveFinalDay',
};

export const UserStatusOperations = {
  ACTIVATE: 'ACTIVATE',
  DEACTIVATE: 'DEACTIVATE',
  SCHEDULE_DEACTIVATION: 'SCHEDULE_DEACTIVATION',
  PAUSE: 'PAUSE',
  CANCEL_SCHEDULED_DEACTIVATION: 'CANCEL_SCHEDULED_DEACTIVATION'
}

export const InactiveReason = {
  SCHEDULED_SEPARATION: 'ScheduledSeparation',
  SEPARATED: 'Separated',
  PAUSED: 'Paused',
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

export const UserFinalDayStatus = {
  Set: ' Set',
  Unset: 'Unset',
};

export const QuestionType = {
  Select: 'select',
  ShortAnswer: 'short_answer',
  Paragraph: 'paragraph',
  MultiSelect: 'multi_select',
  Radio: 'radio',
};
