export async function postToMastodon(postContent) {
  try {
    const response = await fetch('/api/mastodon/createPin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Mastodon Post',
        description: postContent,
        imgType: 'URL',
        mediaItems: '', // Optional
      }),
    });

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error('Error posting to Mastodon:', error);
    return { success: false, error };
  }
}
