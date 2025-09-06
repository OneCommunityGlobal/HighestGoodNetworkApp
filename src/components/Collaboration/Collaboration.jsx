import { useEffect, useMemo, useRef, useState, useTransition, useId } from 'react';
import './Collaboration.css';
import { toast } from 'react-toastify';
import { ApiEndpoint } from '~/utils/URL';
import { useSelector } from 'react-redux';
import OneCommunityImage from '../../assets/images/logo2.png';
import { createPortal } from 'react-dom';

/* --------------------------- tiny utilities --------------------------- */

const useDebounce = (value, ms = 300) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
};

// super-light cache keyed by url; invalidated on page/category change
const responseCache = new Map();

/* --------------------------- subcomponents --------------------------- */

function SearchBar({ query, onChange, onSubmit, placeholder = 'Search by title...' }) {
  return (
    <form className="search-form" onSubmit={onSubmit} role="search" aria-label="Job search">
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={e => onChange(e.target.value)}
        aria-label="Search by job title"
      />
      <button className="btn btn-secondary" type="submit">
        Go
      </button>
    </form>
  );
}

function JobList({ jobAds, onViewDetails, onApply }) {
  if (!jobAds?.length) {
    return (
      <div className="no-results" role="status" aria-live="polite">
        <h2>No job ads found.</h2>
      </div>
    );
  }

  return (
    <div className="job-list">
      {jobAds.map(ad => (
        <div key={ad._id} className="job-ad">
          <img
            src={`/api/placeholder/640/480?text=${encodeURIComponent(
              ad.category || 'Job Opening',
            )}`}
            onError={e => {
              e.target.onerror = null;
              if (ad.category === 'Engineering') {
                e.target.src =
                  'https://img.icons8.com/external-prettycons-flat-prettycons/47/external-job-social-media-prettycons-flat-prettycons.png';
              } else if (ad.category === 'Marketing') {
                e.target.src =
                  'https://img.icons8.com/external-justicon-lineal-color-justicon/64/external-marketing-marketing-and-growth-justicon-1.png';
              } else if (ad.category === 'Design') {
                e.target.src = 'https://img.icons8.com/arcade/64/design.png';
              } else if (ad.category === 'Finance') {
                e.target.src = 'https://img.icons8.com/cotton/64/merchant-account--v2.png';
              } else {
                e.target.src = 'https://img.icons8.com/cotton/64/working-with-a-laptop--v1.png';
              }
            }}
            alt={ad.title || 'Job Position'}
            loading="lazy"
          />
          <a
            href={`https://www.onecommunityglobal.org/collaboration/seeking-${(
              ad.category || ''
            ).toLowerCase()}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h3>
              {ad.title} - {ad.category}
            </h3>
          </a>

          <div className="job-card-actions">
            <button className="btn btn-secondary" type="button" onClick={() => onViewDetails(ad)}>
              View Details
            </button>
            <button className="btn btn-primary" type="button" onClick={() => onApply(ad)}>
              Apply
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Pagination({ totalPages, currentPage, onChange }) {
  if (!totalPages || totalPages < 2) return null;
  return (
    <div className="pagination" role="navigation" aria-label="Pagination">
      {Array.from({ length: totalPages }, (_, i) => {
        const page = i + 1;
        return (
          <button
            type="button"
            key={page}
            onClick={() => onChange(page)}
            disabled={currentPage === page}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}
    </div>
  );
}

const FORM_HEADER_ROWS = [
  [
    { name: 'name', placeholder: 'name', type: 'text' },
    { name: 'email', placeholder: 'email', type: 'email' },
    { name: 'company', placeholder: 'Company & Position', type: 'text' },
  ],
  [
    { name: 'location', placeholder: 'Location & Timezone', type: 'text' },
    { name: 'phone', placeholder: 'Phone Number', type: 'text' },
    { name: 'website', placeholder: 'Primary Website/ Social', type: 'text' },
  ],
];

const QUESTIONS = [
  'How did you hear about One Community?',
  'Are you applying as an individual or organization?',
  'Why are you wanting to volunteer/work/collaborate with us?',
  'What skills/experience do you possess?',
  'How many volunteer hours per week are you willing to commit to?',
  'For how long do you wish to volunteer with us?',
];

/* ------------------------ Rich “Learn More” modal ------------------------ */
/** Inline styles are provided as a fallback to guarantee visibility even if CSS is missing/overridden. */
/* -------------------- modal helpers -------------------- */
const toList = val => {
  if (!val) return [];
  if (Array.isArray(val))
    return val
      .map(String)
      .map(s => s.trim())
      .filter(Boolean);
  // Accept newline or bullet-prefixed text (•, -, *)
  return String(val)
    .split(/\r?\n|[\u2022•]|^\s*-\s+|^\s*\*\s+/gm)
    .map(s => s.trim())
    .filter(Boolean);
};

const firstVal = (obj, keys) => {
  for (const k of keys) {
    if (obj && obj[k] != null && String(obj[k]).trim() !== '') return obj[k];
  }
  return null;
};

const isReactish = ad =>
  /\b(react|mern|frontend)\b/i.test(`${ad?.title || ''} ${ad?.category || ''}`);

const buildSections = ad => {
  const reqTitle = isReactish(ad) ? 'React.js Position Requirements:' : 'Position Requirements:';
  const groups = [
    { title: 'Role Responsibilities', keys: ['responsibilities', 'whatYoullDo', 'expectations'] },
    {
      title: reqTitle,
      keys: ['requirements', 'positionRequirements', 'required', 'mustHave', 'reactRequirements'],
    },
    {
      title: 'Additional Beneficial Qualifications:',
      keys: ['qualifications', 'beneficialQualifications', 'niceToHave', 'preferred'],
    },
    {
      title: 'Availability & Commitment',
      keys: ['commitment', 'availability', 'hours', 'timeRequirements'],
    },
    { title: 'Tech / Tools We Use', keys: ['stack', 'techStack', 'tools', 'technologies'] },
    { title: 'Benefits & What You’ll Gain', keys: ['benefits', 'perks'] },
  ];

  return groups
    .map(g => ({ title: g.title, items: toList(firstVal(ad, g.keys)) }))
    .filter(sec => sec.items.length > 0);
};

function DescModal({ ad, onClose }) {
  if (!ad) return null;

  // --- derive heading: "Seeking Experienced {Job Name}" ---
  const stripPrefix = s =>
    String(s || '')
      .replace(/^seeking\s+experienced\s+/i, '')
      .trim();
  const jobName = stripPrefix(ad.title || ad.category || 'Position');
  const heading = `Seeking Experienced ${jobName}`;

  // rich HTML from API (optional)
  const html = ad.longHtml || ad.html;

  // One Community blurb (can be overridden by backend via ad.aboutOneCommunity)
  const aboutOneCommunity =
    ad.aboutOneCommunity ||
    `One Community is a 100%-volunteer global sustainability organization. We're a software team of over 100 developers working on the 5 phases of this open source team management software: ` +
      `<a href="https://www.onecommunityglobal.org/highest-good-network/" target="_blank" rel="noopener noreferrer">www.onecommunityglobal.org/highest-good-network/</a>`;

  // build content groups (Requirements, Responsibilities, etc.)
  const sections = buildSections(ad);

  // --- styles (kept inline for resilience) ---
  const outerStyle = {
    position: 'fixed',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    zIndex: 9999,
  };
  const backdropStyle = { position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)' };
  const cardStyle = {
    position: 'relative',
    zIndex: 1,
    width: 'min(92vw, 1100px)',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--surface,#fff)',
    color: 'var(--text,#111)',
    border: '1px solid var(--ring,#e5e7eb)',
    borderRadius: 'var(--radius,12px)',
    boxShadow: 'var(--shadow,0 6px 16px rgba(0,0,0,.18))',
    padding: 'var(--space-5,20px)',
  };
  const bodyStyle = { flex: 1, overflow: 'auto', paddingRight: 8 };
  const chipRowStyle = { display: 'flex', flexWrap: 'wrap', gap: 8, margin: '8px 0 12px' };
  const chipStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: 999,
    border: '1px solid var(--ring,#e5e7eb)',
    background: 'var(--card,#f7f7f9)',
    fontSize: 12,
  };
  const sectionStyle = { marginBottom: 16 };
  const listStyle = { paddingLeft: '1.25rem', margin: '8px 0 16px' };

  const Section = ({ title, items }) =>
    items?.length ? (
      <section style={sectionStyle}>
        <h4>{title}</h4>
        <ul style={listStyle}>
          {items.map((it, idx) => (
            <li key={idx}>{it}</li>
          ))}
        </ul>
      </section>
    ) : null;

  const onBackdropKey = e => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      onClose();
    }
  };

  // Meta chips under title
  const chips = [];
  if (ad.category) chips.push(ad.category);
  if (ad.location) chips.push(ad.location);
  if (ad.timezone) chips.push(ad.timezone);
  const hours = ad.commitmentHours || ad.hours;
  if (hours) chips.push(`${hours} hrs/wk`);
  if (ad.datePosted) {
    try {
      chips.push(new Date(ad.datePosted).toLocaleDateString());
    } catch {}
  }

  const detailsLink =
    ad.jobDetailsLink ||
    (ad.category &&
      `https://www.onecommunityglobal.org/collaboration/seeking-${(
        ad.category || ''
      ).toLowerCase()}`);

  return (
    <div
      className="modal"
      style={outerStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="modal__backdrop"
        style={backdropStyle}
        onClick={onClose}
        role="button"
        tabIndex={0}
        aria-label="Close dialog"
        onKeyDown={onBackdropKey}
      />
      <div
        id="job-learnmore-modal"
        className="modal__card modal__card--xl"
        style={cardStyle}
        tabIndex={-1}
        role="document"
      >
        <header className="modal__header modal__header--stack">
          <h2 id="modal-title" className="modal__title">
            {heading}
          </h2>

          {chips.length > 0 && (
            <div className="modal__meta" aria-label="Job meta">
              {chips.map((c, i) => (
                <span key={i} className="chip">
                  {c}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="modal__body modal__body--scroll" style={bodyStyle}>
          {/* One Community blurb immediately under the heading */}
          <p className="modal__about" dangerouslySetInnerHTML={{ __html: aboutOneCommunity }} />

          {/* If backend supplies rich HTML, show it after the intro */}
          {html && (
            <article className="modal__article" dangerouslySetInnerHTML={{ __html: html }} />
          )}

          {/* Fallback role description if no HTML */}
          {!html && ad.description && (
            <article className="modal__article">
              <h4>About the role</h4>
              <p>{ad.description}</p>
            </article>
          )}

          {/* Auto-built sections (Requirements, Responsibilities, etc.) */}
          {sections.map((s, i) => (
            <section key={i} className="modal__section">
              <h4>{s.title}</h4>
              <ul>
                {s.items.map((it, idx) => (
                  <li key={idx}>{it}</li>
                ))}
              </ul>
            </section>
          ))}

          {/* Image grid + details link (unchanged) */}
          {Array.isArray(ad.images) && ad.images.length > 0 && (
            <div className="modal__image-grid">
              {ad.images.map((src, i) => (
                <img key={i} src={src} alt={`${ad.title || 'Position'} visual ${i + 1}`} />
              ))}
            </div>
          )}
        </div>

        <footer className="modal__footer">
          <button className="btn btn-primary" type="button" onClick={onClose}>
            Got it
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ------------------------- ModalMount (portal) ------------------------- */
function ModalMount({ show, ad, onClose }) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => {
      const el = document.getElementById('job-learnmore-modal');
      el?.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [show]);

  if (!show || !ad) return null;
  return createPortal(<DescModal ad={ad} onClose={onClose} />, document.body);
}

/* ------------------------------ Application form ------------------------------ */

function ApplicationForm({ chosenAd, onBack, onOpenModal }) {
  const idPrefix = useId();

  const isSoftwareEngineer =
    /\bsoftware\s*engineer\b/i.test(chosenAd.title || '') ||
    /\b(frontend|full[-\s]?stack|mern)\b/i.test(chosenAd.title || '') ||
    /\bengineering?\b/i.test(chosenAd.category || '');

  return (
    <section className="apply-card" aria-labelledby="apply-card-title">
      <div className="apply-card__titlebar">
        <h2 id="apply-card-title" className="apply-card__title">
          FORM FOR {chosenAd.title?.toUpperCase()} POSITION
        </h2>
        <button className="apply-card__link" type="button" onClick={onOpenModal}>
          click to know more about this position
        </button>
      </div>

      {FORM_HEADER_ROWS.map((row, idx) => (
        <div key={idx} className="grid grid--3">
          {row.map(f => (
            <input
              key={f.name}
              className="input"
              type={f.type}
              placeholder={f.placeholder}
              aria-label={f.placeholder}
            />
          ))}
        </div>
      ))}

      <ol className="qa-list">
        {QUESTIONS.map((q, i) => {
          const qId = `${idPrefix}-q-${i}`;
          return (
            <li key={i}>
              <label htmlFor={qId}>{q}</label>
              <input
                id={qId}
                className="input"
                type="text"
                placeholder="type your response here"
                aria-label={q}
              />
            </li>
          );
        })}

        <li className="qa-row qa-row--inline">
          <div>
            <label htmlFor={`${idPrefix}-desired-start`}>What is your desired start date?</label>
            <input
              id={`${idPrefix}-desired-start`}
              className="input"
              type="date"
              placeholder="mm/dd/yy"
              aria-label="Desired start date"
            />
          </div>
          <div>
            <label htmlFor={`${idPrefix}-doc-hours`}>
              Will your volunteer time require documentation of your hours?
            </label>
            <select
              id={`${idPrefix}-doc-hours`}
              className="input"
              aria-label="Documentation of hours"
            >
              <option value="">Select an appropriate option</option>
              <option>No, I’m volunteering because I want to</option>
              <option>Yes, I’m on OPT and have my EAD Card</option>
              <option>Yes, I’m on OPT but don’t yet have my EAD Card</option>
              <option>Yes, I’m looking to use this for CPT, Co-Op, or similar</option>
              <option>STEM OPT: Sorry, we are 100% volunteer and don’t qualify</option>
            </select>
          </div>
        </li>

        {isSoftwareEngineer && (
          <>
            <li>
              <label htmlFor={`${idPrefix}-fe-rating`}>
                On a scale of 1-10, ten being the highest, how would you rate your frontend skills?
                Please explain, including how long you have worked with React.js and what got you
                started/interested in React.js.
              </label>
              <div className="qa-row qa-row--inline">
                <input
                  id={`${idPrefix}-fe-rating`}
                  className="input input--short"
                  type="number"
                  min="1"
                  max="10"
                  defaultValue="1"
                  aria-label="Frontend skill rating from 1 to 10"
                />
                <input
                  className="input"
                  type="text"
                  placeholder="type your response here"
                  aria-label="Frontend experience explanation"
                />
              </div>
            </li>

            <li>
              <label htmlFor={`${idPrefix}-be-rating`}>
                On a scale of 1-10, ten being the highest, how would you rate your backend skills?
                Please explain.
              </label>
              <div className="qa-row qa-row--inline">
                <input
                  id={`${idPrefix}-be-rating`}
                  className="input input--short"
                  type="number"
                  min="1"
                  max="10"
                  defaultValue="1"
                  aria-label="Backend skill rating from 1 to 10"
                />
                <input
                  className="input"
                  type="text"
                  placeholder="type your response here"
                  aria-label="Backend experience explanation"
                />
              </div>
            </li>

            <li>
              <label htmlFor={`${idPrefix}-pr-review`}>
                Do you have PR review experience? (If yes, please explain)
              </label>
              <input
                id={`${idPrefix}-pr-review`}
                className="input"
                type="text"
                placeholder="type your response here"
                aria-label="PR review experience"
              />
            </li>
          </>
        )}
      </ol>

      <div className="apply-card__actions">
        <button className="btn btn-secondary btn--ghost" type="button" onClick={onBack}>
          Back
        </button>
        <button className="btn btn-primary" type="button">
          Proceed to submit with details
        </button>
      </div>

      <div className="learn-more">
        <button
          type="button"
          className="learn-more__link"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onOpenModal();
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenModal();
            }
          }}
          aria-haspopup="dialog"
          aria-controls="job-learnmore-modal"
          aria-label={`Learn more about the ${chosenAd.title} position`}
        >
          Learn more about the {chosenAd.title} position
        </button>
      </div>
    </section>
  );
}

/* ------------------------------ main ------------------------------ */

function Collaboration() {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [category, setCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [jobAds, setJobAds] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [categories, setCategories] = useState([]);
  const [summaries, setSummaries] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(null);

  const [chosenAd, setChosenAd] = useState(null);
  const [showDescModal, setShowDescModal] = useState(false);
  const [applyDropValue, setApplyDropValue] = useState('');

  const darkMode = useSelector(state => state.theme.darkMode);
  const [isPending, startTransition] = useTransition(); // eslint-disable-line no-unused-vars

  // eslint-disable-next-line no-unused-vars
  const debouncedQuery = useDebounce(query, 250); // kept for future live-search wiring

  useEffect(() => {
    const tooltipDismissed = localStorage.getItem('tooltipDismissed');
    if (!tooltipDismissed) {
      setShowTooltip(true);
      setTooltipPosition('search');
    }
  }, []);

  const controllerRef = useRef(null);

  const fetchJobAds = async (givenQuery, givenCategory) => {
    const adsPerPage = 20;
    const url = `${ApiEndpoint}/jobs?page=${currentPage}&limit=${adsPerPage}&search=${givenQuery}&category=${givenCategory}`;

    if (responseCache.has(url)) {
      const cached = responseCache.get(url);
      setJobAds(cached.jobs);
      setTotalPages(cached.pagination.totalPages);
      return;
    }

    controllerRef.current?.abort?.();
    const ctrl = new AbortController();
    controllerRef.current = ctrl;

    try {
      const res = await fetch(url, { method: 'GET', signal: ctrl.signal });
      if (!res.ok) throw new Error(`Failed to fetch jobs: ${res.statusText}`);
      const data = await res.json();
      responseCache.set(url, data);
      setJobAds(data.jobs);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      if (err.name !== 'AbortError') toast.error('Error fetching jobs');
    }
  };

  const fetchCategories = async () => {
    const url = `${ApiEndpoint}/jobs/categories`;
    try {
      if (responseCache.has(url)) {
        const data = responseCache.get(url);
        setCategories(data.categories.sort((a, b) => a.localeCompare(b)));
        return;
      }
      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) throw new Error(`Failed to fetch categories: ${res.statusText}`);
      const data = await res.json();
      responseCache.set(url, data);
      setCategories((data.categories || []).sort((a, b) => a.localeCompare(b)));
    } catch (error) {
      toast.error('Error fetching categories');
    }
  };

  useEffect(() => {
    fetchJobAds(searchTerm || '', selectedCategory || '');
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => () => controllerRef.current?.abort?.(), []);

  const handleSearchInput = val => {
    setQuery(val);
    if (!selectedCategory && !localStorage.getItem('tooltipDismissed')) {
      setTooltipPosition('category');
      setShowTooltip(true);
    }
  };

  const normalize = s => (s || '').trim().toLowerCase();

  const findAdByExactTitle = title => {
    const t = normalize(title);
    if (!t) return null;
    return jobAds.find(ad => normalize(ad?.title) === t) || null;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const exact = findAdByExactTitle(query);
    if (exact) {
      setChosenAd(exact);
      setShowSearchResults(false);
      setSummaries(null);
      return;
    }
    setSearchTerm(query);
    setSelectedCategory(category);
    setShowSearchResults(true);
    setSummaries(null);
    setCurrentPage(1);
    responseCache.clear();
    fetchJobAds(query, category);
  };

  const handleCategoryChange = val => {
    setCategory(val);
    if (!searchTerm && !localStorage.getItem('tooltipDismissed')) {
      setTooltipPosition('search');
      setShowTooltip(true);
    }
  };

  const handleRemoveQuery = () => {
    setQuery('');
    setSearchTerm('');
    responseCache.clear();
    fetchJobAds('', category);
  };

  const handleRemoveCategory = () => {
    setCategory('');
    setSelectedCategory('');
    responseCache.clear();
    fetchJobAds(query, '');
  };

  const handleShowSummaries = async () => {
    const url = `${ApiEndpoint}/jobs/summaries?search=${searchTerm}&category=${selectedCategory}`;
    try {
      if (responseCache.has(url)) {
        setSummaries(responseCache.get(url));
        return;
      }
      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) throw new Error(`Failed to fetch summaries: ${response.statusText}`);
      const data = await response.json(); // fixed
      responseCache.set(url, data);
      setSummaries(data);
    } catch (error) {
      toast.error('Error fetching summaries');
    }
  };

  const dismissCategoryTooltip = () => {
    setShowTooltip(false);
    localStorage.setItem('tooltipDismissed', 'true');
  };
  const dismissSearchTooltip = () => setTooltipPosition('category');

  const applyOptions = useMemo(() => {
    return (jobAds || []).map(ad => ({ value: ad._id, label: ad.title || 'Untitled' }));
  }, [jobAds]);

  const onApplyChange = id => {
    setApplyDropValue(id);
    const ad = jobAds.find(j => j._id === id);
    if (ad) {
      setChosenAd(ad);
      setShowSearchResults(false);
      setSummaries(null);
    }
  };

  const onViewDetails = ad => {
    setChosenAd(ad);
    setShowDescModal(true);
  };

  const onApply = ad => {
    startTransition(() => {
      setChosenAd(ad);
      setShowSearchResults(false);
      setSummaries(null);
    });
  };

  const exitApplicationForm = () => {
    setChosenAd(null);
  };

  // Keep scroll lock & Escape handling centralized here
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (showDescModal) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = previousOverflow || '';
    const onKeyDown = e => {
      if (e.key === 'Escape' && showDescModal) setShowDescModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow || '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [showDescModal]);

  // SAFER open: only open if there’s a selected ad
  const openModalSafe = () => {
    if (chosenAd) setShowDescModal(true);
  };

  // Pre-construct the portal; will render outside the chosenAd conditional
  const ModalPortal = (
    <ModalMount show={showDescModal} ad={chosenAd} onClose={() => setShowDescModal(false)} />
  );

  if (summaries) {
    return (
      <div className={`job-landing ${darkMode ? 'user-collaboration-dark-mode' : ''}`}>
        <div className="job-header">
          <a
            href="https://www.onecommunityglobal.org/collaboration/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={OneCommunityImage} alt="One Community Logo" />
          </a>
        </div>

        <div className="user-collaboration-container">
          <nav className="job-navbar job-navbar--hero" aria-label="Job search bar">
            <div className="job-navbar-left">
              <SearchBar
                query={query}
                onChange={handleSearchInput}
                onSubmit={handleSubmit}
                placeholder="Enter Job Title"
              />
              {showTooltip && tooltipPosition === 'search' && (
                <div className="job-tooltip">
                  <p>Use the search bar to refine your search further!</p>
                  <button
                    type="button"
                    className="job-tooltip-dismiss"
                    onClick={dismissSearchTooltip}
                  >
                    Got it
                  </button>
                </div>
              )}
            </div>

            <div className="job-navbar-right">
              {applyOptions.length > 0 && (
                <select
                  className="job-select apply-select hero-apply"
                  value={applyDropValue}
                  onChange={e => onApplyChange(e.target.value)}
                  aria-label="Apply to a position"
                >
                  <option value="" disabled>
                    Select a position
                  </option>
                  {applyOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </nav>

          <div className="category-inline">
            <select
              className="job-select"
              value={category}
              onChange={e => handleCategoryChange(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="">Select from Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {showTooltip && tooltipPosition === 'category' && (
              <div className="job-tooltip category-tooltip">
                <p>Use the categories to refine your search further!</p>
                <button
                  type="button"
                  className="job-tooltip-dismiss"
                  onClick={dismissCategoryTooltip}
                >
                  Got it
                </button>
              </div>
            )}
          </div>

          <div className="job-queries">
            {searchTerm.length !== 0 || selectedCategory.length !== 0 ? (
              <p className="job-query">
                Listing results for
                {searchTerm && !selectedCategory && <strong> &apos;{searchTerm}&apos;</strong>}
                {selectedCategory && !searchTerm && (
                  <strong> &apos;{selectedCategory}&apos;</strong>
                )}
                {searchTerm && selectedCategory && (
                  <strong>
                    {' '}
                    &apos;{searchTerm} + {selectedCategory}&apos;
                  </strong>
                )}
                .
              </p>
            ) : (
              <p className="job-query">Listing all job ads.</p>
            )}
            <button
              className="btn btn-secondary active"
              type="button"
              onClick={() => {
                setSummaries(null);
                setShowSearchResults(true);
              }}
            >
              Show Summaries
            </button>
            {searchTerm && (
              <div className="query-option btn btn-secondary " type="button">
                <span>{searchTerm}</span>
                <button
                  className="cross-button"
                  type="button"
                  onClick={handleRemoveQuery}
                  aria-label="Clear search term"
                >
                  <img
                    width="30"
                    height="30"
                    src="https://img.icons8.com/ios-glyphs/30/delete-sign.png"
                    alt=""
                  />
                </button>
              </div>
            )}
            {selectedCategory && (
              <div className="btn btn-secondary query-option" type="button">
                {selectedCategory}
                <button
                  className="cross-button"
                  type="button"
                  onClick={handleRemoveCategory}
                  aria-label="Clear category filter"
                >
                  <img
                    width="30"
                    height="30"
                    src="https://img.icons8.com/ios-glyphs/30/delete-sign.png"
                    alt=""
                  />
                </button>
              </div>
            )}
          </div>

          <div className="jobs-summaries-list">
            {summaries && summaries.jobs && summaries.jobs.length > 0 ? (
              summaries.jobs.map(summary => (
                <div key={summary._id} className="job-summary-item">
                  <h3>
                    <a href={summary.jobDetailsLink} target="_blank" rel="noopener noreferrer">
                      {summary.title}
                    </a>
                  </h3>
                  <div className="job-summary-content">
                    <p>{summary.description}</p>
                    <p>Date Posted: {new Date(summary.datePosted).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No summaries found.</p>
            )}
          </div>
        </div>

        {/* Modal portal rendered OUTSIDE all conditionals */}
        {ModalPortal}
      </div>
    );
  }

  return (
    <div className={`job-landing ${darkMode ? 'user-collaboration-dark-mode' : ''}`}>
      <div className="job-header">
        <a
          href="https://www.onecommunityglobal.org/collaboration/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={OneCommunityImage} alt="One Community Logo" />
        </a>
      </div>

      <div className="user-collaboration-container">
        <nav className="job-navbar job-navbar--hero" aria-label="Job search bar">
          <div className="job-navbar-left">
            <SearchBar
              query={query}
              onChange={handleSearchInput}
              onSubmit={handleSubmit}
              placeholder="Enter Job Title"
            />
            {showTooltip && tooltipPosition === 'search' && (
              <div className="job-tooltip">
                <p>Use the search bar to refine your search further!</p>
                <button
                  type="button"
                  className="job-tooltip-dismiss"
                  onClick={dismissSearchTooltip}
                >
                  Got it
                </button>
              </div>
            )}
          </div>

          <div className="job-navbar-right">
            {applyOptions.length > 0 && (
              <select
                className="job-select apply-select hero-apply"
                value={applyDropValue}
                onChange={e => onApplyChange(e.target.value)}
                aria-label="Apply to a position"
              >
                <option value="" disabled>
                  Select a position
                </option>
                {applyOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </nav>

        <div className="category-inline">
          <select
            className="job-select"
            value={category}
            onChange={e => handleCategoryChange(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="">Select from Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {showTooltip && tooltipPosition === 'category' && (
            <div className="job-tooltip category-tooltip">
              <p>Use the categories to refine your search further!</p>
              <button
                type="button"
                className="job-tooltip-dismiss"
                onClick={dismissCategoryTooltip}
              >
                Got it
              </button>
            </div>
          )}
        </div>

        {chosenAd ? (
          <>
            <ApplicationForm
              chosenAd={chosenAd}
              onBack={exitApplicationForm}
              onOpenModal={openModalSafe}
            />
          </>
        ) : (
          <>
            {showSearchResults ? (
              <div>
                <div className="job-queries">
                  {searchTerm.length !== 0 || selectedCategory.length !== 0 ? (
                    <p className="job-query">
                      Listing results for
                      {searchTerm && !selectedCategory && (
                        <strong> &apos;{searchTerm}&apos;</strong>
                      )}
                      {selectedCategory && !searchTerm && (
                        <strong> &apos;{selectedCategory}&apos;</strong>
                      )}
                      {searchTerm && selectedCategory && (
                        <strong>
                          {' '}
                          &apos;{searchTerm} + {selectedCategory}&apos;
                        </strong>
                      )}
                      .
                    </p>
                  ) : (
                    <p className="job-query">Listing all job ads.</p>
                  )}
                  <button className="btn btn-secondary" type="button" onClick={handleShowSummaries}>
                    Show Summaries
                  </button>
                  {searchTerm && (
                    <div className="query-option btn btn-secondary " type="button">
                      <span>{searchTerm}</span>
                      <button
                        className="cross-button"
                        type="button"
                        onClick={handleRemoveQuery}
                        aria-label="Clear search term"
                      >
                        <img
                          width="30"
                          height="30"
                          src="https://img.icons8.com/ios-glyphs/30/delete-sign.png"
                          alt=""
                        />
                      </button>
                    </div>
                  )}
                  {selectedCategory && (
                    <div className="btn btn-secondary query-option" type="button">
                      {selectedCategory}
                      <button
                        className="cross-button"
                        type="button"
                        onClick={handleRemoveCategory}
                        aria-label="Clear category filter"
                      >
                        <img
                          width="30"
                          height="30"
                          src="https://img.icons8.com/ios-glyphs/30/delete-sign.png"
                          alt=""
                        />
                      </button>
                    </div>
                  )}
                </div>

                <JobList jobAds={jobAds} onViewDetails={onViewDetails} onApply={onApply} />

                <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onChange={p => setCurrentPage(p)}
                />
              </div>
            ) : (
              <div className={`job-headings ${darkMode ? ' user-collaboration-dark-mode' : ''}`}>
                <h1 className="job-head">Like to Work With Us? Apply Now!</h1>
                <p className="job-intro"> Learn about who we are and who we want to work with!</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal portal rendered OUTSIDE all conditionals */}
      {ModalPortal}
    </div>
  );
}

export default Collaboration;
