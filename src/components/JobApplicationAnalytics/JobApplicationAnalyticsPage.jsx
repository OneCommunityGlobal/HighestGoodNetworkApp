import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import AnalyticsSummaryCards from './AnalyticsSummaryCards';
import ApplicationsTable from './ApplicationsTable';
import styles from './JobApplicationAnalytics.module.css';

const ALLOWED_ROLES = new Set(['Owner', 'Administrator']);

const DEFAULT_FILTERS = {
  q: '',
  formId: '',
  from: '',
  to: '',
};

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.breakdown)) return payload.breakdown;
  if (Array.isArray(payload?.sources)) return payload.sources;
  return [];
}

function JobApplicationAnalyticsPage() {
  const darkMode = useSelector(state => state.theme?.darkMode);
  const role = useSelector(state => state.auth?.user?.role);
  const canAccess = ALLOWED_ROLES.has(role);

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState('');
  const [experienceBreakdown, setExperienceBreakdown] = useState(null);
  const [applicantSources, setApplicantSources] = useState(null);
  const [experienceError, setExperienceError] = useState('');
  const [sourcesError, setSourcesError] = useState('');

  const [forms, setForms] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [list, setList] = useState({ items: [], total: 0, limit: 25 });
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError('');
    try {
      const { data } = await axios.get(ENDPOINTS.JOB_APPLICATIONS_SUMMARY);
      setSummary(data);
    } catch (err) {
      // Summary cards are non-blocking; CRM table still loads if this fails.
      setSummary(null);
      setSummaryError(
        err?.response?.data?.message || 'Unable to load overview analytics right now.',
      );
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const loadOptionalAnalytics = useCallback(async () => {
    const softGet = async (url, setError) => {
      try {
        const { data } = await axios.get(url, { skipGlobalErrorToast: true });
        setError('');
        return normalizeList(data);
      } catch (err) {
        setError(err?.response?.data?.message || err?.response?.data?.error || '');
        return null;
      }
    };

    const [experience, sources] = await Promise.all([
      softGet(ENDPOINTS.JOB_ANALYTICS_EXPERIENCE_BREAKDOWN, setExperienceError),
      softGet(ENDPOINTS.APPLICANT_SOURCES, setSourcesError),
    ]);

    if (experience) setExperienceBreakdown(experience);
    if (sources) setApplicantSources(sources);
  }, []);

  const loadForms = useCallback(async () => {
    try {
      const { data } = await axios.get(ENDPOINTS.GET_ALL_JOB_FORMS);
      setForms(data?.forms || data || []);
    } catch {
      setForms([]);
    }
  }, []);

  const loadApplications = useCallback(async () => {
    setListLoading(true);
    setListError('');
    try {
      const { data } = await axios.get(
        ENDPOINTS.JOB_APPLICATIONS_LIST({
          page,
          limit: 25,
          q: appliedFilters.q,
          formId: appliedFilters.formId,
          from: appliedFilters.from,
          to: appliedFilters.to,
        }),
      );
      setList({
        items: data?.items || [],
        total: data?.total || 0,
        limit: data?.limit || 25,
      });
    } catch (err) {
      setList({ items: [], total: 0, limit: 25 });
      setListError(
        err?.response?.data?.message || 'Unable to load job applications. Please try again.',
      );
    } finally {
      setListLoading(false);
    }
  }, [appliedFilters, page]);

  useEffect(() => {
    if (!canAccess) return undefined;
    loadSummary();
    loadOptionalAnalytics();
    loadForms();
    return undefined;
  }, [canAccess, loadSummary, loadOptionalAnalytics, loadForms]);

  useEffect(() => {
    if (!canAccess) return undefined;
    loadApplications();
    return undefined;
  }, [canAccess, loadApplications]);

  if (!canAccess) {
    return (
      <div className={`${styles.page} ${darkMode ? styles.pageDark : ''}`}>
        <div className={styles.accessDenied}>
          <h1>Access Denied</h1>
          <p>Only Owners and Administrators can view Job Application Analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.page} ${darkMode ? styles.pageDark : ''}`}
      data-testid="job-application-analytics-page"
    >
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.heading}>Job Application Analytics</h1>
          <p className={styles.subheading}>
            Live CRM view of job form submissions — overview metrics, applicant expectations, and a
            searchable applications pipeline.
          </p>
        </div>
        <div className={styles.headerMeta}>Owner / Administrator CRM</div>
      </header>

      <AnalyticsSummaryCards
        summary={summary}
        loading={summaryLoading}
        summaryError={summaryError}
        experienceBreakdown={experienceBreakdown}
        applicantSources={applicantSources}
        experienceError={experienceError}
        sourcesError={sourcesError}
      />

      <section className={styles.section} aria-label="Applications CRM">
        <h2 className={styles.sectionTitle}>Applications CRM</h2>
        <ApplicationsTable
          items={list.items}
          total={list.total}
          page={page}
          limit={list.limit}
          loading={listLoading}
          error={listError}
          forms={forms}
          filters={filters}
          onFiltersChange={setFilters}
          onApplyFilters={() => {
            setPage(1);
            setAppliedFilters(filters);
          }}
          onPageChange={nextPage => setPage(nextPage)}
        />
      </section>
    </div>
  );
}

export default JobApplicationAnalyticsPage;
