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

const DROPBOX_HOSTS = [
  'www.dropbox.com',
  'dropbox.com',
  'dl.dropboxusercontent.com',
  'www.dropboxusercontent.com',
];

export const isValidDropboxImageUrl = string => {
  try {
    const url = new URL(string);
    if (!(url.protocol === 'http:' || url.protocol === 'https:')) return false;
    if (!url.hostname || !url.hostname.includes('.')) return false;
    if (!DROPBOX_HOSTS.includes(url.hostname)) return false;
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url.pathname);
  } catch {
    return false;
  }
};

export const isValidDropboxDocUrl = string => {
  try {
    const url = new URL(string);
    if (!(url.protocol === 'http:' || url.protocol === 'https:')) return false;
    if (!url.hostname || !url.hostname.includes('.')) return false;
    if (!DROPBOX_HOSTS.includes(url.hostname)) return false;
    return /\.(doc|pdf|docx|odt|rtf|txt)$/i.test(url.pathname);
  } catch {
    return false;
  }
};

export const isValidUrl = string => {
  try {
    const url = new URL(string);
    if (!(url.protocol === 'http:' || url.protocol === 'https:')) return false;
    if (!url.hostname) return false;
    const isLocalOrIp = url.hostname === 'localhost' || /^[\d.]+$/.test(url.hostname);
    if (!isLocalOrIp && !url.hostname.includes('.')) return false;
    return true;
  } catch {
    return false;
  }
};
