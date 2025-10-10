import { Link } from "react-router-dom";
import styles from "./DailyLogPage.module.css";

const typeIcon = {
  task_upload: "📝",
  comment: "💬",
  note: "📝",
  task_complete: "✅",
  announcement: "📣",
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function LogItemCard({ row }) {
  const md = row?.metadata || {};
  const icon = typeIcon[row?.action_type] || "•";
  let title = md.course || md.title || "Activity";
  if (row.action_type === "comment") title = "Teacher Feedback added";
  if (row.action_type === "announcement") title = "Announcement read";
  const subtitleParts = [];
  if (row.action_type === "task_upload" && md.duration) {
    subtitleParts.push(md.duration);
  }
  const dateLabel = formatDate(row.created_at);

  return (
    <div className={styles.row}>
      <div className={styles.left}>
        <div className={styles.titleLine}>
          <span aria-hidden>{icon}</span>
          <span className={styles.title}>{title}</span>

          {md.badge && <span className={styles.badge}>{md.badge}</span>}

          {md.is_highlighted && (
            <span className={styles.pill}>Highlighted</span>
          )}

          {typeof md.comments_count === "number" && (
            <span className={styles.pill}>Comments</span>
          )}
        </div>

        <div className={styles.metaLine}>
          {subtitleParts.length > 0 && (
            <>
              <span className={styles.metaDot} aria-hidden>
                ⏱
              </span>
              <span className={styles.meta}>{subtitleParts.join(" • ")}</span>
              <span className={styles.metaSep}>•</span>
            </>
          )}

          <span className={styles.meta}>{dateLabel}</span>
        </div>
      </div>

      <Link to={md.link || "#"} className={styles.viewBtn}>
        View
      </Link>
    </div>
  );
}
