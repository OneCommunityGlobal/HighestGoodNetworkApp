import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AccessManagementModal from './AccessManagementModal';
import { ENDPOINTS } from '~/utils/URL';

vi.mock('axios');
vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));

const userProfile = {
  _id: 'user1',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  role: 'Volunteer',
};

const teamFolders = [
  { key: 'HGN', name: 'Highest Good Network Team', isDefault: true },
  { key: 'ADMIN', name: 'Administration Team', isDefault: false },
];

const QUESTIONNAIRE_ON_HINT = /also activates the HGN Questionnaire link/;
const QUESTIONNAIRE_OFF_HINT = /do not activate the HGN Questionnaire/;

const mockApi = (dropbox, { onInvite } = {}) => {
  let apps = dropbox ? [{ app: 'dropbox', ...dropbox }] : [];
  axios.get.mockImplementation(url => {
    if (url === ENDPOINTS.ACCESS_MANAGEMENT) {
      return Promise.resolve({
        data: apps.length ? { found: true, data: { apps } } : { found: false },
      });
    }
    if (url === ENDPOINTS.DROPBOX_TEAM_FOLDERS) return Promise.resolve({ data: teamFolders });
    return Promise.reject(new Error(`Unexpected GET ${url}`));
  });
  axios.post.mockImplementation((url, payload) => {
    if (url === ENDPOINTS.DROPBOX_CREATE_ADD) {
      apps = [
        { app: 'dropbox', status: 'invited', invitedOn: '2026-10-30', ...onInvite?.(payload) },
      ];
      return Promise.resolve({ data: {} });
    }
    return Promise.resolve({ data: { data: [] } });
  });
};

const renderModal = () =>
  render(<AccessManagementModal isOpen onClose={vi.fn()} userProfile={userProfile} />);

const dropboxCard = () => screen.findByTestId('access-card-dropbox');

// The modal re-renders its cards after an invite, so look the card up again each time.
const currentDropboxCard = () => screen.getByTestId('access-card-dropbox');

const copyLinkButton = card =>
  within(card).queryByRole('button', { name: /copy questionnaire link/i });

