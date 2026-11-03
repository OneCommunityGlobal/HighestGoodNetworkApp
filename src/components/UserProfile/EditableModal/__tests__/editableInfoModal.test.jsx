import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditableInfoModal } from '../EditableInfoModal';

vi.mock('@tinymce/tinymce-react', () => ({
  Editor: ({ value, onEditorChange }) => (
    <textarea
      aria-label="Mock Editor"
      value={value}
      onChange={e => onEditorChange(e.target.value)}
    />
  ),
}));

const ICON_TITLE = 'Click for information about this';

// Renders the plain (not connected) component, so the store functions are simple mocks
const renderInfoModal = (props = {}) => {
  const allProps = {
    getInfoCollections: vi.fn(),
    addInfoCollection: vi.fn(),
    updateInfoCollection: vi.fn(),
    deleteInfoCollectionById: vi.fn(),
    infoCollections: [],
    role: 'Owner',
    areaName: 'Permission: seeBadges Info',
    areaTitle: 'See Badges',
    ...props,
  };
  const { rerender } = render(<EditableInfoModal {...allProps} />);
  // re-renders with the same props plus the changed ones (e.g. new texts from the store)
  const updateProps = changedProps =>
    rerender(<EditableInfoModal {...allProps} {...changedProps} />);
  return { ...allProps, updateProps };
};

const savedRecord = {
  _id: '1',
  infoName: 'Permission: seeBadges Info',
  infoContent: '<p>Saved</p>',
  visibility: '0',
};

const openInfo = () => fireEvent.click(screen.getByTitle(ICON_TITLE));

