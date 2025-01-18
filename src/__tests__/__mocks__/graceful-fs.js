jest.mock('graceful-fs', () => require.requireActual('fs'));  // Use actual fs to mock graceful-fs
