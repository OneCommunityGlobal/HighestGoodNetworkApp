import { isValidDropboxImageUrl, isValidUrl } from '../../utils/checkValidURL';
import getWordCount from '../../utils/getWordCount';

const MIN_WORDS = 30;

const requireField = (value, field, message) => (value ? null : { field, message });

const requireMinWords = (value, field, min, message) =>
  getWordCount(value) < min ? { field, message } : null;

/**
 * @returns {{ field: string, message: string } | null}
 */
export function validateJobAdsForm(formData) {
  const checks = [
    () => requireField(formData.category, 'category', 'Category is required'),
    () => requireField(formData.title, 'title', 'Title is required'),
    () => requireField(formData.description, 'description', 'Description is required'),
    () =>
      requireMinWords(
        formData.description,
        'description',
        MIN_WORDS,
        'Description must be at least 30 characters long',
      ),
    () => requireField(formData.requirements, 'requirements', 'Requirements is required'),
    () =>
      requireMinWords(
        formData.requirements,
        'requirements',
        MIN_WORDS,
        'Requirements must be at least 30 words long',
      ),
    () => requireField(formData.projects, 'projects', 'Projects is required'),
    () =>
      requireMinWords(formData.projects, 'projects', 1, 'Projects must be at least 1 word long'),
    () => requireField(formData.ourCommunity, 'ourCommunity', 'Our Community is required'),
    () =>
      requireMinWords(
        formData.ourCommunity,
        'ourCommunity',
        MIN_WORDS,
        'Our Community must be at least 30 words long',
      ),
    () => requireField(formData.imageUrl, 'imageUrl', 'ImageURL is required'),
    () =>
      isValidDropboxImageUrl(formData.imageUrl)
        ? null
        : { field: 'imageUrl', message: 'Enter a valid ImageURL' },
    () => requireField(formData.location, 'location', 'Location is required'),
    () =>
      formData.location === 'remote'
        ? null
        : { field: 'location', message: 'Location should be remote only' },
    () => requireField(formData.applyLink, 'applyLink', 'Apply Link is required'),
    () =>
      isValidUrl(formData.applyLink)
        ? null
        : { field: 'applyLink', message: 'Enter the valid Apply Link' },
  ];

  for (const check of checks) {
    const error = check();
    if (error) return error;
  }
  return null;
}
