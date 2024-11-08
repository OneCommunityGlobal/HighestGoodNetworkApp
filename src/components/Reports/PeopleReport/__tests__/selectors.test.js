import { getPeopleReportData, peopleTasksPieChartViewData } from '../selectors';

describe('peopleTasksPieChartViewData', () => {
    it('should return the correct pie chart data', () => {
        const state = {
            userTask: [
                { _id: '1', hoursLogged: 5, taskName: 'Task 1', projectId: '1' },
                { _id: '2', hoursLogged: 3, taskName: 'Task 2', projectId: '2' },
                { _id: '3', hoursLogged: 2, taskName: 'Task 3', projectId: '1' },
                { _id: '4', hoursLogged: 1, taskName: 'Task 4', projectId: '3' },
                { _id: '5', hoursLogged: 0.5, taskName: 'Task 5', projectId: '3' },
            ],
            allProjects: {
                projects: [
                    { _id: '1', projectName: 'Project 1' },
                    { _id: '2', projectName: 'Project 2' },
                    { _id: '3', projectName: 'Project 3' },
                ],
            },
        };

        const expectedData = {
            tasksWithLoggedHoursById: {
                '1': 5,
                '2': 3,
                '3': 2,
                '4': 1,
                '5': 0.5,
            },
            projectsWithLoggedHoursById: {
                '1': 7,
                '2': 3,
                '3': 1.5,
            },
            tasksLegend: {
                '1': ['Task 1', 5],
                '2': ['Task 2', 3],
                '3': ['Task 3', 2],
                '4': ['Task 4', 1],
                '5': ['Task 5', 0.5],
            },
            projectsWithLoggedHoursLegend: {
                '1': ['Project 1', 7],
                '2': ['Project 2', 3],
                '3': ['Project 3', 1.5],
            },
            showTasksPieChart: true,
            showProjectsPieChart: true,
            displayedTasksWithLoggedHoursById: {
                '1': 5,
                '2': 3,
                '3': 2,
                '4': 1,
                '5': 0.5,
            },
            displayedTasksLegend: {
                '1': ['Task 1', 5],
                '2': ['Task 2', 3],
                '3': ['Task 3', 2],
                '4': ['Task 4', 1],
                '5': ['Task 5', 0.5],
            },
            showViewAllTasksButton: false,
        };

        expect(peopleTasksPieChartViewData(state)).toEqual(expectedData);
    });

    it('should handle edge case where number of tasks is exactly 5', () => {
        const state = {
            userTask: [
                { _id: '1', hoursLogged: 5, taskName: 'Task 1', projectId: '1' },
                { _id: '2', hoursLogged: 3, taskName: 'Task 2', projectId: '2' },
                { _id: '3', hoursLogged: 2, taskName: 'Task 3', projectId: '1' },
                { _id: '4', hoursLogged: 1, taskName: 'Task 4', projectId: '3' },
                { _id: '5', hoursLogged: 0.5, taskName: 'Task 5', projectId: '3' },
            ],
            allProjects: {
                projects: [
                    { _id: '1', projectName: 'Project 1' },
                    { _id: '2', projectName: 'Project 2' },
                    { _id: '3', projectName: 'Project 3' },
                ],
            },
        };

        const expectedData = {
            tasksWithLoggedHoursById: {
                '1': 5,
                '2': 3,
                '3': 2,
                '4': 1,
                '5': 0.5,
            },
            projectsWithLoggedHoursById: {
                '1': 7,
                '2': 3,
                '3': 1.5,
            },
            tasksLegend: {
                '1': ['Task 1', 5],
                '2': ['Task 2', 3],
                '3': ['Task 3', 2],
                '4': ['Task 4', 1],
                '5': ['Task 5', 0.5],
            },
            projectsWithLoggedHoursLegend: {
                '1': ['Project 1', 7],
                '2': ['Project 2', 3],
                '3': ['Project 3', 1.5],
            },
            showTasksPieChart: true,
            showProjectsPieChart: true,
            displayedTasksWithLoggedHoursById: {
                '1': 5,
                '2': 3,
                '3': 2,
                '4': 1,
                '5': 0.5,
            },
            displayedTasksLegend: {
                '1': ['Task 1', 5],
                '2': ['Task 2', 3],
                '3': ['Task 3', 2],
                '4': ['Task 4', 1],
                '5': ['Task 5', 0.5],
            },
            showViewAllTasksButton: false,
        };

        expect(peopleTasksPieChartViewData(state)).toEqual(expectedData);
    });

    it('should handle case where number of tasks is greater than 5', () => {
        const state = {
            userTask: [
                { _id: '1', hoursLogged: 5, taskName: 'Task 1', projectId: '1' },
                { _id: '2', hoursLogged: 3, taskName: 'Task 2', projectId: '2' },
                { _id: '3', hoursLogged: 2, taskName: 'Task 3', projectId: '1' },
                { _id: '4', hoursLogged: 1, taskName: 'Task 4', projectId: '3' },
                { _id: '5', hoursLogged: 0.5, taskName: 'Task 5', projectId: '3' },
                { _id: '6', hoursLogged: 0.25, taskName: 'Task 6', projectId: '3' },
            ],
            allProjects: {
                projects: [
                    { _id: '1', projectName: 'Project 1' },
                    { _id: '2', projectName: 'Project 2' },
                    { _id: '3', projectName: 'Project 3' },
                ],
            },
        };

        const expectedData = {
            tasksWithLoggedHoursById: {
                '1': 5,
                '2': 3,
                '3': 2,
                '4': 1,
                '5': 0.5,
                '6': 0.25,
            },
            projectsWithLoggedHoursById: {
                '1': 7,
                '2': 3,
                '3': 1.75,
            },
            tasksLegend: {
                '1': ['Task 1', 5],
                '2': ['Task 2', 3],
                '3': ['Task 3', 2],
                '4': ['Task 4', 1],
                '5': ['Task 5', 0.5],
                '6': ['Task 6', 0.25],
            },
            projectsWithLoggedHoursLegend: {
                '1': ['Project 1', 7],
                '2': ['Project 2', 3],
                '3': ['Project 3', 1.75],
            },
            showTasksPieChart: true,
            showProjectsPieChart: true,
            displayedTasksWithLoggedHoursById: {
                '1': 5,
                '2': 3,
                '3': 2,
                '4': 1,
                'otherTasksTotalHours': 0.75,
            },
            displayedTasksLegend: {
                '1': ['Task 1', 5],
                '2': ['Task 2', 3],
                '3': ['Task 3', 2],
                '4': ['Task 4', 1],
                'otherTasksTotalHours': ['2 other tasks', 0.75],
            },
            showViewAllTasksButton: true,
        };

        expect(peopleTasksPieChartViewData(state)).toEqual(expectedData);
    });
});

