import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';

const getPRNumbers = value => value.split('+').map(number => number.trim());
const toDisplayGrade = grade => (grade === 'No Correct Image' ? 'Cannot find image' : grade);

const getGradingKey = teamData => {
  const [month, day, year] = teamData.dateRange.start.split('/').map(Number);
  const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return { teamKey: `pr-grading-screen:${teamData.teamName}`, date };
};

export const loadSavedGradings = async teamData => {
  const { teamKey, date } = getGradingKey(teamData);
  const response = await axios.get(ENDPOINTS.WEEKLY_GRADING, {
    params: { team: teamKey, date, weekStart: date },
  });
  return response.data;
};

export const saveAddedPR = (teamData, reviewer, prNumbers) => {
  const { teamKey, date } = getGradingKey(teamData);
  return axios.post(ENDPOINTS.WEEKLY_GRADING_SAVE, {
    teamCode: teamKey,
    teamName: teamKey,
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

export const saveGradeChange = (teamData, reviewer, prNumbers, grade) => {
  const { teamKey, date } = getGradingKey(teamData);
  return axios.post(ENDPOINTS.WEEKLY_GRADING_SAVE, {
    teamCode: teamKey,
    teamName: teamKey,
    date,
    gradings: [
      {
        reviewer: reviewer.reviewer,
        prsNeeded: reviewer.prsNeeded,
        prsReviewed: reviewer.gradedPrs.length,
        gradedPrs: [{ prNumbers, grade }],
      },
    ],
  });
};

export const mergeSavedGradings = (reviewers, savedGradings) => {
  const savedByReviewer = new Map(savedGradings.map(grading => [grading.reviewer, grading]));

  return reviewers.map(reviewer => {
    const savedPrs = savedByReviewer.get(reviewer.reviewer)?.gradedPrs || [];
    const savedGrades = new Map(
      savedPrs.map(pr => [getPRNumbers(pr.prNumbers).join('+'), toDisplayGrade(pr.grade)]),
    );
    const seen = new Set(reviewer.gradedPrs.flatMap(pr => getPRNumbers(pr.prNumbers)));
    const additions = savedPrs
      .filter(pr => {
        const numbers = getPRNumbers(pr.prNumbers);
        if (numbers.some(number => seen.has(number))) return false;
        numbers.forEach(number => seen.add(number));
        return true;
      })
      .map(pr => ({
        ...pr,
        id: String(pr._id || pr.id || pr.prNumbers),
        grade: toDisplayGrade(pr.grade),
      }));
    const gradedPrs = [
      ...reviewer.gradedPrs.map(pr => ({
        ...pr,
        grade: savedGrades.get(getPRNumbers(pr.prNumbers).join('+')) || pr.grade,
      })),
      ...additions,
    ];
    return { ...reviewer, gradedPrs, prsReviewed: gradedPrs.length };
  });
};
