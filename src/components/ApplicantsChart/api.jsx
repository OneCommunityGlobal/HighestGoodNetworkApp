import data from './data';

const fetchApplicantsData = filter =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(data[filter.selectedOption]);
    }, 500);
  });

export default fetchApplicantsData;
