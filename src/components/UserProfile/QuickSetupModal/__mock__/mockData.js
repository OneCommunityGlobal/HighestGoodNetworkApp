export const mockUserProfile = {
    id: 1,
    name: 'Ziyu Chu',
    email: 'ziyuchu@example.com',
    role: 'Admin'
};

export const mockTeamsData = {
    allTeams: [
      { teamId: 1, teamName: '2021 Test new' },
      { teamId: 2, teamName: 'Development Team' },
    ]
};

export const mockTitles = [
    { _id: 1, name: 'Title1', permissions: ['edit'] },
    { _id: 2, name: 'Title2', permissions: ['assign'] },
    { _id: 3, name: 'Title3', permissions: ['edit', 'assign'] }
];
  
export const mockUserPermissions = {
    canEditTitle: true,
    canAddTitle: true,
    canAssignTitle: true
};  