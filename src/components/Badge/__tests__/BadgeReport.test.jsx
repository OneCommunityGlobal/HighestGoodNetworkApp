import React from 'react';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react';
import BadgeReport from '../BadgeReport/BadgeReport';
import FeaturedBadges from '../../UserProfile/FeaturedBadges';
import pdfMake from 'pdfmake/build/pdfmake';
import htmlToPdfmake from 'html-to-pdfmake';
import { formatDate } from '~/utils/formatDate';
import { toast } from 'react-toastify';

vi.mock('pdfmake/build/pdfmake', () => ({ default: { createPdf: vi.fn() } }));
vi.mock('html-to-pdfmake', () => ({ default: vi.fn(() => []) }));

vi.mock('react-redux', () => ({
  connect: () => component => component,
}));

let mockBadges = [
  {
    badge: {
      badgeName: 'test name 1',
      description: 'test desc 2',
      imageUrl: 'tes url 1',
      ranking: 1,
      showReport: null,
      type: 'test type 1',
      _id: 'test id 1',
    },
    count: 7,
    earnedDate: ['Mar-28-24', 'Apr-16-24', 'May-13-24', 'May-13-24', 'May-13-24', 'May-13-24'],
    featured: false,
    hasBadgeDeletionImpact: false,
    lastModified: '2024-04-16T16:15:49.158Z',
    _id: '664254c72adc89187008ac77',
  },
];
const mockRole = 'Owner';
const mockHasPermission = vi.fn();

const getBadgeReportProps = overrides => ({
  canEdit: true,
  badges: mockBadges,
  hasPermission: mockHasPermission,
  role: mockRole,
  userId: 'user-id',
  changeBadgesByUserID: vi.fn().mockResolvedValue(true),
  getUserProfile: vi.fn().mockResolvedValue(),
  setUserProfile: vi.fn(),
  setOriginalUserProfile: vi.fn(),
  handleSubmit: vi.fn(),
  close: vi.fn(),
  ...overrides,
});

const renderBadgeReport = overrides => render(<BadgeReport {...getBadgeReportProps(overrides)} />);

