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

export const isValidDropboxImageUrl= (string) => {
  try {
    const url = new URL(string);

    // Must be http or https
    if (!(url.protocol === "http:" || url.protocol === "https:")) {
      return false;
    }
    // Must have a hostname (like example.com)
    if (!url.hostname || url.hostname.indexOf(".") === -1 )  {
      return false;
    }

     const validHosts = 
    ["www.dropbox.com", "dropbox.com", 
       "dl.dropboxusercontent.com",
      "www.dropboxusercontent.com",]
   if (!validHosts.includes(url.hostname)) {
    return false;
   }
   
   let target = url.href;

// If Dropbox hides filename in the "preview" query:
const preview = url.searchParams.get("preview");
if (preview) target += preview;

if (!target.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
  return false;
}

  
    return true;
  } catch {
    return false;
  }
}
export const isValidDropboxDocUrl= (string) => {
  try {
    const url = new URL(string);

    // Must be http or https
    if (!(url.protocol === "http:" || url.protocol === "https:")) {
      return false;
    }
    // Must have a hostname (like example.com)
    if (!url.hostname || url.hostname.indexOf(".") === -1 )  {
      return false;
    }

     const validHosts = 
    ["www.dropbox.com", "dropbox.com", 
       "dl.dropboxusercontent.com",
      "www.dropboxusercontent.com",]
   if (!validHosts.includes(url.hostname)) {
    return false;
   }

    // Optionally: enforce file extension (doc, docx, pdf,  etc.)
    if (!url.pathname.match(/\.(doc|pdf|docx|odt|rtf|txt)$/i)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export const isValidUrl= (string) => {
  try {
    const url = new URL(string);

    // Must be http or https
    if (!(url.protocol === "http:" || url.protocol === "https:")) {
      return false;
    }
  
    // Must have a hostname (like example.com)
    if (!url.hostname) {
      return false;

    } 
    // Allow localhost or IP addresses
    const isLocalOrIp = url.hostname === "localhost" || /^[\d.]+$/.test(url.hostname);
    const hasDot = url.hostname.includes(".");

    if (!isLocalOrIp && !hasDot) {
      return false;
    }
    
    
    return true;
  } catch {
    return false;
  }
}