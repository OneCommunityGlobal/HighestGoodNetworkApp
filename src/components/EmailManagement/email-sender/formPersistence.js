// formPersistence.js - LocalStorage utilities for form state persistence

const STORAGE_KEY = 'integratedEmailSender_draft';
const STORAGE_TIMESTAMP_KEY = 'integratedEmailSender_draft_timestamp';
const MAX_DRAFT_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Save form state to localStorage
 * @param {Object} formState - The form state to save
 */
export const saveDraft = formState => {
  try {
    const dataToSave = {
      selectedTemplateId: formState.selectedTemplate?._id || null,
      customContent: formState.customContent || '',
      customSubject: formState.customSubject || '',
      recipients: formState.recipients || '',
      variableValues: formState.variableValues || {},
      emailDistribution: formState.emailDistribution || 'specific',
      emailMode: formState.emailMode || 'template',
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());

    return true;
  } catch (error) {
    console.error('Failed to save draft:', error);
    return false;
  }
};

/**
 * Load form state from localStorage
 * @returns {Object|null} - The saved form state or null if none exists/expired
 */
export const loadDraft = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const timestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);

    if (!savedData || !timestamp) {
      return null;
    }

    // Check if draft is too old
    const age = Date.now() - parseInt(timestamp, 10);
    if (age > MAX_DRAFT_AGE_MS) {
      clearDraft();
      return null;
    }

    return JSON.parse(savedData);
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
};

/**
 * Clear saved form state from localStorage
 */
export const clearDraft = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear draft:', error);
    return false;
  }
};

/**
 * Check if a draft exists
 * @returns {boolean}
 */
export const hasDraft = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const timestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);

    if (!savedData || !timestamp) {
      return false;
    }

    // Check if draft is too old
    const age = Date.now() - parseInt(timestamp, 10);
    if (age > MAX_DRAFT_AGE_MS) {
      clearDraft();
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get draft age in minutes
 * @returns {number|null}
 */
export const getDraftAge = () => {
  try {
    const timestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
    if (!timestamp) return null;

    const ageMs = Date.now() - parseInt(timestamp, 10);
    return Math.floor(ageMs / (1000 * 60)); // Convert to minutes
  } catch (error) {
    return null;
  }
};
