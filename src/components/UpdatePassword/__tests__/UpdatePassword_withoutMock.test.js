import { Route } from 'react-router-dom';
import { toast } from 'react-toastify';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import UpdatePassword from '../UpdatePassword';
import { renderWithRouterMatch } from '../../../__tests__/utils';
import { ENDPOINTS } from '../../../utils/URL';

const userID = '5f31dcb9a1a909eadee0eecb';
const url = ENDPOINTS.UPDATE_PASSWORD(userID);
const errorMessages = {
  curentpasswordEmpty: '"Current Password" is not allowed to be empty',
  newpasswordEmpty: '"New Password" is not allowed to be empty',
  newpasswordInvalid:
    '"New Password" should be at least 8 characters long and must include at least one uppercase letter, one lowercase letter, and one number or special character',
  oldnewPasswordsSame: '"New Password" should not be same as old password',
  confirmpasswordMismatch: '"Confirm Password" must match new password',
  errorNon400Response: 'Something went wrong. Please contact your administrator.',
  error400Respnse: 'This is a test 400 error message',
};

const successMessages = {
  updatePasswordSuccessful:
    'Your password has been updated. You will be logged out and directed to login page where you can login with your new password.',
};

const correctPassword = 'ABCdef@123';
const non400Password = 'non400Password!';

// Set up MSW server to intercept network requests
const server = setupServer(
  // Handle password update requests
  rest.patch(url, (req, res, ctx) => {
    if (req.body.newpassword === correctPassword) {
      return res(ctx.status(200));
    }
    if (req.body.newpassword === non400Password) {
      return res(ctx.status(433));
    }
    return res(ctx.status(400), ctx.json({ error: errorMessages.error400Respnse }));
  }),
  rest.get('*', (req, res, ctx) => {
    console.error(
      `Please add request handler for ${req.url.toString()} in your MSW server requests.`,
    );
    return res(ctx.status(500), ctx.json({ error: 'You must add request handler.' }));
  }),
);
beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});

beforeEach(() => {
  jest.clearAllMocks();

  axios.patch.mockImplementation((_, data) => {
    if (data.newpassword === correctPassword) {
      return Promise.resolve({ status: 200 });
    }
    if (data.newpassword === non400Password) {
      return Promise.resolve({ status: 433 });
    }
    // For 400 errors, return a rejected promise with appropriate structure
    const error = new Error('Bad Request');
    error.response = {
      status: 400,
      data: { error: errorMessages.error400Respnse },
    };
    return Promise.reject(error);
  });
});

describe("<UpdatePassword/>' behavior", () => {
  beforeEach(() => {
    toast.success = jest.fn();
    toast.error = jest.fn();
    renderWithRouterMatch(
      <Route path="/updatepassword/:userId">{props => <UpdatePassword {...props} />}</Route>,
      {
        route: `/updatepassword/${userID}`,
        initialState: {
          theme: { darkMode: false },
          errors: {},
        },
      },
    );
  });

  it('should show error if api returned error', async () => {
    const newpassword = 'someRandom1!';
    const confirmnewpassword = newpassword;
    const currentpassword = 'currentPassword1';
    await userEvent.type(screen.getByLabelText(/current password/i), currentpassword, {
      allAtOnce: false,
    });
    await userEvent.type(screen.getByLabelText(/new password/i), newpassword, {
      allAtOnce: false,
    });
    await userEvent.type(screen.getByLabelText(/confirm password/i), confirmnewpassword, {
      allAtOnce: false,
    });

    userEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(
      () => {
        const errorElement = screen.queryByText(content => {
          return (
            content.includes(errorMessages.error400Respnse) || content.includes('test 400 error')
          );
        });
        expect(errorElement).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('should show a toastor error if API response was other than 200 and 400', async () => {
    const newpassword = non400Password;
    const confirmnewpassword = newpassword;
    const currentpassword = 'currentPassword1';
    await userEvent.type(screen.getByLabelText(/current password/i), currentpassword, {
      allAtOnce: false,
    });
    await userEvent.type(screen.getByLabelText(/new password/i), newpassword, {
      allAtOnce: false,
    });
    await userEvent.type(screen.getByLabelText(/confirm password/i), confirmnewpassword, {
      allAtOnce: false,
    });

    userEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(
      () => {
        expect(toast.error).toHaveBeenCalledWith(errorMessages.errorNon400Response);
      },
      { timeout: 3000 },
    );
  });

  it('should show call toastr success with correct message and onClose param on success', async () => {
    const newpassword = correctPassword;
    const confirmnewpassword = newpassword;
    const currentpassword = 'currentPassword1';
    await userEvent.type(screen.getByLabelText(/current password/i), currentpassword, {
      allAtOnce: false,
    });
    await userEvent.type(screen.getByLabelText(/new password/i), newpassword, {
      allAtOnce: false,
    });
    await userEvent.type(screen.getByLabelText(/confirm password/i), confirmnewpassword, {
      allAtOnce: false,
    });
    userEvent.click(screen.getByRole('button', { name: /submit/i }));

    const message = successMessages.updatePasswordSuccessful;
    const options = { onClose: expect.any(Function) };
    const successParams = [message, options];

    await waitFor(
      () => {
        expect(toast.success).toHaveBeenCalledWith(...successParams);
      },
      { timeout: 3000 },
    );
  });
});
