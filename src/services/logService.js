import raven from 'raven-js'

function init()
{
    raven.config('https://b3e356e0be00453ead1b196b9d9c392f@sentry.io/1295531').install()
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