describe('AccessManagementModal – HGN Questionnaire access through Dropbox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('copy questionnaire link button', () => {
    it('shows for people invited to the Highest Good Network Dropbox', async () => {
      mockApi({ status: 'invited', teamFolderKey: 'HGN', invitedOn: '2026-10-01' });
      renderModal();

      const card = await dropboxCard();
      await waitFor(() => expect(copyLinkButton(card)).toBeInTheDocument());
    });

    it('is hidden for people invited to the Administration Dropbox', async () => {
      mockApi({ status: 'invited', teamFolderKey: 'ADMIN', invitedOn: '2026-10-01' });
      renderModal();

      const card = await dropboxCard();
      await within(card).findByText('Invited');
      expect(copyLinkButton(card)).not.toBeInTheDocument();
    });

    it('shows for older invites whose team folder was not recorded', async () => {
      mockApi({ status: 'invited', invitedOn: '2026-10-01' });
      renderModal();

      const card = await dropboxCard();
      await waitFor(() => expect(copyLinkButton(card)).toBeInTheDocument());
    });

    it('is hidden when Dropbox access was revoked', async () => {
      mockApi({ status: 'revoked', teamFolderKey: 'HGN', revokedOn: '2026-10-02' });
      renderModal();

      const card = await dropboxCard();
      await within(card).findByText('Revoked');
      expect(copyLinkButton(card)).not.toBeInTheDocument();
    });

    it('is hidden before any Dropbox invite', async () => {
      mockApi(null);
      renderModal();

      const card = await dropboxCard();
      await within(card).findByText('No Access');
      expect(copyLinkButton(card)).not.toBeInTheDocument();
    });

    it('is never shown on other apps', async () => {
      mockApi(null);
      axios.get.mockImplementation(url =>
        url === ENDPOINTS.ACCESS_MANAGEMENT
          ? Promise.resolve({
              data: {
                found: true,
                data: { apps: [{ app: 'sentry', status: 'invited', teamFolderKey: 'HGN' }] },
              },
            })
          : Promise.resolve({ data: teamFolders }),
      );
      renderModal();

      await screen.findAllByText('Invited');
      expect(
        screen.queryByRole('button', { name: /copy questionnaire link/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('team folder hint', () => {
    it('explains that the default HGN folder activates the questionnaire', async () => {
      mockApi(null);
      renderModal();

      const card = await dropboxCard();
      expect(await within(card).findByText(QUESTIONNAIRE_ON_HINT)).toBeInTheDocument();
    });

    it('warns that the Administration folder does not activate the questionnaire', async () => {
      mockApi(null);
      renderModal();

      const card = await dropboxCard();
      const select = await within(card).findByRole('combobox');
      await waitFor(() => expect(select).toHaveValue('HGN'));

      fireEvent.change(select, { target: { value: 'ADMIN' } });

      expect(within(card).getByText(QUESTIONNAIRE_OFF_HINT)).toBeInTheDocument();
      expect(within(card).queryByText(QUESTIONNAIRE_ON_HINT)).not.toBeInTheDocument();
    });

    it('shows no hint until a team folder is chosen', async () => {
      mockApi(null);
      renderModal();

      const card = await dropboxCard();
      const select = await within(card).findByRole('combobox');
      await waitFor(() => expect(select).toHaveValue('HGN'));

      fireEvent.change(select, { target: { value: '' } });

      expect(within(card).queryByText(QUESTIONNAIRE_ON_HINT)).not.toBeInTheDocument();
      expect(within(card).queryByText(QUESTIONNAIRE_OFF_HINT)).not.toBeInTheDocument();
    });
  });

  describe('inviting through Dropbox', () => {
    const inviteToFolder = async folderKey => {
      const card = await dropboxCard();
      const select = await within(card).findByRole('combobox');
      await waitFor(() => expect(select).toHaveValue('HGN'));
      fireEvent.change(select, { target: { value: folderKey } });
      fireEvent.click(within(card).getByRole('button', { name: /^invite$/i }));
      await waitFor(() => expect(toast.success).toHaveBeenCalled());
    };

    it('sends the HGN folder, confirms the questionnaire is active and shows the copy link', async () => {
      mockApi(null, { onInvite: payload => ({ teamFolderKey: payload.teamFolderKey }) });
      renderModal();

      await inviteToFolder('HGN');

      expect(axios.post).toHaveBeenCalledWith(ENDPOINTS.DROPBOX_CREATE_ADD, {
        folderName: 'Jane Doe',
        teamFolderKey: 'HGN',
        targetUser: { targetUserId: 'user1', email: 'jane@example.com' },
      });
      expect(toast.info).toHaveBeenCalledWith(
        'The HGN Questionnaire link is now active for this person.',
      );
      await waitFor(() => expect(copyLinkButton(currentDropboxCard())).toBeInTheDocument());
    });

    it('does not announce or offer the questionnaire after an Administration folder invite', async () => {
      mockApi(null, { onInvite: payload => ({ teamFolderKey: payload.teamFolderKey }) });
      renderModal();

      await inviteToFolder('ADMIN');

      expect(axios.post).toHaveBeenCalledWith(
        ENDPOINTS.DROPBOX_CREATE_ADD,
        expect.objectContaining({ teamFolderKey: 'ADMIN' }),
      );
      expect(toast.info).not.toHaveBeenCalled();
      await waitFor(() => expect(within(currentDropboxCard()).getByText('Invited')).toBeVisible());
      expect(copyLinkButton(currentDropboxCard())).not.toBeInTheDocument();
    });

    it('does not announce questionnaire access when the invite fails', async () => {
      mockApi(null);
      axios.post.mockImplementation(url =>
        url === ENDPOINTS.DROPBOX_CREATE_ADD
          ? Promise.reject({ response: { data: { message: 'Dropbox error' } } })
          : Promise.resolve({ data: { data: [] } }),
      );
      renderModal();

      const card = await dropboxCard();
      const select = await within(card).findByRole('combobox');
      await waitFor(() => expect(select).toHaveValue('HGN'));
      fireEvent.click(within(card).getByRole('button', { name: /^invite$/i }));

      await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Dropbox error'));
      expect(toast.info).not.toHaveBeenCalled();
      expect(copyLinkButton(card)).not.toBeInTheDocument();
    });
  });
});
