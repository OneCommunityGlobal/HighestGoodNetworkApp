export const generateShareContent = (activity = {}, availability = 0, activityId) => {
  const baseUrl = window.location.origin;
  const eventPath = `/communityportal/Activities/Register/${activityId}`;
  const shareUrl = `${baseUrl}${eventPath}`;

  const name = activity.name ?? 'Untitled Event';
  const date = activity.date ?? 'Not specified';
  const time = activity.time ?? activity.startTime ?? 'Not specified';
  const location = activity.location ?? activity.venue ?? 'Not specified';
  const organizer = activity.organizer ?? 'Not specified';
  const rating = activity.rating ?? 'Not rated';
  const description = activity.description ?? '';

  const title = `Check Out: ${name}`;

  const eventDetails = `Event: ${name}
Date: ${date}
Time: ${time}
Location: ${location}
Organizer: ${organizer}
Available Spots: ${Number.isFinite(Number(availability)) ? availability : 0}
Rating: ${rating}/5

${description}

Register here: ${shareUrl}`;

  const socialText = `Join me at "${name}"!\n${date} at ${time}\n${location}\n${availability ?? 0} spots available\n\nLink: ${shareUrl}`;

  return {
    title,
    shareUrl,
    fullText: eventDetails,
    socialText,
    eventName: name,
    eventDate: date,
    eventTime: time,
    eventLocation: location,
    availableSpots: availability ?? 0,
  };
};

export const CopyToClipboard = async(text) => {
  try{
    if(navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return CopyToClipboardFallback(text);
  }
  catch(error){
    console.error('Copy to Clipboard failed: ', error);
    return CopyToClipboardFallback(text);
  }
};

const CopyToClipboardFallback = (text) => {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);

  try {
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Fallback copy failed:', error);
    document.body.removeChild(textArea);
    return false;
  }
};