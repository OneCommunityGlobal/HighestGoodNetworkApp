import { Route } from 'react-router-dom';
import { toast } from 'react-toastify';
// eslint-disable-next-line import/named
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import UpdatePassword from '../UpdatePassword';
import { renderWithRouterMatch } from '../../../__tests__/utils';
import { ENDPOINTS } from '~/utils/URL';

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

const server = setupServer(
  rest.patch(url, (req, res, ctx) => {
    if (req.body.newpassword === correctPassword) return res(ctx.status(200));
    if (req.body.newpassword === non400Password) return res(ctx.status(433));
    return res(ctx.status(400), ctx.json({ error: errorMessages.error400Respnse }));
  }),
  rest.get('*', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ error: 'You must add request handler.' }));
  }),
);

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

beforeEach(() => {
  vi.clearAllMocks();

  axios.patch.mockImplementation((_, data) => {
    if (data.newpassword === correctPassword) return Promise.resolve({ status: 200 });
    if (data.newpassword === non400Password) return Promise.resolve({ status: 433 });

    const error = new Error('Bad Request');
    error.response = {
      status: 400,
      data: { error: errorMessages.error400Respnse },
    };
    return Promise.reject(error);
  });
});

const renderPage = () => {
  toast.success = vi.fn();
  toast.error = vi.fn();

  renderWithRouterMatch(
    <Route path="/updatepassword/:userId">
      {({ match, history, location }) => (
        <UpdatePassword match={match} history={history} location={location} />
      )}
    </Route>,
    {
      route: `/updatepassword/${userID}`,
      initialState: {
        theme: { darkMode: false },
        errors: {},
      },
    },
  );
};

const getInputs = () => {
  const currentPasswordInput = screen.getByLabelText(/current password/i);
  const newPasswordInput = screen.getByLabelText(/new password/i);
  const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
  return { currentPasswordInput, newPasswordInput, confirmPasswordInput };
};

describe("<UpdatePassword/>' behavior", () => {
  it('should show error if API returned error', async () => {
    renderPage();

    const { currentPasswordInput, newPasswordInput, confirmPasswordInput } = getInputs();

    await userEvent.type(currentPasswordInput, 'currentPassword1');
    await userEvent.type(newPasswordInput, 'someRandom1!');
    await userEvent.type(confirmPasswordInput, 'someRandom1!');

    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      const errorElement = screen.queryByText(content =>
        content.includes(errorMessages.error400Respnse),
      );
      expect(errorElement).toBeInTheDocument();
    });
  });

  it('should show a toast error if API response was not 200 or 400', async () => {
    renderPage();

    const { currentPasswordInput, newPasswordInput, confirmPasswordInput } = getInputs();

    await userEvent.type(currentPasswordInput, 'currentPassword1');
    await userEvent.type(newPasswordInput, non400Password);
    await userEvent.type(confirmPasswordInput, non400Password);

    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessages.errorNon400Response);
    });
  });

  it('should show toast success and trigger onClose logic on success', async () => {
    renderPage();

    const { currentPasswordInput, newPasswordInput, confirmPasswordInput } = getInputs();

    await userEvent.type(currentPasswordInput, 'currentPassword1');
    await userEvent.type(newPasswordInput, correctPassword);
    await userEvent.type(confirmPasswordInput, correctPassword);

    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(successMessages.updatePasswordSuccessful, {
        onClose: expect.any(Function),
      });
    });
  });
});