describe('BadgeReport Component', () => {
  test('renders component without any errors', () => {
    renderBadgeReport();
  });

  test('renders all the core static fields proplerly', () => {
    renderBadgeReport();

    //common headers in desktop and mobile view
    const badgeHeaders = screen.getAllByText('Badge');
    const nameHeaders = screen.getAllByText('Name');
    const modifiedHeaders = screen.getAllByText('Modified');
    const earnedDatesHeaders = screen.getAllByText('Earned Dates'); // Fix for multiple matches
    expect(badgeHeaders).toHaveLength(2);
    expect(nameHeaders).toHaveLength(2);
    expect(modifiedHeaders).toHaveLength(2);
    expect(earnedDatesHeaders).toHaveLength(2); // One for desktop, one for tablet

    //headers only in desktop view
    //  expect(screen.getByText('Earned Dates')).toBeInTheDocument();
    expect(screen.getByText('Count')).toBeInTheDocument();
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  test('renders all mobile view specific fields properly', () => {
    renderBadgeReport();

    const optionsField = screen.getByText('Options');
    expect(optionsField).toBeInTheDocument();

    fireEvent.click(optionsField);
    expect(screen.getByText('Count:')).toBeInTheDocument();
    expect(screen.getByText('Featured:')).toBeInTheDocument();
  });

  test('renders correct message if no badges are present', () => {
    renderBadgeReport({ badges: [] });

    const noBadgesPlaceHolder = screen.getAllByText('This person has no badges.');

    //length 2 for desktop view and mobile view
    expect(noBadgesPlaceHolder).toHaveLength(2);
  });

  test('renders all the badge information correctly', () => {
    renderBadgeReport();

    mockBadges.forEach((mockBadge, index) => {
      const badgeName = mockBadge.badge.badgeName;
      const badgeModifiedDate = mockBadge.lastModified;
      const badgeCount = mockBadge.count;

      expect(screen.getAllByText(badgeName).length).toBeGreaterThan(0);
      expect(screen.getAllByText(formatDate(badgeModifiedDate)).length).toBeGreaterThan(0);
      expect(screen.getAllByText(badgeCount).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
    });
  });

  test('test for multiple badges', () => {
    mockBadges = [
      ...mockBadges,
      {
        badge: {
          badgeName: 'test name 2',
          description: 'test desc 2',
          imageUrl: 'test url 2',
          ranking: 1,
          showReport: null,
          type: 'test type 2',
          _id: 'test id',
        },
        count: 5,
        earnedDate: ['May-15-24'],
        featured: false,
        hasBadgeDeletionImpact: false,
        lastModified: '2024-04-16T16:15:49.158Z',
        _id: '664254c72adc89187008ac78',
      },
    ];

    renderBadgeReport();

    mockBadges.forEach((mockBadge, index) => {
      const badgeName = mockBadge.badge.badgeName;
      const badgeModifiedDate = mockBadge.lastModified;
      const badgeCount = mockBadge.count;

      expect(screen.getAllByText(badgeName).length).toBeGreaterThan(0);
      expect(screen.getAllByText(formatDate(badgeModifiedDate)).length).toBeGreaterThan(0);
      expect(screen.getAllByText(badgeCount).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
    });
  });

  test('disables selected export until a badge is featured', () => {
    renderBadgeReport({
      badges: [{ ...mockBadges[0], featured: false }],
    });

    screen
      .getAllByRole('button', { name: 'Export Selected/Featured Badges to PDF' })
      .forEach(button => expect(button).toBeDisabled());
  });

  test('limits the selection to five featured badges and permits replacement after unselecting', async () => {
    const badges = Array.from({ length: 6 }, (_, index) => ({
      ...mockBadges[0],
      _id: `badge-record-${index}`,
      featured: false,
      badge: {
        ...mockBadges[0].badge,
        _id: `badge-${index}`,
        badgeName: `Badge ${index}`,
      },
    }));
    renderBadgeReport({ badges });

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.slice(0, 5).forEach(checkbox => fireEvent.click(checkbox));

    await waitFor(() => expect(checkboxes[4]).toBeChecked());
    fireEvent.click(checkboxes[5]);
    expect(checkboxes[5]).not.toBeChecked();

    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[5]);
    expect(checkboxes[5]).toBeChecked();
  });

  test.each([false, true])(
    'saves featured=%s without replacing UI badge objects with IDs',
    async initialFeatured => {
      const badges = [{ ...mockBadges[0], featured: initialFeatured }];
      const original = structuredClone(badges);
      const props = getBadgeReportProps({ badges });
      const { rerender } = render(<BadgeReport {...props} />);

      fireEvent.click(screen.getAllByRole('checkbox')[0]);
      fireEvent.click(screen.getAllByRole('button', { name: 'Save Changes' })[0]);

      await waitFor(() => expect(props.close).toHaveBeenCalledOnce());
      expect(props.changeBadgesByUserID).toHaveBeenCalledWith('user-id', [
        { ...original[0], badge: original[0].badge._id, featured: !initialFeatured },
      ]);
      expect(props.getUserProfile).toHaveBeenCalledWith('user-id');
      expect(props.handleSubmit).toHaveBeenCalledOnce();
      expect(badges).toEqual(original);
      const profile = { badgeCollection: original, firstName: 'Volunteer' };
      const updated = props.setUserProfile.mock.calls[0][0](profile);
      expect(updated).toEqual({
        ...profile,
        badgeCollection: [{ ...original[0], featured: !initialFeatured }],
      });
      expect(props.setOriginalUserProfile.mock.calls[0][0](profile)).toEqual(updated);

      rerender(<FeaturedBadges badges={updated.badgeCollection} personalBestMaxHrs={40} />);
      expect(screen.queryAllByTestId('badge_featured_count')).toHaveLength(initialFeatured ? 0 : 1);
      rerender(<BadgeReport {...props} badges={updated.badgeCollection} />);
      expect(screen.getAllByRole('checkbox')[0].checked).toBe(!initialFeatured);
    },
  );

  test('keeps failed featured changes editable and permits retry', async () => {
    const props = getBadgeReportProps({
      badges: [{ ...mockBadges[0], featured: false }],
      changeBadgesByUserID: vi
        .fn()
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true),
    });
    render(<BadgeReport {...props} />);
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Save Changes' })[0]);
    await waitFor(() => expect(props.changeBadgesByUserID).toHaveBeenCalledOnce());
    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: 'Save Changes' })[0]).toBeEnabled(),
    );
    expect(props.close).not.toHaveBeenCalled();
    expect(props.getUserProfile).not.toHaveBeenCalled();
    expect(props.setUserProfile).not.toHaveBeenCalled();
    expect(props.setOriginalUserProfile).not.toHaveBeenCalled();
    expect(screen.getAllByRole('checkbox')[0]).toBeChecked();
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Save Changes' })[0]);
    await waitFor(() => expect(props.close).toHaveBeenCalledOnce());
    expect(props.changeBadgesByUserID.mock.calls[1][1][0].featured).toBe(false);
  });

  test.each([0, 1])('blocks protected-account saving from save button %s', index => {
    const props = getBadgeReportProps({ isRecordBelongsToJaeAndUneditable: true });
    render(<BadgeReport {...props} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Save Changes' })[index]);
    expect(screen.getAllByRole('button', { name: 'Save Changes' })[index]).toBeDisabled();
    expect(props.changeBadgesByUserID).not.toHaveBeenCalled();
    expect(props.setUserProfile).not.toHaveBeenCalled();
  });

  test('exports all or only featured badges through the retained PDF helpers', async () => {
    const download = vi.fn();
    pdfMake.createPdf.mockReturnValue({ download });
    const context = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({ drawImage: vi.fn() });
    const dataUrl = vi
      .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockReturnValue('data:image/png;base64,test');
    vi.stubGlobal(
      'Image',
      class {
        set src(value) {
          this.url = value;
          queueMicrotask(() => this.onload());
        }
        get src() {
          return this.url;
        }
      },
    );
    try {
      renderBadgeReport({
        badges: [
          {
            ...mockBadges[0],
            featured: true,
            badge: { ...mockBadges[0].badge, badgeName: 'Featured export' },
          },
          {
            ...mockBadges[0],
            _id: 'other-record',
            featured: false,
            badge: { ...mockBadges[0].badge, _id: 'other-badge', badgeName: 'Other export' },
          },
        ],
      });
      fireEvent.click(screen.getAllByRole('button', { name: 'Export All Badges to PDF' })[0]);
      await waitFor(() => expect(download).toHaveBeenCalledOnce());
      expect(htmlToPdfmake.mock.calls.at(-1)[0]).toContain('Featured export');
      expect(htmlToPdfmake.mock.calls.at(-1)[0]).toContain('Other export');
      fireEvent.click(
        screen.getAllByRole('button', { name: 'Export Selected/Featured Badges to PDF' })[0],
      );
      await waitFor(() => expect(download).toHaveBeenCalledTimes(2));
      expect(htmlToPdfmake.mock.calls.at(-1)[0]).toContain('Featured export');
      expect(htmlToPdfmake.mock.calls.at(-1)[0]).not.toContain('Other export');
      expect(download).toHaveBeenLastCalledWith(expect.stringMatching(/^Featured-Badge-Report-/));
    } finally {
      context.mockRestore();
      dataUrl.mockRestore();
      vi.unstubAllGlobals();
    }
  });

  test.each(['updateBadges', 'modifyBadgeAmount', 'assignBadges'])(
    'allows counts on both layouts with %s',
    permission => {
      renderBadgeReport({
        badges: [mockBadges[0]],
        canEdit: false,
        hasPermission: key => key === permission,
      });
      fireEvent.click(screen.getAllByText('Options')[0]);
      expect(screen.getAllByRole('spinbutton')).toHaveLength(2);
      screen.getAllByRole('spinbutton').forEach(input => expect(input).toBeEnabled());
      screen.getAllByRole('checkbox').forEach(input => {
        if (permission === 'modifyBadgeAmount') expect(input).toBeDisabled();
        else expect(input).toBeEnabled();
      });
      expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    },
  );

  test.each([false, true])(
    'read-only/protected=%s cannot change counts or featured flags',
    protectedAccount => {
      renderBadgeReport({
        canEdit: protectedAccount,
        hasPermission: () => protectedAccount,
        isRecordBelongsToJaeAndUneditable: protectedAccount,
      });
      fireEvent.click(screen.getAllByText('Options')[0]);
      expect(screen.queryAllByRole('spinbutton')).toHaveLength(0);
      screen.getAllByRole('checkbox').forEach(input => expect(input).toBeDisabled());
      screen
        .getAllByRole('button', { name: 'Save Changes' })
        .forEach(button => expect(button).toBeDisabled());
    },
  );

  test.each(['', '-1', '1.5', '9007199254740992'])(
    'blocks invalid count %s and restores it on blur',
    rawValue => {
      renderBadgeReport({ badges: [mockBadges[0]], hasPermission: () => true });
      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: rawValue } });
      expect(screen.getByRole('alert')).toHaveTextContent('whole numbers');
      screen
        .getAllByRole('button', { name: 'Save Changes' })
        .forEach(button => expect(button).toBeDisabled());
      fireEvent.blur(input);
      expect(input).toHaveValue(mockBadges[0].count);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    },
  );

  test('requires delete permission for zero and cancels deletion without changing the count', () => {
    const props = getBadgeReportProps({
      badges: [mockBadges[0]],
      hasPermission: key => key === 'modifyBadgeAmount',
    });
    const { rerender } = render(<BadgeReport {...props} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '0' } });
    expect(screen.queryByRole('button', { name: 'Yes, Delete' })).not.toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toHaveValue(mockBadges[0].count);
    rerender(<BadgeReport {...props} hasPermission={() => true} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('spinbutton')).toHaveValue(mockBadges[0].count);
    expect(props.changeBadgesByUserID).not.toHaveBeenCalled();
  });

  test.each([null, { badge: 'id-only' }, { badge: {} }, { ...mockBadges[0], count: NaN }])(
    'renders valid rows but blocks writes alongside broken records',
    invalid => {
      const props = getBadgeReportProps({ badges: [mockBadges[0], invalid] });
      render(<BadgeReport {...props} />);
      expect(screen.getByRole('alert')).toHaveTextContent('No records have been removed');
      expect(screen.getAllByText(mockBadges[0].badge.badgeName).length).toBeGreaterThan(0);
      screen.getAllByRole('button', { name: 'Save Changes' }).forEach(button => {
        expect(button).toBeDisabled();
        fireEvent.click(button);
      });
      expect(props.changeBadgesByUserID).not.toHaveBeenCalled();
    },
  );

  test('handles missing dates and missing or non-array collections', () => {
    const props = getBadgeReportProps({
      badges: [{ ...mockBadges[0], earnedDate: undefined, lastModified: undefined }],
    });
    const { rerender } = render(<BadgeReport {...props} />);
    expect(screen.getAllByText('—')).toHaveLength(2);
    rerender(<BadgeReport {...props} badges={undefined} />);
    expect(screen.getAllByText('This person has no badges.')).toHaveLength(2);
    rerender(<BadgeReport {...props} badges={{ invalid: true }} />);
    expect(screen.getByRole('alert')).toHaveTextContent('records are invalid');
  });

  test('orders the editor by rank and then name with zero and missing ranks last', () => {
    const badges = [
      {
        ...mockBadges[0],
        _id: 'zero',
        badge: { ...mockBadges[0].badge, _id: 'zero', badgeName: 'Zero', ranking: 0 },
      },
      {
        ...mockBadges[0],
        _id: 'two',
        badge: { ...mockBadges[0].badge, _id: 'two', badgeName: 'Two', ranking: 2 },
      },
      {
        ...mockBadges[0],
        _id: 'one',
        badge: { ...mockBadges[0].badge, _id: 'one', badgeName: 'One', ranking: 1 },
      },
      {
        ...mockBadges[0],
        _id: 'missing',
        badge: { ...mockBadges[0].badge, _id: 'missing', badgeName: 'Missing', ranking: undefined },
      },
    ];
    renderBadgeReport({ badges });
    expect(screen.getAllByRole('checkbox').map(input => input.id)).toEqual([
      'one',
      'two',
      'missing',
      'zero',
    ]);
  });

  test('updates count history immutably and can correct an empty draft before saving', async () => {
    const badges = structuredClone([mockBadges[0]]);
    const original = structuredClone(badges);
    const props = getBadgeReportProps({
      badges,
      hasPermission: key => key === 'modifyBadgeAmount',
    });
    render(<BadgeReport {...props} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.change(input, { target: { value: String(badges[0].count + 1) } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Save Changes' })[0]);
    await waitFor(() => expect(props.close).toHaveBeenCalledOnce());
    expect(badges).toEqual(original);
    const saved = props.changeBadgesByUserID.mock.calls[0][1][0];
    expect(saved.count).toBe(original[0].count + 1);
    expect(saved.earnedDate).toEqual([...original[0].earnedDate, formatDate(new Date())]);
  });

  test('locks a pending save, ignores refreshed props, and preserves its immutable snapshot', async () => {
    let finish;
    const badges = structuredClone([mockBadges[0]]);
    const original = structuredClone(badges);
    const props = getBadgeReportProps({
      badges,
      hasPermission: () => true,
      onSavingChange: vi.fn(),
      changeBadgesByUserID: vi.fn(
        () =>
          new Promise(resolve => {
            finish = resolve;
          }),
      ),
    });
    const { rerender } = render(<BadgeReport {...props} />);
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Save Changes' })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Save Changes' })[1]);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '20' } });
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    expect(props.changeBadgesByUserID).toHaveBeenCalledOnce();
    expect(screen.getByRole('spinbutton')).toBeDisabled();
    expect(screen.getAllByRole('checkbox')[0]).toBeChecked();
    rerender(<BadgeReport {...props} badges={[]} />);
    expect(screen.getByRole('spinbutton')).toHaveValue(original[0].count);
    await act(async () => finish(true));
    expect(props.close).toHaveBeenCalledOnce();
    expect(props.onSavingChange.mock.calls).toEqual([[true], [false]]);
    expect(props.changeBadgesByUserID.mock.calls[0][1][0]).toEqual({
      ...original[0],
      badge: original[0].badge._id,
      featured: true,
    });
    expect(props.setUserProfile.mock.calls[0][0]({}).badgeCollection[0]).toEqual({
      ...original[0],
      featured: true,
    });
    expect(badges).toEqual(original);
  });

  test('locks repeated deletion confirmations and cancel while pending', async () => {
    let finish;
    const props = getBadgeReportProps({
      badges: [mockBadges[0]],
      hasPermission: () => true,
      changeBadgesByUserID: vi.fn(
        () =>
          new Promise(resolve => {
            finish = resolve;
          }),
      ),
    });
    render(<BadgeReport {...props} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    const confirm = screen.getByRole('button', { name: 'Yes, Delete' });
    fireEvent.click(confirm);
    fireEvent.click(confirm);
    expect(confirm).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(props.changeBadgesByUserID).toHaveBeenCalledOnce();
    await act(async () => finish(false));
    expect(confirm).toBeEnabled();
    expect(props.setUserProfile).not.toHaveBeenCalled();
  });

  test('reports a successful write separately from a failed profile refresh', async () => {
    const props = getBadgeReportProps({
      getUserProfile: vi.fn().mockRejectedValue(new Error('offline')),
    });
    render(<BadgeReport {...props} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Save Changes' })[0]);
    await waitFor(() => expect(props.close).toHaveBeenCalledOnce());
    expect(props.setUserProfile).toHaveBeenCalledOnce();
    expect(toast.warn).toHaveBeenCalledWith(expect.stringContaining('Badges were saved'));
  });

  test('persists a confirmed deletion and keeps the badge editor open', async () => {
    const changeBadgesByUserID = vi.fn().mockResolvedValue(true);
    const getUserProfile = vi.fn().mockResolvedValue();
    const setUserProfile = vi.fn();
    const setOriginalUserProfile = vi.fn();
    const close = vi.fn();
    const hasPermission = vi.fn(permission => permission === 'deleteBadges');

    renderBadgeReport({
      badges: [{ ...mockBadges[0] }],
      changeBadgesByUserID,
      getUserProfile,
      setUserProfile,
      setOriginalUserProfile,
      close,
      hasPermission,
    });

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Yes, Delete' }));

    await waitFor(() => {
      expect(changeBadgesByUserID).toHaveBeenCalledWith('user-id', []);
    });
    expect(getUserProfile).toHaveBeenCalledWith('user-id');
    expect(setUserProfile).toHaveBeenCalled();
    expect(setOriginalUserProfile).toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(
        screen.queryByText('Woah, easy tiger! Are you sure you want to delete this badge?'),
      ).toBeNull();
    });
  });

  test('keeps a badge deletion pending when persistence fails', async () => {
    const changeBadgesByUserID = vi.fn().mockResolvedValue(false);
    const setUserProfile = vi.fn();
    const hasPermission = vi.fn(permission => permission === 'deleteBadges');

    renderBadgeReport({
      badges: [{ ...mockBadges[0] }],
      changeBadgesByUserID,
      setUserProfile,
      hasPermission,
    });

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Yes, Delete' }));

    await waitFor(() => expect(changeBadgesByUserID).toHaveBeenCalled());
    expect(setUserProfile).not.toHaveBeenCalled();
    expect(
      screen.getByText('Woah, easy tiger! Are you sure you want to delete this badge?'),
    ).toBeInTheDocument();
  });
});
