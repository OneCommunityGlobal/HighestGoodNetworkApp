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
      if (variable.type === 'image') {
        const extracted = variableValues?.[`${variable.name}_extracted`];
        if (extracted) value = extracted;
        else if (value) {
          const candidate = Validators.extractImageFromSource(value);
          if (candidate) value = candidate;
        }
      }
      const regex = new RegExp(`{{${variable.name}}}`, 'g');
      content = content.replace(regex, value);
      subject = subject.replace(regex, value);
    });
  }

  return { subject, content };
}
