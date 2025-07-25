import '@testing-library/jest-dom/extend-expect';
// eslint-disable-next-line no-unused-vars
import React from 'react';
import { createMemoryHistory } from 'history';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { shallow } from 'enzyme';
// eslint-disable-next-line no-unused-vars
import { renderWithProvider, renderWithRouterMatch } from '../../../__tests__/utils';
import { clearErrors } from '../../../actions/errorsActions';
import { forcePasswordUpdate as fPU } from '../../../actions/updatePassword';
import { ForcePasswordUpdate } from '../ForcePasswordUpdate';
import routes from '../../../routes';
import { ENDPOINTS } from '../../../utils/URL';
import mockState from '../../../__tests__/mockAdminState';

const mockStore = configureStore([]);
const initialState = {
  theme: { darkMode: false },
};
const store = mockStore(initialState);

describe('Force Password Update page structure', () => {
  let mountedFPUpdate;
  let props;
  beforeEach(() => {
    props = {
      auth: { isAuthenticated: true },
      errors: {},
      clearErrors,
      forcePasswordUpdate: ForcePasswordUpdate,
    };
    mountedFPUpdate = shallow(
      <ForcePasswordUpdate
        auth={props.auth}
        errors={props.errors}
        clearErrors={props.clearErrors}
        forcePasswordUpdate={props.forcePasswordUpdate}
      />,
    );
  });

  it('should be rendered with two input fields', () => {
    const inputs = mountedFPUpdate.find('Input');
    expect(inputs.length).toBe(2);
  });

  it('should be rendered with one button', () => {
    const button = mountedFPUpdate.find('button');
    expect(button.length).toBe(1);
  });

  it('should be rendered with one h2 labeled Change Password', () => {
    const h2 = mountedFPUpdate.find('h2');
    expect(h2.length).toEqual(1);
    expect(h2.first().text()).toContain('Change Password');
  });
});

describe('When user tries to input data', () => {
  let mountedFPUpdate;
  let props;
  let mockfPU;

  beforeEach(() => {
    mockfPU = jest.fn();
    props = {
      match: { params: { userId: '5edf141c78f1380017b829a6' } },
      auth: { isAuthenticated: true },
      errors: {},
      clearErrors,
      forcePasswordUpdate: mockfPU,
    };
    mountedFPUpdate = shallow(
      <ForcePasswordUpdate
        match={props.match}
        auth={props.auth}
        errors={props.errors}
        clearErrors={props.clearErrors}
        forcePasswordUpdate={props.forcePasswordUpdate}
      />,
    );
  });

  it('should call handleInput when input is changed', () => {
    const spy = jest.spyOn(mountedFPUpdate.instance(), 'handleInput');
    mountedFPUpdate
      .find("[name='newpassword']")
      .simulate('change', { currentTarget: { name: 'newpassword', value: 'abc' } });
    expect(spy).toHaveBeenCalled();
  });

  it('should correctly update the new password value in the state', () => {
    const expected = 'newpassword';
    const Input = { name: 'newpassword', value: expected };
    const mockEvent = { currentTarget: Input };
    mountedFPUpdate.instance().handleInput(mockEvent);

    expect(mountedFPUpdate.instance().state.data.newpassword).toEqual(expected);
  });

  it('should correctly update the confirm password value in the state', () => {
    const expected = 'newpassword';
    const Input = { name: 'confirmnewpassword', value: expected };
    const mockEvent = { currentTarget: Input };
    mountedFPUpdate.instance().handleInput(mockEvent);

    expect(mountedFPUpdate.instance().state.data.confirmnewpassword).toEqual(expected);
  });

  it('should have disabled submit button if form is invalid', () => {
    const button = mountedFPUpdate.find('button');
    expect(button.props()).toHaveProperty('disabled');
  });

  it('onSubmit forcePasswordUpdate method is called with credentials', async () => {
    await mountedFPUpdate.instance().doSubmit();
    expect(mockfPU).toHaveBeenCalledWith({
      userId: '5edf141c78f1380017b829a6',
      newpassword: '',
    });
  });
});

const url = ENDPOINTS.FORCE_PASSWORD;
const userProjectsUrl = ENDPOINTS.USER_PROJECTS(mockState.auth.user.userid);
let passwordUpdated = false;
// When user is sent to forced Password Update they are not
// authenticated yet and will be sent to login afterwards
mockState.auth.isAuthenticated = false;

