import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { getUserProfile } from '../actions/userProfile';
import configureStore from '../store';
import { ENDPOINTS } from '../utils/URL';

const { store } = configureStore();
const url = ENDPOINTS.USER_PROFILE(':userId');

const userProfileMockData = {
  privacySettings: { email: true, phoneNumber: true, blueSquares: true },
  isActive: true,
  phoneNumber: [''],
  jobTitle: [''],
  weeklyComittedHours: 0,
  teams: [],
  projects: [{ _id: '1', projectName: 'name' }],
  _id: '1234',
  role: 'Administrator',
  firstName: 'John',
  lastName: 'Doe',
  email: '',
  infringments: [{ _id: '1', date: '2020-01-01', description: 'a' }],
  adminLinks: [{ Name: 'admin', Link: 'https://www.google.com/' }],
  personalLinks: [{ Name: 'personal', Link: 'https://www.google.com/' }],
  profilePic: '',
};

const server = setupServer(
  rest.get(url, (req, res, ctx) => res(ctx.json(userProfileMockData), ctx.status(200))),
  rest.get('*', (req, res, ctx) => {
    console.error(
      `Please add request handler for ${req.url.toString()} in your MSW server requests.`,
    );
    return res(ctx.status(500), ctx.json({ error: 'You must add request handler.' }));
  }),
);

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

const userProfileSlice = () => store.getState().userProfile;

describe('UserProfile Redux related actions', () => {
  describe('Fetching user profile from server', () => {
    it('should fetch privacySettings from the userProfile and put it in the store', async () => {
      await store.dispatch(getUserProfile('1234'));
      expect(userProfileSlice().privacySettings).toHaveProperty('email', true);
      expect(userProfileSlice().privacySettings).toHaveProperty('phoneNumber', true);
      expect(userProfileSlice().privacySettings).toHaveProperty('blueSquares', true);
    });

    it('should fetch general info : _id, role, phoneNumber, jobTitle, email, firstName, lastName, weeklyCommitedHours, teams and profilePic from the userProfile, and put it in the store', async () => {
      await store.dispatch(getUserProfile('1234'));
      expect(userProfileSlice()).toHaveProperty('_id', '1234');
      expect(userProfileSlice()).toHaveProperty('role', 'Administrator');
      expect(userProfileSlice()).toHaveProperty('phoneNumber', ['']);
      expect(userProfileSlice()).toHaveProperty('jobTitle', ['']);
      expect(userProfileSlice()).toHaveProperty('email', '');
      expect(userProfileSlice()).toHaveProperty('firstName', 'John');
      expect(userProfileSlice()).toHaveProperty('lastName', 'Doe');
      expect(userProfileSlice()).toHaveProperty('weeklyComittedHours', 0);
      expect(userProfileSlice()).toHaveProperty('teams', []);
      expect(userProfileSlice()).toHaveProperty('profilePic', '');
    });

    it('should fetch infringments, and put it in the store', async () => {
      await store.dispatch(getUserProfile('1234'));
      expect(userProfileSlice().infringments).toHaveProperty([0], {
        _id: '1',
        date: '2020-01-01',
        description: 'a',
      });
    });

    it('should fetch admin links, and put it in the store', async () => {
      await store.dispatch(getUserProfile('1234'));
      expect(userProfileSlice().adminLinks).toHaveProperty([0], {
        Name: 'admin',
        Link: 'https://www.google.com/',
      });
    });

    it('should fetch personal links, and put it in the store', async () => {
      await store.dispatch(getUserProfile('1234'));
      expect(userProfileSlice().personalLinks).toHaveProperty([0], {
        Name: 'personal',
        Link: 'https://www.google.com/',
      });
    });
  });
});

// describe('WeeklySummary Redux related actions', () => {
//   describe('Fetching the weekly summaries from the server', () => {
//     it('should fetch mediaUrl, weeklySummaries and weeklySummariesCount from the userProfile and put in the store', async () => {
//       await store.dispatch(getWeeklySummaries('1'));
//       expect(wSummariesSlice().summaries).toHaveProperty('mediaUrl', 'u');
//       expect(wSummariesSlice().summaries).toHaveProperty('weeklySummaries', [{ _id: '1', dueDate: '1', summary: 'a' }]);
//       expect(wSummariesSlice().summaries).toHaveProperty('weeklySummariesCount', 1);
//     });
//     describe('loading indicator', () => {
//       it('should be true while fetching', () => {
//         server.use(
//           rest.get(url, async (req, res, ctx) => {
//             expect(wSummariesSlice().loading).toBe(true);
//             return res(ctx.status(200));
//           }),
//         );

//         store.dispatch(getWeeklySummaries('1'));
//       });

//       it('should be false after the reports are fetched', async () => {
//         await store.dispatch(getWeeklySummaries('1'));

//         expect(wSummariesSlice().loading).toBe(false);
//       });

//       it('should be false if the server returns an error', async () => {
//         server.use(
//           rest.get(url, (req, res, ctx) => res(ctx.status(500))),
//         );

//         await store.dispatch(getWeeklySummaries('1'));

//         expect(wSummariesSlice().loading).toBe(false);
//       });
//     });
//   });

//   describe('Save the weekly summaries and related data to the server', () => {
//     it('should return status 200 on weekly summaries update', async () => {
//       server.use(
//         rest.put(url, (req, res, ctx) => {
//           const { userId } = req.params;
//           return res(
//             ctx.json({ _id: userId }),
//             ctx.status(200),
//           );
//         }),
//       );
//       const response = await store.dispatch(updateWeeklySummaries('1', weeklySummariesMockData));
//       expect(response).toBe(200);
//     });

//     it('should return status 404 on record is not found', async () => {
//       server.use(
//         rest.put(url, (req, res, ctx) => res(
//           ctx.status(404),
//         )),
//       );
//       const response = await store.dispatch(updateWeeklySummaries('1', weeklySummariesMockData));
//       expect(response).toBe(404);
//     });
//   });
// });
