import * as Sentry from '@sentry/browser';

function init() {
    let value = process.env.REACT_APP_SENTRY_URL;
    alert(`dsn is ${value}`);
    Sentry.init({
        dsn: "https://c075e03ab362427cb31e979c6c43d5c9@sentry.io/1311459"
         });
}

function logError(error) {
    Sentry.captureException(error)
}

function logInfo(message) {
    Sentry.captureMessage(message)
}

export default {
    init,
    logError,
    logInfo

}