// Type-safe, centralized validation for email template variables

const IMAGE_EXT_REGEX = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
const EMAIL_URL_REGEX = /^(https?:)\/\/[\w.-]+(?:\:[0-9]+)?(?:[\/\?#][^\s]*)?$/i;

const YOUTUBE_ID_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
const YOUTUBE_VIDEO_ID_VALID = /^[a-zA-Z0-9_-]{11}$/;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidUrl(value) {
  if (!isNonEmptyString(value)) return false;
  return EMAIL_URL_REGEX.test(value.trim());
}

function isValidNumber(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  return Number.isFinite(Number(value));
}

function extractImageFromSource(source) {
  if (!isNonEmptyString(source)) return null;

  if (IMAGE_EXT_REGEX.test(source)) {
    return source;
  }

  const youtubeMatch = source.match(YOUTUBE_ID_REGEX);
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    if (!YOUTUBE_VIDEO_ID_VALID.test(videoId)) return null;
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }

  return null;
}

function extractYouTubeId(source) {
  if (!isNonEmptyString(source)) return null;
  const match = source.match(YOUTUBE_ID_REGEX);
  if (!match) return null;
  const id = match[1];
  return YOUTUBE_VIDEO_ID_VALID.test(id) ? id : null;
}

function isValidImage(value, extractedValue) {
  // Accept direct valid image URL or a valid extracted URL
  if (isNonEmptyString(extractedValue) && isValidUrl(extractedValue)) return true;
  if (
    isNonEmptyString(value) &&
    (IMAGE_EXT_REGEX.test(value) || isValidUrl(extractImageFromSource(value) || ''))
  ) {
    return true;
  }
  return false;
}

export function validateTemplateVariables(template, variableValues) {
  const errors = {};

  if (!template || !Array.isArray(template.variables) || template.variables.length === 0) {
    return errors;
  }

  template.variables.forEach(variable => {
    if (!variable || !variable.name) return;

    const name = variable.name;
    const type = variable.type || 'text';
    const required = variable.required !== undefined ? !!variable.required : true;

    const rawValue = variableValues?.[name];
    const extracted = variableValues?.[`${name}_extracted`];

    // If not required and empty, skip validation
    const hasAnyValue = isNonEmptyString(rawValue) || isNonEmptyString(extracted);
    if (!required && !hasAnyValue) return;

    switch (type) {
      case 'image': {
        if (!isValidImage(rawValue, extracted)) {
          errors[name] = required
            ? `${name} is required (valid image URL or YouTube link)`
            : `Please enter a valid image URL or YouTube link`;
        }
        break;
      }
      case 'url': {
        if (!isValidUrl(rawValue)) {
          errors[name] = required ? `${name} is required (valid URL)` : `Please enter a valid URL`;
        }
        break;
      }
      case 'number': {
        if (!isValidNumber(rawValue)) {
          errors[name] = required ? `${name} is required (number)` : `Please enter a valid number`;
        }
        break;
      }
      case 'textarea':
      case 'text':
      default: {
        if (!isNonEmptyString(rawValue)) {
          errors[name] = required ? `${name} is required` : `Please enter a value`;
        }
        break;
      }
    }
  });

  return errors;
}

export function validateVariable(variable, variableValues) {
  if (!variable || !variable.name) return null;
  const name = variable.name;
  const type = variable.type || 'text';
  const required = variable.required !== undefined ? !!variable.required : true;

  const rawValue = variableValues?.[name];
  const extracted = variableValues?.[`${name}_extracted`];
  const hasAnyValue = isNonEmptyString(rawValue) || isNonEmptyString(extracted);

  if (!required && !hasAnyValue) return null;

  switch (type) {
    case 'image':
      return isValidImage(rawValue, extracted)
        ? null
        : required
        ? `${name} is required (valid image URL or YouTube link)`
        : 'Please enter a valid image URL or YouTube link';
    case 'url':
      return isValidUrl(rawValue)
        ? null
        : required
        ? `${name} is required (valid URL)`
        : 'Please enter a valid URL';
    case 'number':
      return isValidNumber(rawValue)
        ? null
        : required
        ? `${name} is required (number)`
        : 'Please enter a valid number';
    case 'textarea':
    case 'text':
    default:
      return isNonEmptyString(rawValue)
        ? null
        : required
        ? `${name} is required`
        : 'Please enter a value';
  }
}

export function extractImageForVariableIfNeeded(variable, variableValues) {
  if (!variable || variable.type !== 'image') return variableValues;
  const name = variable.name;
  const extracted = variableValues?.[`${name}_extracted`];
  if (isNonEmptyString(extracted)) return variableValues;
  const raw = variableValues?.[name];
  const candidate = extractImageFromSource(raw);
  if (!candidate) return variableValues;
  return { ...variableValues, [`${name}_extracted`]: candidate };
}

export const Validators = {
  isNonEmptyString,
  isValidUrl,
  isValidNumber,
  extractImageFromSource,
  extractYouTubeId,
};
