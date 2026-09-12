const INITIAL_MOCK_LOGS = [
  {
    id: 1,
    studentName: 'John Doe',
    studentRole: 'Grade A',
    teacher: 'Mr. Smith',
    course: 'Course A',
    logContent: 'Completed chapter 3 exercises on geometric proofs.',
    notesToTeacher: 'I found the last proof very challenging.',
    teacherFeedback: {
      teacherName: 'Mr. Smith',
      feedback: 'Great work! Well done. Focus on the deductive reasoning steps.',
    },
    assistedBy: null, // Initial state: Log created by student
    comments: [
      {
        id: 101,
        author: 'Mr. Smith',
        role: 'Educator',
        text: 'Please review the feedback before starting chapter 4.',
      },
      {
        id: 102,
        author: 'John Doe',
        role: 'Student',
        text: 'Will do, thank you for the clarity on deductive reasoning.',
      },
    ],
  },
  {
    id: 2,
    studentName: 'Jane Doe',
    studentRole: 'Grade B',
    teacher: 'Ms. Johnson',
    course: 'General Log',
    logContent: 'Had difficulty logging into the learning platform today. Submitted a ticket.',
    notesToTeacher: 'N/A',
    teacherFeedback: null,
    assistedBy: { name: 'Sarah Connor', role: 'Support' }, // Log created by support on behalf of student
    comments: [
      {
        id: 201,
        author: 'Jane Doe',
        role: 'Student',
        text: 'Thanks Sarah for helping me report this.',
      },
      { id: 202, author: 'Ms. Johnson', role: 'Educator', text: "Issue noted. I've contacted IT." },
    ],
  },
];

const MOCK_USERS = {
  educator: { name: 'Mr. Smith', role: 'Educator' },
  student: { name: 'John Doe', role: 'Student' },
  support: { name: 'Sarah Connor', role: 'Support' },
};

export { INITIAL_MOCK_LOGS, MOCK_USERS };
