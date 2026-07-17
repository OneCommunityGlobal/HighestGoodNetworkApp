import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import styles from './StudentBadgeDetailModal.module.css';

export default function StudentBadgeDetailModal({ isOpen, onClose, badge, darkMode }) {
  if (!badge) return null;

  const textColor = darkMode ? '#ffffff' : undefined;

  return (
    <Modal isOpen={isOpen} toggle={onClose} className={styles.studentBadgeModal}>
      <ModalHeader toggle={onClose}>
        <span style={{ color: textColor }}>{badge.badgeName}</span>
      </ModalHeader>
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
            <div style={{ fontWeight: 600, color: textColor }}>{badge.type || 'Badge'}</div>
            {badge.description && (
              <p style={{ marginTop: 6, color: textColor }}>{badge.description}</p>
            )}
            <div style={{ color: textColor }}>
              <strong>Count:</strong> {badge.count ?? 0}
            </div>
            {badge.earned === false && (
              <div style={{ opacity: 0.75, marginTop: 6, color: textColor }}>Not earned yet</div>
            )}
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
