const fs = require('fs');

const files = [
  'src/components/Announcements/SocialMediaComposer.module.css',
  'src/components/ApplicationAnalytics/jobAnalytics.module.css',
  'src/components/BMDashboard/AddMaterial/AddMaterial.module.css',
  'src/components/BMDashboard/Equipment/Update/UpdateEquipment.module.css',
  'src/components/BMDashboard/Issues/issueChart.module.css',
  'src/components/BMDashboard/Issues/issueCharts.module.css',
  'src/components/BMDashboard/ItemList/ItemListView.module.css',
  'src/components/BMDashboard/Lesson/LessonForm.module.css',
  'src/components/BMDashboard/LessonList/LessonCard.module.css',
  'src/components/BMDashboard/Projects/ProjectDetails/ProjectDetails.module.css',
  'src/components/BMDashboard/UtilizationChart/UtilizationChart.module.css',
  'src/components/BMDashboard/WeeklyProjectSummary/GroupedBarGraphInjurySeverity/InjuryCategoryBarChart.module.css',
  'src/components/BMDashboard/WeeklyProjectSummary/IssueBreakdownChart.module.css',
  'src/components/Collaboration/Collaboration.module.css',
  'src/components/CommunityPortal/Activities/ActivityAttendance.module.css',
  'src/components/CommunityPortal/Activities/activityId/ActivityComments.module.css',
  'src/components/EductionPortal/EvaluationResults/EvaluationResults.module.css',
  'src/components/EductionPortal/EvaluationResults/OverallPerformance.module.css',
  'src/components/EductionPortal/EvaluationResults/TeacherFeedback.module.css',
  'src/components/EductionPortal/StudentTasks/StudentTasks.module.css',
  'src/components/EductionPortal/StudentTasks/TaskDetails.module.css',
  'src/components/ExperienceDonutChart/ExperienceDonutChart.module.css',
  'src/components/Header/Header.module.css',
  'src/components/HGNForm/TopCommunityMembers/TopCommunityMembers.module.css',
  'src/components/HGNPRDashboard/ReviewersStackedBarChart/ReviewersStackedBarChart.module.css',
  'src/components/HGNSkillsDashboard/SkillsProfilePage/styles/ProfileDetails.module.css',
  'src/components/LandingPage/HelpModal.module.css',
  'src/components/LBDashboard/SentimentBreakdownDonutChart/SentimentBreakdownDonutChart.module.css',
  'src/components/MaterialSummary/MaterialSummary.module.css',
  'src/components/Projects/projects.module.css',
];

function resolveKeepHead(content) {
  const lines = content.split('\n');
  const result = [];
  let state = 'normal';
  for (const line of lines) {
    if (line.startsWith('<<<<<<< ')) {
      state = 'head';
    } else if (line === '=======' && state === 'head') {
      state = 'other';
    } else if (line.startsWith('>>>>>>> ') && state === 'other') {
      state = 'normal';
    } else if (state !== 'other') {
      result.push(line);
    }
  }
  return result.join('\n');
}

let count = 0;
for (const f of files) {
  if (!fs.existsSync(f)) {
    console.log('NOT FOUND: ' + f);
    continue;
  }
  const content = fs.readFileSync(f, 'utf8');
  if (!content.includes('<<<<<<<')) {
    console.log('No conflict: ' + f);
    continue;
  }
  const resolved = resolveKeepHead(content);
  fs.writeFileSync(f, resolved, 'utf8');
  console.log('Fixed: ' + f);
  count++;
}
console.log('Total: ' + count);
