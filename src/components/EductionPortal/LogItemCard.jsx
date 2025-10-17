import { Link } from "react-router-dom";
import styles from "./DailyLogPage.module.css";
import { FaEye, FaRegClock } from "react-icons/fa";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export default function LogItemCard({ row }) {
  const md = row?.metadata || {};
  const course = md.course || "Course";
  const duration = md.duration || "—";
  const date = formatDate(row.created_at);

  return (
    <div className={styles.row}>
      <div className={styles.left}>
        <div className={styles.title}>{course}</div>
        <div className={styles.metaLine}>
          <FaRegClock className={styles.metaIcon} />
          <span className={styles.meta}>{duration}</span>
          <span className={styles.metaSep}>•</span>
          <span className={styles.meta}>{date}</span>
        </div>
      </div>
      <Link
        to={{
          pathname: `/educationportal/time-logs/${row.entity_id?.replace("time-log-", "") || row.log_id}`,
          state: { log: row },
        }}
        className={styles.viewBtn}
      >
        <FaEye className={styles.eyeIcon} />
        &nbsp; View
      </Link>
    </div>
  );
}
