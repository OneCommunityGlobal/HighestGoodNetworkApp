import { getTeamReportData } from '../selectors';

describe('getTeamReportData', () => {
    it('should return the team data from state', () => {
        const mockState = {
            team: {
                name: 'Team A',
                members: ['A', 'B'],
            },
        };

        const expectedOutput = {
            team: {
                name: 'Team A',
                members: ['A', 'B'],
            },
        };

        expect(getTeamReportData(mockState)).toEqual(expectedOutput);
    });

    it('should return an empty object if team data is not present in state', () => {
        const mockState = {};

        const expectedOutput = {
            team: undefined,
        };

        expect(getTeamReportData(mockState)).toEqual(expectedOutput);
    });
});