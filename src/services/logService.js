import raven from 'raven-js'

function init()
{
    raven.config('https://c075e03ab362427cb31e979c6c43d5c9@sentry.io/1311459').install()
}

function log(error)
{
    raven.captureException(error)
}

export default
{
    init,
    log
}
