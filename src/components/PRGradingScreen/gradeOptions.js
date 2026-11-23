// Single source of truth for PR grade values.
//
// The inline summary and the grading modal both render their checkboxes from this
// list, so the value written on click is always the value compared against when
// deciding `checked`. Previously each place declared its own list and the
// "Cannot find image" option carried the value 'No Correct Image' inline but
// 'Cannot find image' in the modal, so grading it inline left the modal unchecked.
const GRADE_OPTIONS = [
  { label: 'Exceptional', value: 'Exceptional' },
  { label: 'Okay', value: 'Okay' },
  { label: 'Unsatisfactory', value: 'Unsatisfactory' },
  { label: 'Cannot find image', value: 'Cannot find image' },
];

export default GRADE_OPTIONS;