describe('EditableInfoModal', () => {
  describe('asking for the info texts on mount', () => {
    it('asks once on mount by default, as before', () => {
      const { getInfoCollections } = renderInfoModal();

      expect(getInfoCollections).toHaveBeenCalledTimes(1);
    });

    it('does not ask on mount when skipFetch is set', () => {
      const { getInfoCollections } = renderInfoModal({ skipFetch: true });

      expect(getInfoCollections).not.toHaveBeenCalled();
    });

    it('still asks again after a successful save when skipFetch is set', async () => {
      const addInfoCollection = vi.fn().mockResolvedValue(201);
      const { getInfoCollections } = renderInfoModal({
        skipFetch: true,
        addInfoCollection,
        initialInfo: 'Default text',
      });

      openInfo();
      // an Owner clicks the text to edit it, then saves
      fireEvent.click(screen.getByText('Default text'));
      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(getInfoCollections).toHaveBeenCalledTimes(1);
      });
      expect(addInfoCollection).toHaveBeenCalledWith({
        infoName: 'Permission: seeBadges Info',
        infoContent: 'Default text',
        visibility: '0',
      });
    });

    it('updates a saved text that arrived after mount instead of adding it again, when skipFetch is set', async () => {
      const updateInfoCollection = vi.fn().mockResolvedValue(200);
      const { addInfoCollection, getInfoCollections, updateProps } = renderInfoModal({
        skipFetch: true,
        updateInfoCollection,
        initialInfo: 'Default text',
      });

      // the parent's single request comes back after this icon has mounted
      updateProps({ infoCollections: [savedRecord] });
      openInfo();
      fireEvent.click(screen.getByText('Saved'));
      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(getInfoCollections).toHaveBeenCalledTimes(1);
      });
      expect(updateInfoCollection).toHaveBeenCalledWith('1', {
        infoName: 'Permission: seeBadges Info',
        infoContent: '<p>Saved</p>',
        visibility: '0',
      });
      expect(addInfoCollection).not.toHaveBeenCalled();
    });
  });

  describe('text shown in the modal', () => {
    it('shows the saved text when one exists, even if initialInfo is set', () => {
      renderInfoModal({
        initialInfo: 'Default description',
        infoCollections: [
          {
            infoName: 'Permission: seeBadges Info',
            infoContent: '<p>Saved by an Owner</p>',
            visibility: '0',
          },
        ],
      });

      openInfo();

      expect(screen.getByText('Saved by an Owner')).toBeInTheDocument();
      expect(screen.queryByText('Default description')).not.toBeInTheDocument();
    });

    it('shows initialInfo when nothing is saved for this area, with apostrophes and ampersands intact', () => {
      renderInfoModal({
        initialInfo: "Owner's notes & tips",
        infoCollections: [
          { infoName: 'Another Info', infoContent: '<p>Text of another area</p>', visibility: '0' },
        ],
      });

      openInfo();

      // an exact match, so ' and & are shown as typed, not as &#39; or &amp;
      expect(screen.getByText("Owner's notes & tips")).toBeInTheDocument();
      expect(screen.queryByText('Text of another area')).not.toBeInTheDocument();
    });

    it('switches from initialInfo to the saved text when the texts arrive after mount, with skipFetch', () => {
      const { updateProps } = renderInfoModal({ skipFetch: true, initialInfo: 'Default text' });

      openInfo();
      expect(screen.getByText('Default text')).toBeInTheDocument();

      // the parent's single request comes back while this icon is already on screen
      updateProps({ infoCollections: [savedRecord] });

      expect(screen.getByText('Saved')).toBeInTheDocument();
      expect(screen.queryByText('Default text')).not.toBeInTheDocument();
    });

    it("shows 'Please input information!' when nothing is saved and there is no initialInfo", () => {
      renderInfoModal();

      openInfo();

      expect(screen.getByText('Please input information!')).toBeInTheDocument();
    });

    it('keeps ignoring defaultText, so callers that pass it look the same as before', () => {
      renderInfoModal({ defaultText: 'Text passed as defaultText' });

      openInfo();

      expect(screen.getByText('Please input information!')).toBeInTheDocument();
      expect(screen.queryByText('Text passed as defaultText')).not.toBeInTheDocument();
    });
  });

  describe('initialInfoHtml, a starting text with lists and bold', () => {
    const startingHtml =
      '<p>Intro line.</p><ul><li><strong>Save:</strong> Click to save.</li><li>Second</li></ul>';

    it('keeps the list and the bold when nothing is saved for this area', () => {
      renderInfoModal({ initialInfoHtml: startingHtml });

      openInfo();

      expect(screen.getAllByRole('listitem')).toHaveLength(2);
      expect(screen.getByText('Save:').tagName).toBe('STRONG');
    });

    it('gives way to the saved text, also when the texts arrive after mount', () => {
      const { updateProps } = renderInfoModal({ skipFetch: true, initialInfoHtml: startingHtml });

      openInfo();
      expect(screen.getByText('Intro line.')).toBeInTheDocument();

      updateProps({ infoCollections: [savedRecord] });

      expect(screen.getByText('Saved')).toBeInTheDocument();
      expect(screen.queryByText('Intro line.')).not.toBeInTheDocument();
    });

    it('hides the icon from a role the saved visibility leaves out', () => {
      renderInfoModal({
        role: 'Volunteer',
        initialInfoHtml: startingHtml,
        infoCollections: [{ ...savedRecord, visibility: '2' }],
      });

      expect(screen.queryByTitle(ICON_TITLE)).not.toBeInTheDocument();
    });

    it('cleans the starting text the same way as a saved text', () => {
      renderInfoModal({ initialInfoHtml: '<p>Clean <b>old bold</b></p>' });

      openInfo();

      expect(screen.getByText(/old bold/).tagName).toBe('P');
    });

    it('goes into the editor and is saved with the list and the bold kept', async () => {
      const addInfoCollection = vi.fn().mockResolvedValue(201);
      renderInfoModal({ addInfoCollection, initialInfoHtml: startingHtml });

      openInfo();
      fireEvent.click(screen.getByText('Intro line.'));
      expect(screen.getByLabelText('Mock Editor')).toHaveValue(startingHtml);
      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(addInfoCollection).toHaveBeenCalledWith({
          infoName: 'Permission: seeBadges Info',
          infoContent: startingHtml,
          visibility: '0',
        });
      });
    });
  });
});
