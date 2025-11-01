import React from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import styles from "./ProjectManagerEducatorView.module.css";
import NotificationComposer from "./ProjectManagerNotification";

const mockEducators = [
  {
    id: "t-001", name: "Alice Johnson", subject: "Mathematics", studentCount: 3, students: [
      { id: "s-101", name: "Jay", grade: "7", progress: 0.78 },
      { id: "s-102", name: "Kate", grade: "7", progress: 0.62 },
      { id: "s-103", name: "Sam", grade: "8", progress: 0.85 },
    ]
  },
  {
    id: "t-002", name: "Brian Lee", subject: "Science", studentCount: 2, students: [
      { id: "s-201", name: "Alina Gupta", grade: "6", progress: 0.54 },
      { id: "s-202", name: "Samir Khan", grade: "6", progress: 0.91 },
    ]
  },
  {
    id: "t-003", name: "John Doe", subject: "English", studentCount: 1, students: [
      { id: "s-301", name: "Ryan", grade: "7", progress: 0.73 },
    ]
  },
];

const api = axios.create({
  baseURL: process.env.REACT_APP_APIENDPOINT || "",
  withCredentials: true,
});

function getToken() {
  return localStorage.getItem("token");
}

async function fetchEducatorsAPI() {
  const token = getToken();
  const res = await api.get("/pm/educators", {
    headers: token ? { Authorization: token } : {},
  });
  const list = Array.isArray(res?.data?.data) ? res.data.data : [];
  return list.map((e) => ({
    id: e.id,
    name: e.name,
    subject: e.subject,
    studentCount: Number(e.studentCount ?? 0),
  }));
}

async function fetchStudentsAPI(educatorId) {
  const token = getToken();
  const res = await api.get(`/pm/educators/${encodeURIComponent(educatorId)}/students`, {
    headers: token ? { Authorization: token } : {},
  });
  return Array.isArray(res?.data?.data) ? res.data.data : [];
}

async function fetchEducators() {
  try { return await fetchEducatorsAPI(); }
  catch { await new Promise((r) => setTimeout(r, 200)); return mockEducators.map(({ students, ...rest }) => rest); }
}

