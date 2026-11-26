// Keep in sync with PRONOUN_OPTIONS in HGNRest/src/constants/userProfile.js
export const PRONOUN_OPTIONS = ['He/Him', 'She/Her', 'They/Them'];

export const isValidPronoun = value => PRONOUN_OPTIONS.includes(value);
