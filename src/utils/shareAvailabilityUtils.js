export const generateShareContent = (activity = {}, availability = 0, activityId = '') => {
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

  return {
    title: `Check Out: ${name}`,
    shareUrl,
    fullText: `Event: ${name}
Date: ${date}
Time: ${time}
Location: ${location}
Organizer: ${organizer}
Available Spots: ${Number.isFinite(Number(availability)) ? availability : 0}
Rating: ${rating}/5

${description}

Register here: ${shareUrl}`,
  };
};

/**
 * Modern clipboard-only implementation (no execCommand)
 */
export const CopyToClipboard = async text => {
  try {
    if (globalThis.navigator?.clipboard?.writeText && globalThis.isSecureContext) {
      await globalThis.navigator.clipboard.writeText(text);
      return true;
    }
    throw new Error('Clipboard API not supported');
  } catch (error) {
    console.error('Copy to Clipboard failed:', error);
    return false;
  }
};