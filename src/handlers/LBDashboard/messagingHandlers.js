import {
  MESSAGE_RECEIVED,
  MESSAGE_STATUS_UPDATED,
} from '../../constants/lbdashboard/messagingConstants';

export const handleMessageReceived = payload => ({
  type: MESSAGE_RECEIVED,
  payload,
});

export const handleMessageStatusUpdated = payload => ({
  type: MESSAGE_STATUS_UPDATED,
  payload,
});
