export const CONFIRM_DELETION = 'Confirm Deletion';
export const DELETE = 'delete';
export const ARE_YOU_SURE_YOU_WANT_TO = 'Are you sure you want to ';
export const THIS_PROJECT_NAME_IS_ALREADY_TAKEN = 'This project name is already taken';
export const THIS_ACTION_CAN_NOT_BE_UNDONE = 'This action cannot be undone';
export const SWITCH_THEM_TO_INACTIVE_IF_YOU_LIKE_TO_KEEP_THEM_IN_THE_SYSTEM =
  "Switch them to Inactive if you'd like to keep them in the system";
export const DUE_DATE_MUST_GREATER_THAN_START_DATE = 'Due Date must be greater than Start Date';
export const USER_DELETE_CONFIRMATION_FIRST_LINE = 'Are you sure you want to delete ';
export const USER_DELETE_CONFIRMATION_USER_NAME = username => `${username}`;
export const USER_DELETE_CONFIRMATION_FIRST_LINE_CONT = '? This action cannot be undone.';
export const USER_DELETE_CONFIRMATION_SECOND_LINE =
  "Switch them to 'Inactive' if you'd like to keep them in the system or choose 'Keep Data' if you’d like to still delete them but add their associated data to the 'Data Archive' instead of completely deleting them and all their data.";
export const USER_DELETE_DATA_FOREVER = 'Understood, C-ya! Delete their Data Forever';
export const USER_DELETE_DATA_INACTIVE = 'Oops, My Bad! Just Make Them Inactive';
export const USER_DELETE_DATA_ARCHIVE = 'Wait, Save the Data! Data Archiving is Cool';
export const USER_DELETE_OPTION_HEADING = 'Choose A Delete Action';
export const USER_STATUS_CHANGE_CONFIRMATION = (fullName, status) =>
  `Please confirm that you want to make "${fullName}" as ${status}.`;
