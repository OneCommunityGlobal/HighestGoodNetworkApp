import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import UpdateEquipment from '../UpdateEquipment';
import { ENDPOINTS } from '~/utils/URL';
import styles from '../UpdateEquipment.module.css';
import { updateEquipment } from '~/actions/bmdashboard/equipmentActions';

vi.mock('axios', () => ({ default: { get: vi.fn(), put: vi.fn() } }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('~/components/BMDashboard/shared/CheckTypesModal', () => ({ default: () => null }));
vi.mock('~/components/common/Image/Image', () => ({ default: () => null }));
vi.mock('~/components/common/FilePreview/FilePreview', () => ({
  default: ({ darkMode, file, index, onRemove }) => (
    <div>
      <span data-testid="local-preview" data-dark-mode={String(darkMode)}>
        Local preview
      </span>
      <span>{file.name}</span>
      <button type="button" onClick={() => onRemove(index)}>
        Remove image
      </button>
    </div>
  ),
}));
vi.mock('~/components/common/DragAndDrop/DragAndDrop', () => ({
  default: ({ updateUploadedFiles }) => (
    <>
      <input
        type="file"
        name="file-upload-input"
        aria-label="Choose test image"
        onChange={event => updateUploadedFiles(Array.from(event.target.files))}
      />
      <button type="button" onClick={() => updateUploadedFiles(selectedImages)}>
        Preview image
      </button>
    </>
  ),
}));
let selectedImages;
const id = '0123456789abcdef01234567';
const otherId = 'abcdef0123456789abcdef01';
const record = {
  _id: id,
  __t: 'equipment_item',
  itemType: { name: 'Excavator', category: 'Broad category' },
  equipmentClass: 'Heavy equipment',
  purchaseStatus: 'Purchased',
  condition: 'New',
  updateRecord: [{ condition: 'Good' }],
};
const storeFactory = configureMockStore([thunk]);
function setup({ darkMode = false, routeId = id } = {}) {
  const history = createMemoryHistory({ initialEntries: [`/bmdashboard/tools/${routeId}/update`] });
  const store = storeFactory({
    theme: { darkMode },
    auth: { user: { userid: 'user-123' } },
    bmEquipments: { singleEquipment: { ...record, itemType: { name: 'Stale Redux record' } } },
  });
  const view = render(
    <Provider store={store}>
      <Router history={history}>
        <Route path="/bmdashboard/tools/:equipmentId/update">
          <UpdateEquipment />
        </Route>
      </Router>
    </Provider>,
  );
  return { ...view, history, store };
}
async function loaded() {
  await screen.findByText('Heavy equipment');
}
function fill({ confirm = true } = {}) {
  fireEvent.change(screen.getByLabelText('Status/Condition Now *'), { target: { value: 'Good' } });
  fireEvent.change(screen.getByLabelText('Who used the equipment last time? *'), {
    target: { value: 'other' },
  });
  fireEvent.change(screen.getByLabelText('Name of the last equipment user (required)'), {
    target: { value: 'Alex' },
  });
  fireEvent.change(screen.getByLabelText('What was it used for last time? *'), {
    target: { value: 'other' },
  });
  fireEvent.change(screen.getByLabelText('Last equipment usage (required)'), {
    target: { value: 'Site preparation' },
  });
  if (confirm) fireEvent.click(screen.getByRole('checkbox'));
}
function submit() {
  fireEvent.submit(screen.getByRole('form', { name: 'Equipment status update' }));
}
function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
beforeEach(() => {
  vi.clearAllMocks();
  selectedImages = [new File(['x'], 'photo.png', { type: 'image/png' })];
  axios.get.mockResolvedValue({ data: record });
  axios.put.mockResolvedValue({ data: record });
  URL.createObjectURL = vi.fn(() => 'blob:preview');
  URL.revokeObjectURL = vi.fn();
});

describe('Equipment status form', () => {
  it('keeps invalid-image feedback when the native file-input change bubbles to the form', async () => {
    setup();
    await loaded();
    const image = new File(['bad'], 'wrong.gif', { type: 'image/gif' });
    fireEvent.change(screen.getByLabelText('Choose test image'), { target: { files: [image] } });
    expect(screen.getByText('Invalid image. Use PNG, JPG, or JPEG under 5MB.')).toBeInTheDocument();
    expect(screen.queryByTestId('local-preview')).not.toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.put).not.toHaveBeenCalled();
  });

  it('sends one image as multipart with notes, confirmation gating, and preserved lifecycle options', async () => {
    setup();
    await loaded();
    fill({ confirm: false });
    fireEvent.click(screen.getByRole('button', { name: 'Preview image' }));
    submit();
    expect(axios.put).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(
      within(screen.getByRole('radiogroup', { name: /Require a replacement/ })).getByLabelText(
        'No',
      ),
    );
    fireEvent.click(
      within(screen.getByRole('radiogroup', { name: /send a note/ })).getByLabelText('Yes'),
    );
    fireEvent.change(screen.getByLabelText('Update note *'), {
      target: { value: 'Image attached' },
    });
    submit();
    await screen.findByText(/Image saved/);
    const [url, data, config] = axios.put.mock.calls[0];
    expect(url).toBe(ENDPOINTS.BM_EQUIPMENT_STATUS_UPDATE(id));
    expect(data).toBeInstanceOf(FormData);
    expect(data.getAll('image')).toEqual([selectedImages[0]]);
    expect(data.get('condition')).toBe('Good');
    expect(data.get('replacementRequired')).toBe('no');
    expect(data.get('sendNote')).toBe('yes');
    expect(data.get('notes')).toBe('Image attached');
    expect(data.get('lastUsedBy')).toBe('Alex');
    expect(data.get('lastUsedFor')).toBe('Site preparation');
    expect(data.has('confirmed')).toBe(false);
    expect(data.has('date')).toBe(false);
    expect(config).toBeUndefined();
    expect(screen.queryByTestId('local-preview')).not.toBeInTheDocument();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
    expect(axios.get).toHaveBeenCalledTimes(1);
  });
  it('keeps only the first valid image and revokes a replaced preview without fetching metadata', async () => {
    setup();
    await loaded();
    selectedImages = [
      new File(['x'], 'first.png', { type: 'image/png' }),
      new File(['y'], 'second.jpg', { type: 'image/jpeg' }),
    ];
    fireEvent.click(screen.getByRole('button', { name: 'Preview image' }));
    expect(screen.getAllByTestId('local-preview')).toHaveLength(1);
    expect(screen.getByText('first.png')).toBeInTheDocument();
    expect(screen.queryByText('second.jpg')).not.toBeInTheDocument();
    selectedImages = [new File(['z'], 'replacement.jpg', { type: 'image/jpeg' })];
    fireEvent.click(screen.getByRole('button', { name: 'Preview image' }));
    expect(screen.queryByText('first.png')).not.toBeInTheDocument();
    expect(screen.getByText('replacement.jpg')).toBeInTheDocument();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
    expect(axios.get).toHaveBeenCalledTimes(1);
    fill();
    submit();
    await screen.findByText(/Image saved/);
    expect(axios.put.mock.calls[0][1].getAll('image')).toEqual([selectedImages[0]]);
  });
  it.each([
    ['image/gif', 'animated.gif', 1],
    ['image/webp', 'photo.webp', 1],
    ['text/plain', 'fake.png', 1],
    ['image/png', 'large.png', 5 * 1024 * 1024 + 1],
  ])('rejects unsupported or oversized selection (%s, %s)', async (type, name, size) => {
    setup();
    await loaded();
    selectedImages = [new File([new Uint8Array(size)], name, { type })];
    fireEvent.click(screen.getByRole('button', { name: 'Preview image' }));
    expect(screen.getByText('Invalid image. Use PNG, JPG, or JPEG under 5MB.')).toBeInTheDocument();
    expect(screen.queryByTestId('local-preview')).not.toBeInTheDocument();
    expect(axios.put).not.toHaveBeenCalled();
  });
  it('accepts JPEG at the 5MB limit and sends it through the third action argument', async () => {
    setup();
    await loaded();
    fill();
    selectedImages = [
      new File([new Uint8Array(5 * 1024 * 1024)], 'limit.jpg', { type: 'image/jpeg' }),
    ];
    fireEvent.click(screen.getByRole('button', { name: 'Preview image' }));
    submit();
    await screen.findByText(/Image saved/);
    expect(axios.put.mock.calls[0][1].get('image')).toBe(selectedImages[0]);
  });
  it('preserves the selected image and form input on upload failure and retries with the same image', async () => {
    axios.put.mockRejectedValueOnce({
      response: { status: 500, data: { error: 'Image save failed' } },
    });
    setup();
    await loaded();
    fill();
    fireEvent.click(screen.getByRole('button', { name: 'Preview image' }));
    submit();
    await screen.findByText(/Image save failed.*not saved/);
    expect(screen.queryByText(/Image saved/)).not.toBeInTheDocument();
    expect(screen.getByTestId('local-preview')).toBeInTheDocument();
    expect(screen.getByLabelText('Name of the last equipment user (required)')).toHaveValue('Alex');
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    submit();
    await screen.findByText(/Image saved/);
    expect(axios.put.mock.calls[1][1].get('image')).toBe(selectedImages[0]);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });
  it('removes the selected image and then submits JSON without an image', async () => {
    setup();
    await loaded();
    fill();
    fireEvent.click(screen.getByRole('button', { name: 'Preview image' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove image' }));
    submit();
    await screen.findByText(/The update date was recorded by the server/);
    expect(axios.put.mock.calls[0][1]).not.toBeInstanceOf(FormData);
    expect(axios.put.mock.calls[0][1]).not.toHaveProperty('image');
    expect(axios.get).toHaveBeenCalledTimes(1);
  });
  it('revalidates the selected image at submission time', async () => {
    setup();
    await loaded();
    fill();
    fireEvent.click(screen.getByRole('button', { name: 'Preview image' }));
    Object.defineProperty(selectedImages[0], 'size', { value: 5 * 1024 * 1024 + 1 });
    submit();
    expect(screen.getByText('Invalid image. Use PNG, JPG, or JPEG under 5MB.')).toBeInTheDocument();
    expect(axios.put).not.toHaveBeenCalled();
  });
  it.each([
    [false, true, 'no', 'yes'],
    [true, false, 'yes', 'no'],
  ])(
    'serializes boolean API selections compatibly for multipart (%s, %s)',
    async (replacementRequired, sendNote, expectedReplacement, expectedNote) => {
      const store = storeFactory({ auth: { user: { userid: 'user-123' } } });
      await store.dispatch(
        updateEquipment(
          id,
          { condition: 'Good', replacementRequired, sendNote, notes: 'Note' },
          selectedImages[0],
          { publish: false, refresh: false },
        ),
      );
      const data = axios.put.mock.calls[0][1];
      expect(data.get('replacementRequired')).toBe(expectedReplacement);
      expect(data.get('sendNote')).toBe(expectedNote);
      expect(axios.get).not.toHaveBeenCalled();
      expect(store.getActions()).toEqual([]);
    },
  );
  it('preserves the default Redux publish and refresh when called with an image only', async () => {
    const store = storeFactory({ auth: { user: { userid: 'user-123' } } });
    await store.dispatch(updateEquipment(id, { condition: 'Good' }, selectedImages[0]));
    expect(axios.put.mock.calls[0][1].get('image')).toBe(selectedImages[0]);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(store.getActions().length).toBeGreaterThan(0);
  });

  it.each([
    [400, { error: 'Invalid equipment ID.' }],
    [401, { error: 'Invalid token' }],
    [500, { error: 'Failed to fetch equipment.' }],
  ])('blocks editing after GET HTTP %s', async (status, data) => {
    axios.get.mockRejectedValueOnce({ response: { status, data } });
    setup();
    await screen.findByText('Unable to retrieve equipment. Please retry.');
    expect(screen.getByLabelText('Status/Condition Now *')).toBeDisabled();
    submit();
    expect(axios.put).not.toHaveBeenCalled();
    expect(screen.queryByText(/updated successfully/)).not.toBeInTheDocument();
  });
  it.each([
    [
      400,
      { error: 'Notes are required when sendNote is yes.' },
      'Notes are required when sendNote is yes.',
    ],
    [401, { error: 'User not authenticated.' }, 'User not authenticated.'],
    [
      401,
      'Unauthorized request: Token expired or invalid payload',
      'Failed to update equipment. Please try again.',
    ],
    [404, { error: 'Equipment not found.' }, 'Equipment not found.'],
    [500, { error: 'Failed to update equipment status.' }, 'Failed to update equipment status.'],
  ])(
    'rejects PUT HTTP %s without showing success or losing input (%j)',
    async (status, data, message) => {
      axios.put.mockRejectedValueOnce({ response: { status, data } });
      setup();
      await loaded();
      fill();
      submit();
      await screen.findByText(message);
      expect(screen.queryByText(/updated successfully/)).not.toBeInTheDocument();
      expect(screen.getByLabelText('Name of the last equipment user (required)')).toHaveValue(
        'Alex',
      );
      expect(screen.getByRole('checkbox')).toBeChecked();
      expect(screen.getByRole('button', { name: 'Update Status' })).toBeEnabled();
      expect(axios.get).toHaveBeenCalledTimes(1);
    },
  );
  it.each([
    [false, 'No'],
    ['no', 'No'],
    [true, 'Yes'],
    ['yes', 'Yes'],
    ['', 'Not specified'],
    [null, 'Not recorded'],
    [undefined, 'Not recorded'],
  ])('renders historical replacement %j as %s', async (replacementRequired, expected) => {
    axios.get.mockResolvedValueOnce({
      data: {
        ...record,
        project: null,
        equipmentClass: null,
        updateRecord: [{ condition: 'Good', replacementRequired }],
      },
    });
    setup();
    expect(await screen.findByText(/Latest recorded replacement need:/)).toHaveTextContent(
      `Latest recorded replacement need: ${expected}`,
    );
    expect(screen.getByText('Not assigned')).toBeInTheDocument();
    // A previous replacement choice must not select an answer for a new update.
    const group = screen.getByRole('radiogroup', { name: /Require a replacement/ });
    expect(within(group).getByLabelText('Yes')).not.toBeChecked();
    expect(within(group).getByLabelText('No')).not.toBeChecked();
  });
  it('displays the newly appended history from the real backend response shape', async () => {
    axios.put.mockResolvedValueOnce({
      data: {
        ...record,
        condition: 'Like New',
        updateRecord: [
          { condition: 'Good' },
          {
            condition: 'Out of Order',
            replacementRequired: false,
            notes: '',
            description: '',
            lastUsedBy: 'Alex',
            lastUsedFor: 'Site preparation',
            date: '2026-11-02T12:00:00.000Z',
            createdBy: { _id: '507f1f77bcf86cd799439012', firstName: 'Test', lastName: 'Author' },
          },
        ],
      },
    });
    setup();
    await loaded();
    fill();
    fireEvent.change(screen.getByLabelText('Status/Condition Now *'), {
      target: { value: 'Out of Order' },
    });
    submit();
    await screen.findByText(/The update date was recorded by the server/);
    expect(screen.getByText('Out of Order', { selector: 'div' })).toBeInTheDocument();
    expect(screen.getByText(/Equipment record condition:/)).toHaveTextContent('Like New');
    expect(screen.getByText(/Latest recorded replacement need:/)).toHaveTextContent('No');
    expect(axios.get).toHaveBeenCalledTimes(1);
  });
  it.each([false, true])(
    'keeps form content mounted across repeated radio changes (dark mode: %s)',
    async darkMode => {
      setup({ darkMode });
      await loaded();
      fill();
      const description = screen.getByLabelText('Additional Description (optional)');
      const confirmation = screen.getByRole('checkbox');
      const condition = screen.getByLabelText('Status/Condition Now *');
      fireEvent.change(description, { target: { value: 'Preserve this description' } });
      const replacementGroup = screen.getByRole('radiogroup', { name: /Require a replacement/ });
      const noteGroup = screen.getByRole('radiogroup', { name: /send a note/ });
      for (let round = 0; round < 4; round += 1) {
        ['Yes', 'No'].forEach(choice => {
          fireEvent.click(within(replacementGroup).getByLabelText(choice));
          expect(within(replacementGroup).getByLabelText(choice)).toBeChecked();
          fireEvent.click(within(noteGroup).getByLabelText(choice));
          expect(within(noteGroup).getByLabelText(choice)).toBeChecked();
          expect(screen.getByLabelText('Status/Condition Now *')).toBe(condition);
          expect(screen.getByLabelText('Additional Description (optional)')).toBe(description);
          expect(description).toBeVisible();
          expect(description).toHaveValue('Preserve this description');
          expect(screen.getByRole('checkbox')).toBe(confirmation);
          expect(confirmation).toBeChecked();
          expect(screen.getByRole('heading', { name: 'Update Equipment Status' })).toBeVisible();
          expect(screen.getByRole('button', { name: 'Update Status' })).toBeVisible();
          expect(Boolean(screen.queryByLabelText('Update note *'))).toBe(choice === 'Yes');
        });
      }
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.put).not.toHaveBeenCalled();
    },
  );
  it('uses Bootstrap inline radio layout and preserves native keyboard focus', async () => {
    setup();
    await loaded();
    const radios = screen.getAllByRole('radio');
    radios.forEach(radio => {
      // This structural assertion protects the Bootstrap static-positioning override.
      // eslint-disable-next-line testing-library/no-node-access
      expect(radio.parentElement).toHaveClass('form-check', 'form-check-inline');
    });
    const replacement = screen.getByRole('radiogroup', { name: /Require a replacement/ });
    const yes = within(replacement).getByLabelText('Yes');
    const no = within(replacement).getByLabelText('No');
    yes.focus();
    // jsdom does not implement native radio Space/arrow default actions.
    // Ensure events remain available to the browser rather than being cancelled.
    expect(fireEvent.keyDown(yes, { key: ' ', code: 'Space' })).toBe(true);
    expect(fireEvent.keyDown(yes, { key: 'ArrowRight' })).toBe(true);
    await userEvent.click(yes);
    expect(yes).toBeChecked();
    await userEvent.tab();
    expect(no).not.toHaveFocus();
    expect(screen.getByLabelText('Choose test image')).toHaveFocus();
  });
  it('preserves boolean false in the status action payload', async () => {
    const store = storeFactory({ auth: { user: { userid: 'user-123' } } });
    await store.dispatch(
      updateEquipment(id, { condition: 'Good', replacementRequired: false }, null, {
        publish: false,
        refresh: false,
      }),
    );
    expect(axios.put).toHaveBeenCalledWith(
      ENDPOINTS.BM_EQUIPMENT_STATUS_UPDATE(id),
      expect.objectContaining({ replacementRequired: false }),
    );
    expect(axios.get).not.toHaveBeenCalled();
  });
  it('loads matching equipment, distinguishes metadata meanings, and ignores stale Redux data', async () => {
    setup();
    await loaded();
    expect(screen.queryByText('Stale Redux record')).not.toBeInTheDocument();
    expect(screen.getByText('Equipment ID')).toBeInTheDocument();
    expect(screen.getByText('Not assigned')).toBeInTheDocument();
    expect(screen.queryByText('Broad category')).not.toBeInTheDocument();
    expect(screen.getByText(/Equipment record condition:/)).toHaveTextContent('New');
    expect(screen.queryByText('Unknown')).not.toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(
      ENDPOINTS.BM_EQUIPMENT_BY_ID(id),
      expect.objectContaining({ signal: expect.anything() }),
    );
  });
  it('blocks edits and handler submission during loading', () => {
    axios.get.mockReturnValue(new Promise(() => {}));
    setup();
    expect(screen.getByRole('status')).toHaveTextContent('Loading equipment');
    expect(screen.getByLabelText('Status/Condition Now *')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
    submit();
    expect(axios.put).not.toHaveBeenCalled();
  });
  it('shows a retrieval error and retries successfully', async () => {
    axios.get.mockRejectedValueOnce(new Error('offline'));
    setup();
    expect(await screen.findByText(/Unable to retrieve/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update Status' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await loaded();
    expect(axios.get).toHaveBeenCalledTimes(2);
  });
  it.each([
    [null, /record is missing or invalid/],
    [{ ...record, _id: otherId }, /does not match/],
    [{ ...record, __t: 'tool_item' }, /Equipment only/],
  ])('rejects missing, mismatched, or unsupported records: %j', async (data, message) => {
    axios.get.mockResolvedValue({ data });
    setup();
    expect(await screen.findByText(message)).toBeInTheDocument();
    submit();
    expect(axios.put).not.toHaveBeenCalled();
  });
  it('distinguishes a 404 from a network failure', async () => {
    axios.get.mockRejectedValue({ response: { status: 404 } });
    setup();
    expect(await screen.findByText(/Equipment not found/)).toBeInTheDocument();
  });
  it('rejects invalid route identifiers without requesting metadata', async () => {
    setup({ routeId: 'invalid' });
    expect(await screen.findByText(/Invalid equipment identifier/)).toBeInTheDocument();
    expect(axios.get).not.toHaveBeenCalled();
  });
  it('warns and blocks if required name is missing while optional metadata is allowed', async () => {
    axios.get.mockResolvedValue({ data: { _id: id } });
    setup();
    expect(await screen.findByText(/Equipment name is unavailable/)).toBeInTheDocument();
    submit();
    expect(axios.put).not.toHaveBeenCalled();
  });
  it('accepts a named equipment with missing optional fields and absent discriminator', async () => {
    axios.get.mockResolvedValue({ data: { _id: id, itemType: { name: 'Excavator' } } });
    setup();
    await screen.findByText('No status update recorded');
    fill();
    submit();
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  });
  it('ignores late responses and resets confirmation and input on route changes', async () => {
    const late = deferred();
    axios.get
      .mockReturnValueOnce(late.promise)
      .mockResolvedValueOnce({ data: { ...record, _id: otherId, itemType: { name: 'Crane' } } });
    const { history } = setup();
    act(() => history.push(`/bmdashboard/tools/${otherId}/update`));
    await screen.findByText('Crane');
    await act(async () => late.resolve({ data: record }));
    expect(screen.queryByText('Excavator')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    expect(screen.getByLabelText('Status/Condition Now *')).toHaveValue('');
  });
  it('resets an explicitly selected confirmation on navigation', async () => {
    const { history } = setup();
    await loaded();
    fill();
    axios.get.mockResolvedValueOnce({ data: { ...record, _id: otherId } });
    act(() => history.push(`/bmdashboard/tools/${otherId}/update`));
    await loaded();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });
  it('shows required indicators, exact API options, automatic date guidance, and field errors', async () => {
    setup();
    await loaded();
    submit();
    expect(screen.getByText(/Fields marked/)).toHaveTextContent(
      'update date is recorded automatically',
    );
    expect(screen.getByLabelText('Status/Condition Now *')).toHaveAttribute('required');
    expect(
      within(screen.getByLabelText('Status/Condition Now *'))
        .getAllByRole('option')
        .map(option => option.value),
    ).toEqual(['', 'Good', 'Needs Repair', 'Out of Order']);
    expect(screen.getByText('Select Good, Needs Repair, or Out of Order.')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Confirm the equipment you are updating.')).toBeInTheDocument();
    expect(axios.put).not.toHaveBeenCalled();
  });
  it('requires explicit confirmation even with valid fields', async () => {
    setup();
    await loaded();
    fill({ confirm: false });
    submit();
    expect(screen.getByText('Confirm the equipment you are updating.')).toBeInTheDocument();
    expect(axios.put).not.toHaveBeenCalled();
  });
  it('has controlled Yes/No radios with unique IDs and no notification promises', async () => {
    const { container } = setup();
    await loaded();
    const group = screen.getByRole('radiogroup', { name: /Require a replacement/ });
    fireEvent.click(within(group).getByLabelText('Yes'));
    fireEvent.click(within(group).getByLabelText('No'));
    expect(within(group).getByLabelText('No')).toBeChecked();
    expect(within(group).getByLabelText('Yes')).not.toBeChecked();
    // Inspect actual DOM IDs to catch collisions across independently labelled radio groups.
    // eslint-disable-next-line testing-library/no-node-access
    const ids = [...container.querySelectorAll('[id]')].map(el => el.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(screen.getByText(/does not create a purchase request/)).toBeInTheDocument();
    expect(screen.getByText(/No message, email, or notification/)).toBeInTheDocument();
  });
  it('rejects whitespace-only Other fields and conditional notes, and sets text limits', async () => {
    setup();
    await loaded();
    fill();
    fireEvent.change(screen.getByLabelText('Name of the last equipment user (required)'), {
      target: { value: '  ' },
    });
    const group = screen.getByRole('radiogroup', { name: /send a note/ });
    fireEvent.click(within(group).getByLabelText('Yes'));
    fireEvent.change(screen.getByLabelText('Update note *'), { target: { value: '  ' } });
    submit();
    expect(axios.put).not.toHaveBeenCalled();
    expect(screen.getByText('Enter a note, or select No.')).toBeInTheDocument();
    expect(screen.getByLabelText('Update note *')).toHaveAttribute('maxlength', '2000');
    expect(screen.getByLabelText('Name of the last equipment user (required)')).toHaveAttribute(
      'maxlength',
      '200',
    );
    expect(screen.getByLabelText('Last equipment usage (required)')).toHaveAttribute(
      'maxlength',
      '500',
    );
  });
  it('enforces length in the handler even if the DOM maxlength is bypassed', async () => {
    setup();
    await loaded();
    fill();
    fireEvent.change(screen.getByLabelText('Additional Description (optional)'), {
      target: { value: 'x'.repeat(2001) },
    });
    submit();
    expect(screen.getByText('Use no more than 2000 characters.')).toBeInTheDocument();
    expect(axios.put).not.toHaveBeenCalled();
  });
  it('submits exact API fields, optional replacement and note data, then navigates to Equipment detail', async () => {
    const { history, store } = setup();
    await loaded();
    fill();
    fireEvent.click(
      within(screen.getByRole('radiogroup', { name: /Require a replacement/ })).getByLabelText(
        'No',
      ),
    );
    fireEvent.change(screen.getByLabelText('Additional Description (optional)'), {
      target: { value: 'No replacement needed' },
    });
    fireEvent.click(
      within(screen.getByRole('radiogroup', { name: /send a note/ })).getByLabelText('Yes'),
    );
    fireEvent.change(screen.getByLabelText('Update note *'), {
      target: { value: ' Checked today ' },
    });
    submit();
    await screen.findByText(/The update date was recorded by the server/);
    expect(axios.put).toHaveBeenCalledWith(ENDPOINTS.BM_EQUIPMENT_STATUS_UPDATE(id), {
      condition: 'Good',
      lastUsedBy: 'Alex',
      lastUsedFor: 'Site preparation',
      replacementRequired: 'no',
      description: 'No replacement needed',
      notes: 'Checked today',
      sendNote: 'yes',
      createdBy: 'user-123',
    });
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(store.getActions()).toEqual([]);
    fireEvent.click(screen.getByRole('button', { name: 'view the equipment details' }));
    expect(history.location.pathname).toBe(`/bmdashboard/equipment/${id}`);
  });
  it('refreshes metadata once if the update response is not a full equipment record', async () => {
    axios.put.mockResolvedValue({ data: { message: 'saved' } });
    setup();
    await loaded();
    fill();
    submit();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    await loaded();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });
  it('preserves input on API failure', async () => {
    axios.put.mockRejectedValue({ response: { data: { error: 'Status rejected by server' } } });
    setup();
    await loaded();
    fill();
    submit();
    await screen.findByText('Status rejected by server');
    expect(screen.getByLabelText('Name of the last equipment user (required)')).toHaveValue('Alex');
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(screen.getByRole('button', { name: 'Update Status' })).toBeEnabled();
  });
  it('prevents duplicate submissions before React updates the disabled state', async () => {
    const pending = deferred();
    axios.put.mockReturnValue(pending.promise);
    setup();
    await loaded();
    fill();
    const form = screen.getByRole('form', { name: 'Equipment status update' });
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(axios.put).toHaveBeenCalledTimes(1);
    await act(async () => pending.resolve({ data: record }));
  });
  it('keeps preview changes independent of metadata retrieval', async () => {
    setup();
    await loaded();
    fireEvent.click(screen.getByRole('button', { name: 'Preview image' }));
    expect(screen.getByText('Local preview')).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledTimes(1);
  });
  it('retains dark-mode styling and scoped form layout', async () => {
    setup({ darkMode: true });
    await loaded();
    expect(screen.getByRole('form', { name: 'Equipment status update' })).toHaveClass(
      styles.statusForm,
      styles.dark,
    );
    expect(screen.getByRole('heading')).toHaveStyle({ color: '#ffffff' });
    fireEvent.click(screen.getByRole('button', { name: 'Preview image' }));
    expect(screen.getByTestId('local-preview')).toHaveAttribute('data-dark-mode', 'true');
  });
});
