import { Validators } from './validation';

export function parseRecipients(recipientText) {
  if (!recipientText || typeof recipientText !== 'string') return [];
  return recipientText
    .split(/[,;\n]/)
    .map(email => email.trim())
    .filter(email => email.length > 0 && email.includes('@'));
}

export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function buildRenderedEmailFromTemplate(templateData, variableValues) {
  if (!templateData) return { subject: '', content: '' };

  let content = templateData.html_content || templateData.content || '';
  let subject = templateData.subject || '';

  if (Array.isArray(templateData.variables)) {
    templateData.variables.forEach(variable => {
      if (!variable || !variable.name) return;
      // Keep {{variableName}} as is if no value provided, don't replace with [variableName]
      if (!variableValues?.[variable.name]) return;

      let value = variableValues[variable.name];

      // Handle image variables
      if (variable.type === 'image') {
        const extracted = variableValues?.[`${variable.name}_extracted`];
        if (extracted) value = extracted;
        else if (value) {
          const candidate = Validators.extractImageFromSource(value);
          if (candidate) value = candidate;
        }

        // Wrap image URL in <img> tag for preview
        if (value) {
          value = `<img src="${value}" alt="${variable.name}" style="max-width: 100%; height: auto; display: block; margin: 10px 0; border-radius: 4px;">`;
        }
      }

      // Handle video variables
      if (variable.type === 'video') {
        if (value) {
          // Check if it's a YouTube URL
          const youtubeId = Validators.extractYouTubeId(value);
          if (youtubeId) {
            // Create YouTube embed or link
            value = `<div style="margin: 10px 0;">
              <a href="${value}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #FF0000; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                ▶ Watch Video on YouTube
              </a>
              <br>
              <small style="color: #666; display: block; margin-top: 5px;">${value}</small>
            </div>`;
          } else {
            // For direct video URLs, create a link
            value = `<div style="margin: 10px 0;">
              <a href="${value}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                ▶ Watch Video
              </a>
              <br>
              <small style="color: #666; display: block; margin-top: 5px;">${value}</small>
            </div>`;
          }
        }
      }

      const regex = new RegExp(`{{${variable.name}}}`, 'g');
      content = content.replace(regex, value);
      subject = subject.replace(regex, value);
    });
  }

  return { subject, content };
}
