import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import BadgeReport from '../BadgeReport/BadgeReport';
import FeaturedBadges from '../../UserProfile/FeaturedBadges';
import pdfMake from 'pdfmake/build/pdfmake';
import htmlToPdfmake from 'html-to-pdfmake';
import { formatDate } from '~/utils/formatDate';

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
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const props = getBadgeReportProps({ isRecordBelongsToJaeAndUneditable: true });
    render(<BadgeReport {...props} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Save Changes' })[index]);
    expect(alert).toHaveBeenCalledOnce();
    expect(props.changeBadgesByUserID).not.toHaveBeenCalled();
    expect(props.setUserProfile).not.toHaveBeenCalled();
    alert.mockRestore();
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
