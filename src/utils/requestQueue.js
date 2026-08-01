// A simple shared concurrency-limited task queue.
// Used to prevent firing an unbounded number of simultaneous network
// requests (e.g. one Warnings fetch per team member row), which can
// exceed the browser's connection limit and cause
// net::ERR_INSUFFICIENT_RESOURCES failures on pages with many rows.

const MAX_CONCURRENT = 10;

let activeCount = 0;
const queue = [];

function runNext() {
  if (activeCount >= MAX_CONCURRENT || queue.length === 0) {
    return;
  }
  const { task, resolve, reject } = queue.shift();
  activeCount += 1;
  Promise.resolve()
    .then(task)
    .then(resolve, reject)
    .finally(() => {
      activeCount -= 1;
      runNext();
    });
}

/**
 * Enqueue an async task to run once a concurrency slot is available.
 * @param {() => Promise<any>} task - a function that returns a promise
 * @returns {Promise<any>} resolves/rejects when the task itself resolves/rejects
 */
export function enqueueTask(task) {
  return new Promise((resolve, reject) => {
    queue.push({ task, resolve, reject });
    runNext();
  });
}