// eslint-disable-next-line no-promise-executor-return, no-unused-vars
function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const server = setupServer(
  // request for a forced password update.
  rest.patch(url, (req, res, ctx) => {
    passwordUpdated = true;
    if (req.body.newpassword === 'newPassword8') {
      return res(ctx.status(200));
    }
    return res(ctx.status(400), ctx.json({ error: 'Invalid password format' }));
  }),
  // prevents errors when loading header
  rest.get('http*/api/userprofile/*', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}));
  }),
  rest.get('http://*/hash.txt', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}));
  }),
  // Leaderboard Data in case user gets to dashboard.
  rest.get('http://localhost:4500/api/dashboard/*', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          personId: '5edf141c78f1380017b829a6',
          name: 'Dev Admin',
          weeklycommittedHours: 10,
          totaltime_hrs: 6,
          totaltangibletime_hrs: 6,
          totalintangibletime_hrs: 0,
          percentagespentintangible: 100,
          didMeetWeeklyCommitment: false,
          weeklycommitted: 10,
          tangibletime: 6,
          intangibletime: 0,
          tangibletimewidth: 100,
          intangibletimewidth: 0,
          tangiblebarcolor: 'orange',
          totaltime: 6,
        },
      ]),
    );
  }),
  rest.get(userProjectsUrl, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          isActive: true,
          _id: '5ad91ec3590b19002acfcd26',
          projectName: 'HG Fake Project',
        },
      ]),
    );
  }),
  // Any other requests error out
  // eslint-disable-next-line no-unused-vars
  rest.get('*', (req, res, ctx) => {
    throw new Error(
      `\n    Please add request handler for ${req.url.toString()} in your MSW server requests.\n    `,
    );
    // return res(ctx.status(500), ctx.json({ error: 'You must add request handler.' }));
  }),
);

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

describe('Force Password Update behaviour', () => {
  // eslint-disable-next-line no-unused-vars
  let fPUMountedPage;
  let rt;
  let hist;
  beforeEach(() => {
    rt = '/forcePasswordUpdate/5edf141c78f1380017b829a6';
    hist = createMemoryHistory({ initialEntries: [rt] });
    fPUMountedPage = renderWithRouterMatch(routes, {
      initialState: mockState,
      route: rt,
      history: hist,
    });
  });

  it('should pop up an error if password doesnt meet requirements', async () => {
    const reqError =
      '"New Password" should be at least 8 characters long and must include at least one uppercase letter, one lowercase letter, and one number or special character';
    // No number or special char
    fireEvent.change(screen.getByLabelText('New Password:'), {
      target: { value: 'newPassword' },
    });

    await waitFor(() => {
      expect(passwordUpdated).toBeFalsy();
      expect(screen.getByText(reqError)).toBeTruthy();
    });

    // No capatalized char
    fireEvent.change(screen.getByLabelText('New Password:'), {
      target: { value: 'newpassword8' },
    });

    await waitFor(() => {
      expect(passwordUpdated).toBeFalsy();
      expect(screen.getByText(reqError)).toBeTruthy();
    });

    // Not long enough
    fireEvent.change(screen.getByLabelText('New Password:'), {
      target: { value: 'word8' },
    });

    await waitFor(() => {
      expect(passwordUpdated).toBeFalsy();
      expect(screen.getByText(reqError)).toBeTruthy();
    });
  });

  it('should pop up an error if passwords dont match', async () => {
    fireEvent.change(screen.getByLabelText('New Password:'), {
      target: { value: 'newPassword8' },
    });

    fireEvent.change(screen.getByLabelText('Confirm Password:'), {
      target: { value: 'Password8' },
    });

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(passwordUpdated).toBeFalsy();
      expect(screen.getByText('"Confirm Password" must match new password')).toBeTruthy();
    });
  });
  it('should update password after submit is clicked', async () => {
    fireEvent.change(screen.getByLabelText('New Password:'), {
      target: { value: 'newPassword8' },
    });

    fireEvent.change(screen.getByLabelText('Confirm Password:'), {
      target: { value: 'newPassword8' },
    });

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(passwordUpdated).toBeTruthy();
    });

    // Wait for the toast message to appear
    const toastMessage = await screen.findByText(
      'You will now be directed to the login page where you can login with your new password.',
    );
    expect(toastMessage).toBeInTheDocument();
  });
});

describe('Force Password Update page structure', () => {
  it('should match the snapshot', () => {
    const props = {
      match: { params: { userId: '5edf141c78f1380017b829a6' } },
      auth: { isAuthenticated: true },
      errors: {},
      clearErrors,
      forcePasswordUpdate: fPU,
    };
    const { asFragment } = render(
      <Provider store={store}>
        <ForcePasswordUpdate
          match={props.match}
          auth={props.auth}
          errors={props.errors}
          clearErrors={props.clearErrors}
          forcePasswordUpdate={props.forcePasswordUpdate}
        />
      </Provider>,
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
