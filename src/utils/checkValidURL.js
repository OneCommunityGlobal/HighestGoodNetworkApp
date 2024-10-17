export const isValidGoogleDocsUrl = url => {
  url = url.trim();
  const googleDocsPattern = /^(https?:\/\/)?(www\.)?docs\.google\.com\/document\/d\/[a-zA-Z0-9-_]+/;
  return googleDocsPattern.test(url);
};

export const isValidMediaUrl = url => {
  url = url.trim();
  var urlPattern = /^(?:https?:\/\/)?[\w.-]+\.[a-zA-Z]{2,}(?:\/\S*)?$/;
  return urlPattern.test(url);
};
