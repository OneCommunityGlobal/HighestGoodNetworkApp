export const isValidGoogleDocsUrl = url => {
  const googleDocsPattern = /^https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9_-]+\/edit(?:\?.*)?$/;
  return googleDocsPattern.test(url);
};

export const isValidDropboxUrl = url => {
  const dropboxPattern = /^https:\/\/(?:www\.)?dropbox\.com\/home(?:\/[^\s/][^\s]+)?$/;
  const validDropboxPattern = /^https:\/\/(?:www\.)?dropbox\.com\/home\/[^\s/]+\/?$/;
  const dropboxPattern2 = /^https:\/\/(?:www\.)?dropbox\.com\/(s(?:cl)?\/[a-zA-Z0-9]+(?:\/[^\s/?#]+)?)|(home\/[^\s/]+)$/;


  return (dropboxPattern.test(url) && validDropboxPattern.test(url)) || dropboxPattern2.test(url);
};