describe('getPeopleReportData', () => {
    it('should return the correct data from state', () => {
        const state = {
            auth: { isAuthenticated: true },
            userProfile: { name: 'John Doe', tangibleHoursReportedThisWeek: '10.5', infringements: [] },
            userTask: [{ id: 1, name: 'Task 1' }],
            user: { id: 1, name: 'John Doe' },
            timeEntries: [{ id: 1, hours: 5 }],
            userProjects: [{ id: 1, name: 'Project 1' }],
            allProjects: { projects: [{ id: 1, name: 'Project 1' }] },
            isAssigned: true,
            isActive: true,
            priority: 'High',
            status: 'Active',
            hasFilter: true,
            allClassification: ['Class 1', 'Class 2'],
            classification: 'Class 1',
            users: [{ id: 1, name: 'John Doe' }],
            classificationList: ['Class 1', 'Class 2'],
            priorityList: ['High', 'Medium', 'Low'],
            statusList: ['Active', 'Inactive'],
            theme: { darkMode: true },
        };

        const expectedData = {
            auth: state.auth,
            userProfile: state.userProfile,
            userTask: state.userTask,
            infringements: state.userProfile.infringements,
            user: state.user,
            timeEntries: state.timeEntries,
            userProjects: state.userProjects,
            allProjects: state.allProjects,
            allTeams: state,
            isAssigned: state.isAssigned,
            isActive: state.isActive,
            priority: state.priority,
            status: state.status,
            hasFilter: state.hasFilter,
            allClassification: state.allClassification,
            classification: state.classification,
            users: state.users,
            classificationList: state.classificationList,
            priorityList: state.priorityList,
            statusList: state.statusList,
            tangibleHoursReportedThisWeek: parseFloat(state.userProfile.tangibleHoursReportedThisWeek),
            darkMode: state.theme.darkMode,
        };

        expect(getPeopleReportData(state)).toEqual(expectedData);
    });
});