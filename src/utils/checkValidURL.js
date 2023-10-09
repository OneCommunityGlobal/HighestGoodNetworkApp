export const isValidGoogleDocsUrl = url => {
  url = url.trim();
  const googleDocsPattern = /^https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9_-]+\/edit(?:\?.*)?$/;
  return googleDocsPattern.test(url);
};

export const isValidMediaUrl = url => {
  url = url.trim();
  var urlPattern = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)?$/;
  return urlPattern.test(url);
};