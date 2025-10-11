import { useLocation, useParams, Link } from "react-router-dom";
import styles from "./DailyLogPage.module.css";

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function TimeLogDetail() {
  const { id } = useParams();               // e.g., "101"
  const location = useLocation();
  const log = location.state?.log;          // we pass it from the list page

  // If someone refreshes on this page, state will be empty.
  // Show a simple fallback asking to go back.
  if (!log) {
    return (
      <div className={styles.page}>
        <div className={styles.detailCard}>
          <h1 className={styles.pageTitle}>Time Log {id}</h1>
          <p className={styles.detailNote}>
            No data found for this entry. Please return to the Daily Log and open the item again.
          </p>
          <Link to="/educationportal/dailylog" className={styles.viewBtn}>Back to Daily Log</Link>
        </div>
      </div>
    );
  }

  const { metadata: md = {} } = log;

  return (
    <div className={styles.page}>
      <div className={styles.detailCard}>
        <h1 className={styles.pageTitle}>{md.course || "Time Log"}</h1>

        <div className={styles.detailGrid}>
          <div>
            <div className={styles.detailLabel}>Duration</div>
            <div className={styles.detailValue}>{md.duration || "—"}</div>
          </div>

          <div>
            <div className={styles.detailLabel}>Logged On</div>
            <div className={styles.detailValue}>{formatDateTime(log.created_at)}</div>
          </div>

          <div>
            <div className={styles.detailLabel}>Status</div>
            <div className={styles.detailValue}>{md.badge || "—"}</div>
          </div>
        </div>

        {md.notes && (
          <div className={styles.detailSection}>
            <div className={styles.detailLabel}>Notes</div>
            <p className={styles.notes}>{md.notes}</p>
          </div>
        )}

        <div className={styles.detailActions}>
          <Link to="/educationportal/dailylog" className={styles.viewBtn}>Back to Daily Log</Link>
        </div>
      </div>
    </div>
  );
}
