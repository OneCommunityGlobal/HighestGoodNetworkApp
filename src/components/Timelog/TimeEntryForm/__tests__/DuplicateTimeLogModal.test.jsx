import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DuplicateTimeLogModal from '../DuplicateTimeLogModal';

const WARNING =
  'Whoa there tiger, you’ve already submitted a time log exactly like this! Time logs need to be unique (and specific) or they’ll get flagged by the Time Log Administrator. Multiple flags will result in a blue square being issued.';

const LABELS = {
  cancel: 'CANCEL — I don’t want duplicates',
  edit: 'EDIT — I’ll update the description',
  proceed: 'PROCEED — I understand the consequences',
};

const INFO = {
  cancel:
    'Takes you to your time logs so you can review what you have already logged this week. Your timer is not reset and nothing is submitted.',
  edit:
    'Returns you to the time log form with everything you entered preserved, so you can edit or improve the description before submitting.',
  proceed:
    'Submits this time log exactly as entered, even though it matches one you already submitted. It may be flagged by the Time Log Administrator.',
};

describe('<DuplicateTimeLogModal />', () => {
  const renderModal = (props = {}) => {
    const handlers = { onCancel: vi.fn(), onEdit: vi.fn(), onProceed: vi.fn() };
    const { rerender } = render(<DuplicateTimeLogModal isOpen {...handlers} {...props} />);
    return { handlers, rerender };
  };

  const action = name => screen.getByRole('button', { name: LABELS[name] });
  const infoIcon = name =>
    screen.getByRole('button', { name: new RegExp(`^Information about ${name.toUpperCase()}`) });

  const expectOnlyCalled = (handlers, calledName) => {
    ['onCancel', 'onEdit', 'onProceed'].forEach(name => {
      if (name === calledName) {
        expect(handlers[name]).toHaveBeenCalledTimes(1);
      } else {
        expect(handlers[name]).not.toHaveBeenCalled();
      }
    });
  };

  // Enter on a focused button is a native click, which user-event only simulates when typing.
  const pressEnterOn = async element => {
    await userEvent.type(element, '{enter}', { skipClick: true });
  };

  describe('content', () => {
    it('shows the exact duplicate warning', () => {
      renderModal();

      expect(screen.getByText(WARNING)).toBeInTheDocument();
    });

    it('shows all three action labels', () => {
      renderModal();

      Object.keys(LABELS).forEach(name => expect(action(name)).toBeInTheDocument());
    });

    it.each(['cancel', 'edit', 'proceed'])(
      'explains the %s action in an accessible information icon and tooltip',
      async name => {
        renderModal();
        const icon = infoIcon(name);

        expect(icon).toHaveAttribute('aria-label', expect.stringContaining(INFO[name]));

        await userEvent.hover(icon);

        const tooltip = await screen.findByRole('tooltip');
        expect(tooltip).toHaveTextContent(INFO[name]);
      },
    );

    it('is an accessible dialog with a title', () => {
      renderModal();

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby');
    });

    it('is hidden when closed', () => {
      renderModal({ isOpen: false });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByText(WARNING)).not.toBeInTheDocument();
    });

    it('renders in dark mode without losing any content', () => {
      renderModal({ darkMode: true });

      expect(screen.getByText(WARNING)).toBeInTheDocument();
      Object.keys(LABELS).forEach(name => expect(action(name)).toBeInTheDocument());
    });
  });

  describe('default action', () => {
    it('focuses and marks EDIT as the default action', async () => {
      renderModal();

      await waitFor(() => expect(action('edit')).toHaveFocus());
      expect(action('edit')).toHaveAttribute('aria-keyshortcuts', 'Enter');
      expect(action('cancel')).not.toHaveAttribute('aria-keyshortcuts');
      expect(action('proceed')).not.toHaveAttribute('aria-keyshortcuts');
    });

    it('activates EDIT when Enter is pressed', async () => {
      const { handlers } = renderModal();
      await waitFor(() => expect(action('edit')).toHaveFocus());

      await pressEnterOn(action('edit'));

      expectOnlyCalled(handlers, 'onEdit');
    });
  });

  describe('actions', () => {
    it('invokes only onCancel for CANCEL', async () => {
      const { handlers } = renderModal();

      await userEvent.click(action('cancel'));

      expectOnlyCalled(handlers, 'onCancel');
    });

    it('invokes only onEdit for EDIT', async () => {
      const { handlers } = renderModal();

      await userEvent.click(action('edit'));

      expectOnlyCalled(handlers, 'onEdit');
    });

    it('invokes only onProceed for PROCEED', async () => {
      const { handlers } = renderModal();

      await userEvent.click(action('proceed'));

      expectOnlyCalled(handlers, 'onProceed');
    });

    it('does not invoke any action when an information icon is clicked', async () => {
      const { handlers } = renderModal();

      await userEvent.click(infoIcon('cancel'));
      await userEvent.click(infoIcon('edit'));
      await userEvent.click(infoIcon('proceed'));

      expectOnlyCalled(handlers, null);
    });
  });

  describe('dismissal', () => {
    it('treats Escape as EDIT and never submits the duplicate', () => {
      const { handlers } = renderModal();

      const dialog = screen.getByRole('dialog');
      fireEvent.keyDown(dialog, { key: 'Escape', keyCode: 27 });
      fireEvent.keyUp(dialog, { key: 'Escape', keyCode: 27 });

      expect(handlers.onProceed).not.toHaveBeenCalled();
      expect(handlers.onCancel).not.toHaveBeenCalled();
      expect(handlers.onEdit).toHaveBeenCalledTimes(1);
    });

    it('ignores clicks outside the dialog content', async () => {
      const { handlers } = renderModal();

      await userEvent.click(screen.getByRole('dialog'));

      expectOnlyCalled(handlers, null);
    });

    it('does not show a close button that could dismiss the modal', () => {
      renderModal();

      expect(screen.queryByRole('button', { name: /^close$/i })).not.toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('moves through the actions and information icons with Tab and Shift+Tab', async () => {
      renderModal();
      await waitFor(() => expect(action('edit')).toHaveFocus());

      await userEvent.tab();
      expect(infoIcon('edit')).toHaveFocus();

      await userEvent.tab();
      expect(action('proceed')).toHaveFocus();

      await userEvent.tab({ shift: true });
      expect(infoIcon('edit')).toHaveFocus();

      await userEvent.tab({ shift: true });
      expect(action('edit')).toHaveFocus();

      await userEvent.tab({ shift: true });
      expect(infoIcon('cancel')).toHaveFocus();

      await userEvent.tab({ shift: true });
      expect(action('cancel')).toHaveFocus();
    });

    it('shows the explanation when an information icon receives keyboard focus', async () => {
      renderModal();
      await waitFor(() => expect(action('edit')).toHaveFocus());

      await userEvent.tab();

      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip).toHaveTextContent(INFO.edit);
    });

    it('only activates PROCEED when it was deliberately focused and Enter is pressed', async () => {
      const { handlers } = renderModal();
      await waitFor(() => expect(action('edit')).toHaveFocus());

      await userEvent.tab();
      await userEvent.tab();
      expect(action('proceed')).toHaveFocus();
      await pressEnterOn(action('proceed'));

      expectOnlyCalled(handlers, 'onProceed');
    });
  });

  describe('keyboard defaults', () => {
    // The open transition takes about 300ms, so focus must already be on EDIT well before it ends.
    const EARLY = { timeout: 100 };

    it('focuses EDIT immediately after opening, before the transition finishes', async () => {
      renderModal();

      await waitFor(() => expect(action('edit')).toHaveFocus(), EARLY);
    });

    it('activates EDIT when Enter is pressed immediately after opening', async () => {
      const { handlers } = renderModal();
      await waitFor(() => expect(action('edit')).toHaveFocus(), EARLY);

      await pressEnterOn(action('edit'));

      expectOnlyCalled(handlers, 'onEdit');
    });

    it('keeps normal Enter activation of a deliberately focused CANCEL', async () => {
      const { handlers } = renderModal();
      await waitFor(() => expect(action('edit')).toHaveFocus(), EARLY);

      await userEvent.tab({ shift: true });
      await userEvent.tab({ shift: true });
      expect(action('cancel')).toHaveFocus();
      await pressEnterOn(action('cancel'));

      expectOnlyCalled(handlers, 'onCancel');
    });

    it.each([
      ['cancel', [{ shift: true }]],
      ['edit', [{}]],
      ['proceed', [{}, {}, {}]],
    ])('never invokes an action when Enter is pressed on the %s information icon', async (name, tabs) => {
      const { handlers } = renderModal();
      await waitFor(() => expect(action('edit')).toHaveFocus(), EARLY);

      await tabs.reduce(
        (previous, options) => previous.then(() => userEvent.tab(options)),
        Promise.resolve(),
      );
      expect(infoIcon(name)).toHaveFocus();
      await pressEnterOn(infoIcon(name));

      expectOnlyCalled(handlers, null);
    });

    it('treats Escape as EDIT even while PROCEED has focus', async () => {
      const { handlers } = renderModal();
      await waitFor(() => expect(action('edit')).toHaveFocus(), EARLY);

      await userEvent.tab();
      await userEvent.tab();
      expect(action('proceed')).toHaveFocus();
      fireEvent.keyDown(action('proceed'), { key: 'Escape', keyCode: 27 });
      fireEvent.keyUp(action('proceed'), { key: 'Escape', keyCode: 27 });

      expect(handlers.onProceed).not.toHaveBeenCalled();
      expect(handlers.onCancel).not.toHaveBeenCalled();
      expect(handlers.onEdit).toHaveBeenCalledTimes(1);
    });

    it('restores EDIT as the focused default when reopened after PROCEED had focus', async () => {
      const { handlers, rerender } = renderModal();
      await waitFor(() => expect(action('edit')).toHaveFocus(), EARLY);
      await userEvent.tab();
      await userEvent.tab();
      expect(action('proceed')).toHaveFocus();

      rerender(<DuplicateTimeLogModal isOpen={false} {...handlers} />);
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      rerender(<DuplicateTimeLogModal isOpen {...handlers} />);

      await waitFor(() => expect(action('edit')).toHaveFocus(), EARLY);
      await pressEnterOn(action('edit'));
      expectOnlyCalled(handlers, 'onEdit');
    });
  });
});
