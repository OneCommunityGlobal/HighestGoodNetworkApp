import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';

const getPRNumbers = value => value.split('+').map(number => number.trim());

const getGradingKey = teamData => {
  const [month, day, year] = teamData.dateRange.start.split('/').map(Number);
  const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return { teamCode: `pr-grading-screen:${teamData.teamName}`, date };
};

export const loadSavedGradings = async teamData => {
  const { teamCode, date } = getGradingKey(teamData);
  const response = await axios.get(ENDPOINTS.WEEKLY_GRADING, {
    params: { team: teamCode, date },
  });
  return response.data;
};

export const saveAddedPR = (teamData, reviewer, prNumbers) => {
  const { teamCode, date } = getGradingKey(teamData);
  return axios.post(ENDPOINTS.WEEKLY_GRADING_SAVE, {
    teamCode,
    date,
    gradings: [
      {
        reviewer: reviewer.reviewer,
        prsNeeded: reviewer.prsNeeded,
        prsReviewed: reviewer.gradedPrs.length + 1,
        gradedPrs: [{ prNumbers, grade: 'Okay' }],
      },
    ],
  });
};

export const mergeSavedGradings = (reviewers, savedGradings) => {
  const savedByReviewer = new Map(savedGradings.map(grading => [grading.reviewer, grading]));

  return reviewers.map(reviewer => {
    const seen = new Set(reviewer.gradedPrs.flatMap(pr => getPRNumbers(pr.prNumbers)));
    const additions = (savedByReviewer.get(reviewer.reviewer)?.gradedPrs || [])
      .filter(pr => {
        const numbers = getPRNumbers(pr.prNumbers);
        if (numbers.some(number => seen.has(number))) return false;
        numbers.forEach(number => seen.add(number));
        return true;
      })
      .map(pr => ({ ...pr, id: String(pr._id || pr.id || pr.prNumbers) }));
    const gradedPrs = [...reviewer.gradedPrs, ...additions];
    return { ...reviewer, gradedPrs, prsReviewed: gradedPrs.length };
  });
};
