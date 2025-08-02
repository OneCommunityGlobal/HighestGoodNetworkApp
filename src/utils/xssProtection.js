/**
 * XSS Protection Utilities
 * 
 * This module provides comprehensive XSS protection for the application.
 * It includes sanitization functions for different types of content and input validation.
 */

import DOMPurify from 'dompurify';

// Configure DOMPurify with secure defaults
const createDOMPurifyConfig = (options = {}) => ({
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'span', 'div',
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'hr',
    ...(options.allowedTags || [])
  ],
  ALLOWED_ATTR: [
    'href', 'title', 'alt', 'src', 'class', 'id', 'style', 'target', 'rel',
    'colspan', 'rowspan', 'width', 'height', 'align',
    ...(options.allowedAttributes || [])
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|#):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  SANITIZE_DOM: true,
  KEEP_CONTENT: true,
  FORCE_BODY: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
  ...options
});

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param {string} content - The content to sanitize
 * @param {object} options - Configuration options for DOMPurify
 * @returns {string} - Sanitized HTML content
 */
export const sanitizeHTML = (content, options = {}) => {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  const config = createDOMPurifyConfig(options);
  return DOMPurify.sanitize(content, config);
};

/**
 * Sanitizes text input by removing HTML tags and encoding special characters
 * @param {string} input - The input to sanitize
 * @returns {string} - Sanitized text
 */
export const sanitizeText = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove HTML tags and decode entities, then re-encode to prevent XSS
  const stripped = DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  
  // Additional encoding for special characters
  return stripped
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Sanitizes URLs to prevent javascript: and data: URI XSS attacks
 * @param {string} url - The URL to sanitize
 * @returns {string} - Sanitized URL or empty string if invalid
 * @example
 * // Returns: https://example.com
 * sanitizeURL('https://example.com')
 * 
 * // Returns: https://docs.google.com/document/d/abc123
 * sanitizeURL('docs.google.com/document/d/abc123')
 * 
 * // Returns: ''
 * sanitizeURL('javascript:alert("xss")')
 */
export const sanitizeURL = (url) => {
  if (!url || typeof url !== 'string') {
    return '';
  }
  
  const input = url.trim();
  
  // Reject URLs with spaces (enhanced security check)
  if (/\s/.test(input)) {
    return '';
  }
  
  try {
    // Auto-add https:// if no protocol specified
    const urlToValidate = input.startsWith('http') ? input : `https://${input}`;
    const urlObj = new URL(urlToValidate);
    
    // Only allow http/https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }
    
    // Additional dangerous protocol checks
    const dangerousProtocols = [
      /^javascript:/i, /^data:/i, /^vbscript:/i, /^file:/i, /^about:/i,
      /^chrome:/i, /^chrome-extension:/i, /^moz-extension:/i
    ];
    
    if (dangerousProtocols.some(protocol => protocol.test(input))) {
      return '';
    }
    
    // Use DOMPurify for additional sanitization
    const sanitized = DOMPurify.sanitize(urlObj.href, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    
    return sanitized;
  } catch (e) {
    // If URL constructor fails, return empty string
    return '';
  }
};

/**
 * Sanitizes form input data
 * @param {object} formData - Object containing form data
 * @param {object} config - Configuration for which fields to sanitize and how
 * @returns {object} - Sanitized form data
 */
export const sanitizeFormData = (formData, config = {}) => {
  if (!formData || typeof formData !== 'object') {
    return {};
  }
  
  const sanitized = {};
  
  Object.keys(formData).forEach(key => {
    const value = formData[key];
    const fieldConfig = config[key] || config.default || {};
    
    if (value === null || value === undefined) {
      sanitized[key] = value;
      return;
    }
    
    if (typeof value === 'string') {
      if (fieldConfig.type === 'html') {
        sanitized[key] = sanitizeHTML(value, fieldConfig.options);
      } else if (fieldConfig.type === 'url') {
        sanitized[key] = sanitizeURL(value);
      } else {
        sanitized[key] = sanitizeText(value);
      }
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeText(item) : item
      );
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeFormData(value, config);
    } else {
      sanitized[key] = value;
    }
  });
  
  return sanitized;
};

