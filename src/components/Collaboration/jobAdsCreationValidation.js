import { isValidDropboxImageUrl, isValidUrl } from '../../utils/checkValidURL';
import getWordCount from '../../utils/getWordCount';

const MIN_WORDS = 30;

/**
 * @returns {{ field: string, message: string } | null}
 */
export function validateJobAdsForm(formData) {
  if (!formData.category) {
    return { field: 'category', message: 'Category is required' };
  }
  if (!formData.title) {
    return { field: 'title', message: 'Title is required' };
  }
  if (!formData.description) {
    return { field: 'description', message: 'Description is required' };
  }
  if (getWordCount(formData.description) < MIN_WORDS) {
    return { field: 'description', message: 'Description must be at least 30 characters long' };
  }
  if (!formData.requirements) {
    return { field: 'requirements', message: 'Requirements is required' };
  }
  if (getWordCount(formData.requirements) < MIN_WORDS) {
    return { field: 'requirements', message: 'Requirements must be at least 30 words long' };
  }
  if (!formData.projects) {
    return { field: 'projects', message: 'Projects is required' };
  }
  if (getWordCount(formData.projects) < 1) {
    return { field: 'projects', message: 'Projects must be at least 1 word long' };
  }
  if (!formData.ourCommunity) {
    return { field: 'ourCommunity', message: 'Our Community is required' };
  }
  if (getWordCount(formData.ourCommunity) < MIN_WORDS) {
    return { field: 'ourCommunity', message: 'Our Community must be at least 30 words long' };
  }
  if (!formData.imageUrl) {
    return { field: 'imageUrl', message: 'ImageURL is required' };
  }
  if (!isValidDropboxImageUrl(formData.imageUrl)) {
    return { field: 'imageUrl', message: 'Enter a valid ImageURL' };
  }
  if (!formData.location) {
    return { field: 'location', message: 'Location is required' };
  }
  if (formData.location !== 'remote') {
    return { field: 'location', message: 'Location should be remote only' };
  }
  if (!formData.applyLink) {
    return { field: 'applyLink', message: 'Apply Link is required' };
  }
  if (!isValidUrl(formData.applyLink)) {
    return { field: 'applyLink', message: 'Enter the valid Apply Link' };
  }
  return null;
}
