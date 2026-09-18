import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getTeamsForPlacement } from '../../actions/promotionActions';
import styles from './PromotionConfirmationModal.module.css';

function PromotionConfirmationModal({
  placements,
  warnings,
  darkMode,
  confirming,
  onCancel,
  onConfirm,
}) {
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [teamOverrides, setTeamOverrides] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const data = await getTeamsForPlacement();
        setTeams(Array.isArray(data) ? data : []);
      } catch (e) {
        toast.error('Failed to load teams for manual placement.');
      } finally {
        setTeamsLoading(false);
      }
    })();
  }, []);

  const teamIdFor = placement => {
    const override = teamOverrides[placement.reviewerId];
    return override !== undefined ? override : placement.teamId || '';
  };

  const handleTeamChange = (reviewerId, teamId) => {
    setTeamOverrides(prev => ({ ...prev, [reviewerId]: teamId }));
  };

  const handleConfirmClick = () => {
    const finalPlacements = placements.map(p => ({
      reviewerId: p.reviewerId,
      teamId: teamIdFor(p) || null,
    }));
    onConfirm(finalPlacements);
  };

  return (
    <div className={styles.overlay}>
      <div
        className={`${styles.modal} ${darkMode ? styles.dark : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="promotion-confirm-title"
      >
        <div className={styles.modalHeader}>
          <h3 id="promotion-confirm-title" className={styles.modalTitle}>
            Confirm Promotions
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className={styles.closeButton}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className={styles.modalBody}>
          {warnings && warnings.length > 0 && (
            <ul className={styles.warningsList}>
              {warnings.map(warning => (
                <li key={warning} className={styles.warningItem}>
                  {warning}
                </li>
              ))}
            </ul>
          )}

          <div className={styles.tableWrapper}>
            <table className={styles.placementTable}>
              <colgroup>
                <col className={styles.colReviewer} />
                <col className={styles.colHours} />
                <col className={styles.colBand} />
                <col className={styles.colTeam} />
                <col className={styles.colNotes} />
              </colgroup>
              <thead>
                <tr>
                  <th>Reviewer</th>
                  <th>Committed Hours</th>
                  <th>Band</th>
                  <th>Team</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {placements.map(p => (
                  <tr key={p.reviewerId}>
                    <td>{p.reviewerName || p.reviewerId}</td>
                    <td>{p.committedHours ?? '—'}</td>
                    <td>{p.band || '—'}</td>
                    <td>
                      {teamsLoading ? (
                        <select className={styles.teamSelect} disabled>
                          <option>Loading teams…</option>
                        </select>
                      ) : (
                        <select
                          value={teamIdFor(p)}
                          onChange={e => handleTeamChange(p.reviewerId, e.target.value)}
                          className={styles.teamSelect}
                        >
                          <option value="">No team</option>
                          {teams.map(team => (
                            <option key={team._id} value={team._id}>
                              {team.teamName}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className={p.needsReview ? styles.needsReview : ''}>
                      {p.reason || (p.needsReview ? 'Please review' : '—')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={confirming}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmClick}
            className={styles.confirmButton}
            disabled={confirming}
          >
            {confirming ? 'Promoting...' : 'Confirm Promotions'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PromotionConfirmationModal;