/**
 * Validates and sanitizes user input for specific field types
 * @param {string} value - The input value
 * @param {string} type - The type of input (email, url, text, etc.)
 * @returns {object} - Object with isValid boolean and sanitized value
 */
export const validateAndSanitizeInput = (value, type) => {
  if (!value || typeof value !== 'string') {
    return { isValid: false, sanitizedValue: '' };
  }
  
  const sanitizedValue = sanitizeText(value);
  
  switch (type) {
    case 'email': {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return {
        isValid: emailRegex.test(sanitizedValue),
        sanitizedValue
      };
    }
      
    case 'url': {
      const sanitizedUrl = sanitizeURL(value);
      return {
        isValid: sanitizedUrl !== '',
        sanitizedValue: sanitizedUrl
      };
    }
      
    case 'phone': {
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
      const cleanPhone = sanitizedValue.replace(/\D/g, '');
      return {
        isValid: phoneRegex.test(cleanPhone),
        sanitizedValue: cleanPhone
      };
    }
      
    case 'text':
    default:
      return {
        isValid: sanitizedValue.length > 0,
        sanitizedValue
      };
  }
};

/**
 * Sanitizes content for rich text editors
 * @param {string} content - Rich text content
 * @param {object} options - Additional options for sanitization
 * @returns {string} - Sanitized rich text content
 */
export const sanitizeRichText = (content, options = {}) => {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  const richTextConfig = createDOMPurifyConfig({
    allowedTags: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'span', 'div', 'sub', 'sup',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'hr', 'strike', 'del', 'ins',
      ...(options.allowedTags || [])
    ],
    allowedAttributes: [
      'href', 'title', 'alt', 'src', 'class', 'id', 'target', 'rel', 'style',
      'colspan', 'rowspan', 'width', 'height', 'align', 'border', 'cellpadding', 'cellspacing',
      ...(options.allowedAttributes || [])
    ],
    ALLOW_DATA_ATTR: false,
    ...options
  });
  
  return DOMPurify.sanitize(content, richTextConfig);
};

/**
 * CSP-safe inline style sanitization
 * @param {string} styles - CSS styles string
 * @returns {string} - Sanitized styles
 */
export const sanitizeInlineStyles = (styles) => {
  if (!styles || typeof styles !== 'string') {
    return '';
  }
  
  // Remove potentially dangerous CSS properties
  const dangerousPatterns = [
    /expression\s*\(/gi,
    /javascript\s*:/gi,
    /vbscript\s*:/gi,
    /data\s*:/gi,
    /binding\s*:/gi,
    /behavior\s*:/gi,
    /-moz-binding/gi,
    /import/gi,
    /@import/gi
  ];
  
  let sanitized = styles;
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  // Remove URLs with dangerous protocols
  sanitized = sanitized.replace(/url\s*\(\s*["']?(javascript|data|vbscript):/gi, 'url(');
  
  return sanitized;
};

/**
 * Sanitizes attributes for JSX elements
 * @param {object} attributes - Object containing element attributes
 * @returns {object} - Sanitized attributes
 */
export const sanitizeAttributes = (attributes) => {
  if (!attributes || typeof attributes !== 'object') {
    return {};
  }
  
  const sanitized = {};
  
  Object.keys(attributes).forEach(key => {
    const value = attributes[key];
    
    if (typeof value === 'string') {
      if (key === 'href' || key === 'src' || key === 'action' || key === 'formAction') {
        sanitized[key] = sanitizeURL(value);
      } else if (key === 'style') {
        sanitized[key] = sanitizeInlineStyles(value);
      } else {
        sanitized[key] = sanitizeText(value);
      }
    } else {
      sanitized[key] = value;
    }
  });
  
  return sanitized;
};

// Export default sanitization function for backward compatibility
export default sanitizeHTML;
