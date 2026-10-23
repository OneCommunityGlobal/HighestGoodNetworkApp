// Single source of truth for PR grade values.
//
// The inline summary and the grading modal both render their checkboxes from this
// list, so the value written on click is always the value compared against when
// deciding `checked`. Previously each place declared its own list and the
// "Cannot find image" option carried the value 'No Correct Image' inline but
// 'Cannot find image' in the modal, so grading it inline left the modal unchecked.

const GRADE_OPTIONS = [
  {
    value: 'Did not review',
    label: 'Did not review',
  },
  {
    value: 'Needs more details',
    label: 'Needs more details',
  },
  {
    value: 'Good',
    label: 'Good',
  },
  {
    value: 'Exceptional',
    label: 'Exceptional',
  },
  {
    value: 'No Image',
    label: 'No Image',
  },
];

export default GRADE_OPTIONS;
