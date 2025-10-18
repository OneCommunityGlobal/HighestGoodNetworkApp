import React from "react";
import styles from "./ProjectManagerEducatorView.module.css";
import NotificationComposer from "./ProjectManagerNotification";

const mockEducators = [
  {
    id: "t-001",
    name: "Alice Johnson",
    subject: "Mathematics",
    studentCount: 3,
    students: [
      { id: "s-101", name: "Jay", grade: "7", progress: 0.78 },
      { id: "s-102", name: "Kate", grade: "7", progress: 0.62 },
      { id: "s-103", name: "Sam", grade: "8", progress: 0.85 },
    ],
  },
  {
    id: "t-002",
    name: "Brian Lee",
    subject: "Science",
    studentCount: 2,
    students: [
      { id: "s-201", name: "Alina Gupta", grade: "6", progress: 0.54 },
      { id: "s-202", name: "Samir Khan", grade: "6", progress: 0.91 },
    ],
  },
  {
    id: "t-003",
    name: "John Doe",
    subject: "English",
    studentCount: 1,
    students: [{ id: "s-301", name: "Ryan", grade: "7", progress: 0.73 }],
  },
];

async function fetchEducators() {
  await new Promise((r) => setTimeout(r, 250));
  return mockEducators.map(({ students, ...rest }) => rest);
}

async function fetchStudentsByEducator(educatorId) {
  await new Promise((r) => setTimeout(r, 200));
  const edu = mockEducators.find((e) => e.id === educatorId);
  return edu ? edu.students : [];
}

function StudentCard({ s }) {
  const pct = Math.round((s.progress ?? 0) * 100);
  return (
    <div className={styles.studentCard}>
      <div className={styles.studentName}>{s.name}</div>
      <div className={styles.meta}>Grade {s.grade}</div>
      <div className={styles.progressWrap}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        </div>
        <div className={styles.progressPct}>{pct}%</div>
      </div>
    </div>
  );
}

function EducatorRow({ educator }) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [students, setStudents] = React.useState([]);

  async function toggle() {
    if (!open && students.length === 0) {
      setLoading(true);
      const data = await fetchStudentsByEducator(educator.id);
      setStudents(data);
      setLoading(false);
    }
    setOpen((v) => !v);
  }

  return (
    <div className={styles.row}>
      <button
        type="button"
        className={styles.rowHeader}
        onClick={toggle}
        aria-expanded={open}
        aria-controls={`students-${educator.id}`}
      >
        <div className={styles.rowHeaderLeft}>
          <div className={styles.rowTitle}>{educator.name}</div>
          <div className={styles.meta}>{educator.subject}</div>
        </div>
        <div className={styles.rowHeaderRight}>
          <span className={styles.badge}>{educator.studentCount} students</span>
          <span className={styles.toggleText}>{open ? "Hide" : "View"}</span>
        </div>
      </button>

      {open && (
        <div id={`students-${educator.id}`} className={styles.studentsWrap}>
          {loading ? (
            <div className={styles.loadingText}>Loading students…</div>
          ) : (
            <div className={styles.students}>
              {students.map((s) => (
                <StudentCard key={s.id} s={s} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectManagerEducatorView() {
  const [educators, setEducators] = React.useState([]);
  const [filtered, setFiltered] = React.useState([]);
  const [query, setQuery] = React.useState("");
  const [showComposer, setShowComposer] = React.useState(false);
  const [lastSentInfo, setLastSentInfo] = React.useState(null);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        const data = await fetchEducators();
        setEducators(data);
        setFiltered(data);
      } catch (e) {
        setError("Failed to load educators");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  React.useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setFiltered(educators);
    } else {
      setFiltered(
        educators.filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.subject.toLowerCase().includes(q)
        )
      );
    }
  }, [query, educators]);

  function handleOpenComposer() {
    setShowComposer(true);
  }
  function handleCloseComposer() {
    setShowComposer(false);
  }
  function handleSent(payload) {
    setLastSentInfo({
      educatorCount: payload.educatorIds.length,
      timestamp: new Date().toISOString(),
    });
    setShowComposer(false);
  }

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <span>Home</span>
        <span className={styles.sep}>/</span>
        <span>Project Manager</span>
      </div>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Project Manager Dashboard</h1>
        </div>
        <div className={styles.toolbar}>
          <input
            type="text"
            placeholder="Search educators by name or subject"
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search educators"
          />
          <button className={styles.primaryBtn} onClick={handleOpenComposer}>
            New Announcement
          </button>
        </div>
      </div>

      {lastSentInfo && (
        <div className={styles.successBanner} role="status">
          Sent to {lastSentInfo.educatorCount} educator
          {lastSentInfo.educatorCount === 1 ? "" : "s"} at{" "}
          {new Date(lastSentInfo.timestamp).toLocaleTimeString()}
        </div>
      )}

      <section className={styles.card} aria-label="Educators">
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Educators</h2>
        </div>
        <div className={styles.cardBody}>
          {loading && <div className={styles.loadingText}>Loading…</div>}
          {error && <div className={styles.errorText}>{error}</div>}
          {!loading && !error && filtered.length === 0 && (
            <div className={styles.emptyText}>No educators match your search.</div>
          )}
          {!loading && !error && filtered.length > 0 && (
            <div role="list" aria-label="Educator list">
              {filtered.map((e) => (
                <EducatorRow key={e.id} educator={e} />
              ))}
            </div>
          )}
        </div>
      </section>

      {showComposer && (
        <NotificationComposer
          educators={educators}
          onClose={handleCloseComposer}
          onSent={handleSent}
        />
      )}
    </div>
  );
}
