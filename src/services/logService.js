import * as Sentry from '@sentry/browser';

function init() {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_URL,
  });
}

function logError(error) {
  Sentry.captureException(error);
}

function logInfo(message) {
  Sentry.captureMessage(message);
}

export default {
  init,
  logError,
  logInfo,
};
