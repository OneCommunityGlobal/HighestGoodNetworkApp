export const generateShareContent = (activity, availability, activityId) => {
  const baseUrl = window.location.origin;
  const eventPath = `/communityportal/Activities/Register/${activityId}`;
  const shareUrl = `${baseUrl}${eventPath}`;

  const title = `Check Out: ${activity.name}`;
  const eventDetails = `Event: ${activity.name}
                        Date: ${activity.date}
                        Time: ${activity.time}
                        Location: ${activity.location || 'Not Specified'}
                        Organizer: ${activity.organizer || 'Not Specified'}
                        Available Spots: ${availability}
                        Rating: ${activity.rating || 'Not Rated'}/5
                        ${activity.description || ''}

                        Register here: ${shareUrl}`;

  const socialText = `Join me at "${activity.name}"!\n ${activity.date} at ${activity.time}\n ${activity.location || 'Not specified'}\n ${availability} spots available\n\nLink: ${shareUrl}`;       
  
  return {
    title,
    shareUrl,
    fullText: eventDetails,
    socialText,
    eventName: activity.name,
    eventDate: activity.date,
    eventTime: activity.time,
    eventLocation: activity.location,
    availableSpots: availability,
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