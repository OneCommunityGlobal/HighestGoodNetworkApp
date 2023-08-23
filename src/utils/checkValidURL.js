export const isValidGoogleDocsUrl = url => {
  const googleDocsPattern = /^(https:\/\/docs\.google\.com\/[^\s/$.?#].[^\s]*)$/;
  return googleDocsPattern.test(url);
};

export const isValidDropboxUrl = url => {
  const dropboxPattern = /^(https:\/\/www\.dropbox\.com\/[^\s/$.?#].[^\s]*)$/;
  return dropboxPattern.test(url);
};