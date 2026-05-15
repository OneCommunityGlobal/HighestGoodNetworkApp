import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Button } from 'react-bootstrap';

function ExportConfirmationModal({
  showExportModal,
  setShowExportModal,
  onConfirmExport,
  filteredLessonsCount,
  filterDescription,
  darkMode,
  isExporting = false,
}) {
  return (
    <Modal
      isOpen={showExportModal}
      toggle={() => setShowExportModal(false)}
      className={darkMode ? 'text-light dark-mode' : ''}
    >
      <ModalHeader
        toggle={() => setShowExportModal(false)}
        className={darkMode ? 'bg-space-cadet' : ''}
      >
        Export Lesson Data
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <p>
          You are about to export <strong>{filteredLessonsCount}</strong> lesson(s) to a CSV file.
        </p>
        {filterDescription && filterDescription !== 'No filters applied' && (
          <p>
            <strong>Applied Filters:</strong> {filterDescription}
          </p>
        )}
        <p>
          The exported file will include: Lesson Title, Date, Tags, Author, Related Project, Total
          Likes, and Content Summary.
        </p>
        <p style={{ marginTop: '10px', fontStyle: 'italic', color: darkMode ? '#ccc' : '#666' }}>
          Click &quot;Confirm Export&quot; to proceed with the download.
        </p>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button
          variant="primary"
          onClick={() => {
            // Modal will be closed by exportLessonData on success
            onConfirmExport();
          }}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Confirm Export'}
        </Button>
        <Button
          variant="secondary"
          onClick={() => setShowExportModal(false)}
          disabled={isExporting}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default ExportConfirmationModal;
