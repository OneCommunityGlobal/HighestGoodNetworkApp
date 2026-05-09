export const generateShareContent = (
  activity = {},
  availability = 0,
  activityId = '',
) => {
  const baseUrl = globalThis.location.origin;
  const eventPath = `/communityportal/Activities/Register/${activityId}`;
  const shareUrl = `${baseUrl}${eventPath}`;

  const name = activity.name ?? 'Untitled Event';
  const date = activity.date ?? 'Not specified';
  const time = activity.time ?? activity.startTime ?? 'Not specified';
  const location = activity.location ?? activity.venue ?? 'Not specified';
  const organizer = activity.organizer ?? 'Not specified';
  const rating = activity.rating ?? 'Not rated';
  const description = activity.description ?? '';

  const safeAvailability = Number.isFinite(Number(availability))
    ? availability
    : 0;

  const title = `Check Out: ${name}`;

  const eventDetails = `Event: ${name}
Date: ${date}
Time: ${time}
Location: ${location}
Organizer: ${organizer}
Available Spots: ${safeAvailability}
Rating: ${rating}/5

${description}

Register here: ${shareUrl}`;

  const socialText = `Join me at "${name}"!
${date} at ${time}
${location}
${safeAvailability} spots available

Link: ${shareUrl}`;

  return {
    title,
    shareUrl,
    fullText: eventDetails,
    socialText,
    eventName: name,
    eventDate: date,
    eventTime: time,
    eventLocation: location,
    availableSpots: safeAvailability,
  };
};

const copyToClipboardFallback = text => {
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

    textArea.remove();

    return successful;
  } catch (error) {
    console.error('Fallback copy failed:', error);

    textArea.remove();

    return false;
  }
};

export const CopyToClipboard = async text => {
  try {
    if (navigator.clipboard && globalThis.isSecureContext) {
      await navigator.clipboard.writeText(text);

      return true;
    }

    return copyToClipboardFallback(text);
  } catch (error) {
    console.error('Copy to clipboard failed:', error);

    return copyToClipboardFallback(text);
  }
};