async function fetchStudentsByEducator(educatorId) {
  try { return await fetchStudentsAPI(educatorId); }
  catch { await new Promise((r) => setTimeout(r, 150)); const edu = mockEducators.find((e) => e.id === educatorId); return edu ? edu.students : []; }
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

function EducatorRow({ educator, isExpanded, onToggle, studentQuery }) {
  const [loading, setLoading] = React.useState(false);
  const [students, setStudents] = React.useState([]);
  const [loaded, setLoaded] = React.useState(false);

  async function ensureLoaded() {
    if (!loaded) {
      setLoading(true);
      const data = await fetchStudentsByEducator(educator.id);
      setStudents(data);
      setLoading(false);
      setLoaded(true);
    }
  }

  async function handleToggle() {
    if (!isExpanded) await ensureLoaded();
    onToggle(educator.id);
  }

  const filteredStudents = React.useMemo(() => {
    const q = studentQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => s.name.toLowerCase().includes(q));
  }, [studentQuery, students]);

  return (
    <div className={styles.row}>
      <button
        type="button"
        className={styles.rowHeader}
        onClick={handleToggle}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleToggle(); } }}
        aria-expanded={isExpanded}
        aria-controls={`students-${educator.id}`}
      >
        <div className={styles.rowHeaderLeft}>
          <div className={styles.rowTitle}>{educator.name}</div>
          <div className={styles.meta}>{educator.subject}</div>
        </div>
        <div className={styles.rowHeaderRight}>
          <span className={styles.badge}>{educator.studentCount} students</span>
          <span className={styles.toggleText}>{isExpanded ? "Hide" : "View"}</span>
        </div>
      </button>

      {isExpanded && (
        <div id={`students-${educator.id}`} className={styles.studentsWrap}>
          {loading ? (
            <div className={styles.loadingText}>Loading students…</div>
          ) : filteredStudents.length === 0 ? (
            <div className={styles.emptyText}>{studentQuery ? "No students match this search." : "No students found."}</div>
          ) : (
            <div className={styles.students}>
              {filteredStudents.map((s) => <StudentCard key={s.id} s={s} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectManagerEducatorView() {
  const darkMode = useSelector((state) => state.theme?.darkMode);
  const [educators, setEducators] = React.useState([]);
  const [filtered, setFiltered] = React.useState([]);
  const [query, setQuery] = React.useState("");
  const [subject, setSubject] = React.useState("All");
  const [studentQuery, setStudentQuery] = React.useState("");
  const [expandedIds, setExpandedIds] = React.useState(new Set());
  const [showComposer, setShowComposer] = React.useState(false);
  const [lastSentInfo, setLastSentInfo] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const subjects = React.useMemo(() => {
    const s = new Set(mockEducators.map((e) => e.subject));
    return ["All", ...Array.from(s).sort()];
  }, []);

  React.useEffect(() => {
    (async () => {
      try { const data = await fetchEducators(); setEducators(data); setFiltered(data); }
      catch { setError("Failed to load educators"); }
      finally { setLoading(false); }
    })();
  }, []);

  React.useEffect(() => {
    const q = query.trim().toLowerCase();
    setFiltered(educators.filter((e) => {
      const matchText = e.name.toLowerCase().includes(q) || e.subject.toLowerCase().includes(q);
      const matchSubject = subject === "All" || e.subject === subject;
      return matchText && matchSubject;
    }));
  }, [query, subject, educators]);

  function toggleExpanded(id) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function expandAll() { setExpandedIds(new Set(filtered.map((e) => e.id))); }
  function collapseAll() { setExpandedIds(new Set()); }
  function handleOpenComposer() { setShowComposer(true); }
  function handleCloseComposer() { setShowComposer(false); }
  function handleSent(payload) {
    setLastSentInfo({ educatorCount: payload.educatorIds.length, timestamp: new Date().toISOString() });
    setShowComposer(false);
  }

  return (
    <div className={`${styles.container} ${darkMode ? styles.dark : ""}`}>
      <div className={styles.breadcrumb}>
        <span>Home</span><span className={styles.sep}>/</span><span>Project Manager</span>
      </div>

      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Project Manager Dashboard</h1>
          <p className={styles.subtitle}>View educators and their assigned students</p>
        </div>

        <div className={styles.toolbar}>
          <input
            type="text"
            placeholder="Search educators (name/subject)"
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search educators"
          />
          <select
            className={styles.select}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            aria-label="Filter by subject"
          >
            {subjects.map((subj) => <option key={subj} value={subj}>{subj}</option>)}
          </select>
          <input
            type="text"
            placeholder="Search students inside rows"
            className={styles.searchInput}
            value={studentQuery}
            onChange={(e) => setStudentQuery(e.target.value)}
            aria-label="Search students"
          />
          <button className={styles.ghostBtn} onClick={expandAll}>Expand all</button>
          <button className={styles.ghostBtn} onClick={collapseAll}>Collapse all</button>
          <button className={`${styles.primaryBtn} ${styles.pushRight}`} onClick={handleOpenComposer}>New Announcement</button>
        </div>
      </div>

      {lastSentInfo && (
        <div className={styles.successBanner} role="status">
          Sent to {lastSentInfo.educatorCount} educator{lastSentInfo.educatorCount === 1 ? "" : "s"} at {new Date(lastSentInfo.timestamp).toLocaleTimeString()}
        </div>
      )}

      <section className={styles.card} aria-label="Educators">
        <div className={styles.cardHeader}><h2 className={styles.cardTitle}>Educators</h2></div>
        <div className={styles.cardBody}>
          {loading && <div className={styles.loadingText}>Loading…</div>}
          {error && <div className={styles.errorText}>{error}</div>}
          {!loading && !error && filtered.length === 0 && <div className={styles.emptyText}>No educators match your search.</div>}
          {!loading && !error && filtered.length > 0 && (
            <div role="list" aria-label="Educator list">
              {filtered.map((e) => (
                <EducatorRow
                  key={e.id}
                  educator={e}
                  isExpanded={expandedIds.has(e.id)}
                  onToggle={toggleExpanded}
                  studentQuery={studentQuery}
                />
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
