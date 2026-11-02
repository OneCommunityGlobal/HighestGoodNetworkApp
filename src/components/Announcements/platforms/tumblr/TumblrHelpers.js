// Pure helpers: UI state -> Tumblr NPF payload.
// Safe to share with the backend (Post Now route + scheduler) so both build identical payloads.

export function isValidUrl(value) {
  try {
    const u = new URL(value.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// "#cats, #dark mode #art" -> ["cats", "dark mode", "art"]
// Commas or a "#" start a new tag; spaces inside a tag are preserved (Tumblr allows them).
export function parseTags(raw) {
  const seen = new Set();
  return raw
    .split(/,|\s+(?=#)/)
    .map(t =>
      t
        .trim()
        .replace(/^#+/, '')
        .trim(),
    )
    .filter(t => {
      const key = t.toLowerCase();
      if (!t || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

/**
 * @param {object} args
 * @param {string} args.title
 * @param {Array<{id:string,type:'text'|'photo'|'gif'|'link'|'audio'|'video',text?:string,url?:string}>} args.blocks
 * @param {string} args.tags
 * @param {'everyone'|'private'} args.visibility
 */
export function buildNpfPost({ title, blocks, tags, visibility }) {
  const content = [];

  if (title.trim()) {
    content.push({ type: 'text', subtype: 'heading1', text: title.trim() });
  }

  blocks.forEach(block => {
    switch (block.type) {
      case 'text':
        // One NPF text block per paragraph
        block.text
          .split(/\n{2,}/)
          .map(p => p.trim())
          .filter(Boolean)
          .forEach(p => content.push({ type: 'text', text: p }));
        break;
      case 'photo':
        content.push({ type: 'image', media: [{ url: block.url }] });
        break;
      case 'gif':
        content.push({ type: 'image', media: [{ type: 'image/gif', url: block.url }] });
        break;
      case 'link':
        content.push({ type: 'link', url: block.url });
        break;
      case 'video':
        content.push({ type: 'video', url: block.url, provider: 'unknown' });
        break;
      case 'audio':
        content.push({ type: 'audio', url: block.url, provider: 'unknown' });
        break;
      default:
        break;
    }
  });

  return {
    content,
    tags: parseTags(tags),
    state: visibility === 'private' ? 'private' : 'published',
  };
}
