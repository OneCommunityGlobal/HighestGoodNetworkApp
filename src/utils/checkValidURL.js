export const isValidGoogleDocsUrl = url => {
  const trimmedUrl = url.trim();
  const googleDocsPattern = /^(https?:\/\/)?(www\.)?docs\.google\.com\/document\/d\/[a-zA-Z0-9-_]+/;
  return googleDocsPattern.test(trimmedUrl);
};

export const isValidMediaUrl = url => {
  const trimmedUrl = url.trim();
  const urlPattern = /^(?:https?:\/\/)?[\w.-]+\.[a-zA-Z]{2,}(?:\/\S*)?$/;
  return urlPattern.test(trimmedUrl);
};
