import sampleData from './data';

const fetchApplicantsData = filter =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(sampleData[filter.selectedOption]);
    }, 500);
  });

export default fetchApplicantsData;
