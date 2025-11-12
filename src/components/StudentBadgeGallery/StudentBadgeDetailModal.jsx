import { Modal, ModalHeader, ModalBody } from 'reactstrap';

export default function StudentBadgeDetailModal({ isOpen, onClose, badge }) {
  if (!badge) return null;

  return (
    <Modal isOpen={isOpen} toggle={onClose}>
      <ModalHeader toggle={onClose}>{badge.badgeName}</ModalHeader>
      <ModalBody>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <img
            src={badge.imageUrl}
            alt={badge.badgeName}
            style={{ width: 120, height: 120, borderRadius: '50%' }}
          />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 600 }}>{badge.type || 'Badge'}</div>
            {badge.description && <p style={{ marginTop: 6 }}>{badge.description}</p>}
            <div>
              <strong>Count:</strong> {badge.count ?? 0}
            </div>
            {badge.earned === false && (
              <div style={{ opacity: 0.75, marginTop: 6 }}>Not earned yet</div>
            )}
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
