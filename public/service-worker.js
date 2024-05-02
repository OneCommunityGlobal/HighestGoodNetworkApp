/* eslint-disable no-restricted-globals */
// Read more about service worker at https://developer.chrome.com/docs/workbox/service-worker-overview/
/**
 * Author: Shengwei/Peter
 * Last Modified: 2024-04-29
 * Description: Implement service worker to cache assets
 */

// Define the cache name
const IMAGE_CACHE = 'IMAGE_CACHE';
const imageCacheExpirationTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Define the URLs to cache
const urlsToCache = [
  // Add other URLs to cache here if needed
  // how to add files within the react app's folder? public/, src/assets/images, and images/
];

// Helper function to check if the request URL matches the Dropbox image pattern
// https://<hash>.dl.dropboxusercontent.com/cd/0/inline/<hash>/file
const isDropboxImage = request => {
  const regex = /\/\/([^\/]+)\.dl\.dropboxusercontent\.com/;
  const url = new URL(request.url);
  console.log('url: ', url.href.match(regex) != null);
  return (
    // Match redirect URL pattern
    // Match final image URL pattern
    // url.origin === 'https://www.dropbox.com' ||
    url.href.match(regex) !== null
  );
};

// Install the service worker
self.addEventListener('install', event => {
  // This creates a new Cache instance and precaches assets.
  event.waitUntil(caches.open(IMAGE_CACHE).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('activate', event => {
  // Specify allowed cache keys
  const cacheAllowList = [];

  // Get all the currently active `Cache` instances.
  event.waitUntil(
    caches.keys().then(keys => {
      // Delete all caches that aren't in the allow list:
      return Promise.all(
        // eslint-disable-next-line array-callback-return
        keys.map(key => {
          if (!cacheAllowList.includes(key)) {
            return caches.delete(key);
          }
        }),
      );
    }),
  );
});

// Intercept network requests for runtime caching
self.addEventListener('fetch', event => {
  const { request } = event;
  // const url = new URL(request.url);

  // Specifically cache badge images from URLs dropbox.com/* which will return a 302 redirect to
  // https://<hash>.dl.dropboxusercontent.com/cd/0/inline/<hash>/file
  if (
    isDropboxImage(request)
    // && event.request.destination === 'image' // line commented out: we don't want to cache frequently update images. e.g. user profile pic
  ) {
    caches.match(request).then(cachedResponse => {
      // console.log('cachedResponse: ', cachedResponse);
      if (cachedResponse) {
        const cachedResponseTime = new Date(cachedResponse.headers.get('Date')).getTime();
        const now = Date.now();
        if (now - cachedResponseTime < imageCacheExpirationTime) {
          return cachedResponse;
        }
      }
      // console.log('fetching image from network:', request);
      // console.log('fetching image from network:', updatedRequest);
      /**
       * (?:s|sh)\/: Matches either "s/" or "sh/".
       * ([^\/]+\/)*: Matches any number of characters that are not a forward slash, followed by a forward slash.
       * ([^\/]+)\.png: Matches one or more characters that are not a forward slash /, followed by ".png"
      
      const regex = /https:\/\/www\.dropbox\.com\/(?:s|sh)\/((?:[^\/]+\/)*)([^\/]+\.png)\?raw=1/;
      // console.log('regex: ', request.url.match(regex));
      if (request.url.match(regex)) {
        const [, hashSegments, filenameWithExtension] = request.url.match(regex);
        const prefix = request.url.includes('/s/') ? 's' : 'sh';
        // Construct the new URL with the appropriate prefix
        const newUrl = `https://www.dropbox.com/${prefix}/raw/${hashSegments}${filenameWithExtension}`;
        updatedRequest = new Request(newUrl, {
          ...request, // Spread the properties of the original request
          url: newUrl,
        });
        console.log('updatedRequest: ', updatedRequest);
      } */
      // If not valid or not cached, fetch from network
      return fetch(request)
        .then(fetchedResponse => {
          // handle case redirect
          if (fetchedResponse.redirected && fetchedResponse.status === 302) {
            const redirectUrl = fetchedResponse.headers.get('Location');
            return fetch(redirectUrl)
              .then(finalResponse => {
                const responseToCache = fetchedResponse.clone();
                caches.open(IMAGE_CACHE).then(cache => cache.put(request, responseToCache));
                return finalResponse;
              })
              .catch(error => {
                // Handle redirect fetch error
                // Consider returning the original response (optional)
                return fetchedResponse; // Fallback option if redirect fails
              });
          }

          // if not redirect
          if (
            !fetchedResponse ||
            fetchedResponse.status !== 200 ||
            fetchedResponse.type !== 'basic'
          ) {
            return fetchedResponse;
          }

          const responseToCache = fetchedResponse.clone();
          caches.open(IMAGE_CACHE).then(cache => cache.put(request, responseToCache));
          return fetchedResponse;
        })
        .catch(error => {
          // Handle fetch error
          // Consider returning the original response (optional)
          console.error('fetch error: ', error);
          // Fallback option if fetch fails
        });
    });
  }
});
