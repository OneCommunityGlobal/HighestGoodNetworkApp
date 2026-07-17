// eslint-disable-next-line import/no-extraneous-dependencies
import slugify from 'slugify';

// Utility to generate a custom referral link for a job ad
// Usage: generateReferralLink('Software Engineer', 'LN')
export default function generateReferralLink(jobTitle, source) {
  const slug = slugify(jobTitle, { lower: true });
  return `${window.location.origin}/jobs/${slug}${source ? `-${source.toLowerCase()}` : ''}`;
}
