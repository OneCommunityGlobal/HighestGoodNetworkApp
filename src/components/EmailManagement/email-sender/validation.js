// Type-safe, centralized validation for email template variables

const IMAGE_EXT_REGEX = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
const EMAIL_URL_REGEX = /^(https?:)\/\/[\w.-]+(?:\:\d+)?(?:[\/\?#][^\s]*)?$/i;

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

const TEXT_VALIDATION_RULE = {
  isValid: ({ rawValue }) => isNonEmptyString(rawValue),
  requiredMessage: name => `${name} is required`,
  optionalMessage: 'Please enter a value',
};

const VARIABLE_VALIDATION_RULES = {
  image: {
    isValid: ({ rawValue, extracted }) => isValidImage(rawValue, extracted),
    requiredMessage: name => `${name} is required (valid image URL or YouTube link)`,
    optionalMessage: 'Please enter a valid image URL or YouTube link',
  },
  url: {
    isValid: ({ rawValue }) => isValidUrl(rawValue),
    requiredMessage: name => `${name} is required (valid URL)`,
    optionalMessage: 'Please enter a valid URL',
  },
  number: {
    isValid: ({ rawValue }) => isValidNumber(rawValue),
    requiredMessage: name => `${name} is required (number)`,
    optionalMessage: 'Please enter a valid number',
  },
  textarea: TEXT_VALIDATION_RULE,
  text: TEXT_VALIDATION_RULE,
};

function getVariableValidationContext(variable, variableValues) {
  if (!variable || !variable.name) return null;

  const name = variable.name;
  const required = variable.required !== undefined ? !!variable.required : true;
  const rawValue = variableValues?.[name];
  const extracted = variableValues?.[`${name}_extracted`];
  const hasAnyValue = isNonEmptyString(rawValue) || isNonEmptyString(extracted);

  if (!required && !hasAnyValue) return null;

  return {
    name,
    type: variable.type || 'text',
    required,
    rawValue,
    extracted,
  };
}

function getVariableValidationError(context) {
  const rule = VARIABLE_VALIDATION_RULES[context.type] || TEXT_VALIDATION_RULE;

  if (rule.isValid(context)) return null;

  return context.required ? rule.requiredMessage(context.name) : rule.optionalMessage;
}

export function validateTemplateVariables(template, variableValues) {
  if (!template || !Array.isArray(template.variables) || template.variables.length === 0) {
    return {};
  }

  return template.variables.reduce((errors, variable) => {
    const context = getVariableValidationContext(variable, variableValues);
    if (!context) return errors;

    const error = getVariableValidationError(context);
    if (error) {
      errors[context.name] = error;
    }

    return errors;
  }, {});
}

export function validateVariable(variable, variableValues) {
  const context = getVariableValidationContext(variable, variableValues);
  return context ? getVariableValidationError(context) : null;
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
