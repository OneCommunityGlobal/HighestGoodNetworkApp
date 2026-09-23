import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styles from './Collaboration.module.css';
import { toast } from 'react-toastify';
import { ApiEndpoint } from '~/utils/URL';
import OneCommunityImage from '../../assets/images/logo2.png';
import WhatWeDoSection from '../WhatWeDo/WhatWeDo';

function getColumnsFromMQ() {
  if (typeof globalThis.matchMedia !== 'function') return 1;
  const mq = globalThis.matchMedia.bind(globalThis);
  if (mq('(min-width: 1600px)').matches) return 6;
  if (mq('(min-width: 1300px)').matches) return 5;
  if (mq('(min-width: 1017px)').matches) return 4;
  if (mq('(min-width: 768px)').matches) return 3;
  if (mq('(min-width: 480px)').matches) return 2;
  return 1;
}

function clampPage(page, totalPages) {
  if (page < 1) return 1;
  if (page > totalPages) return totalPages;
  return page;
}

/** Keep first listing per title+category (API may return duplicate job records). */
function dedupeJobsByTitle(jobs) {
  const seen = new Set();
  return jobs.filter(job => {
    if (!job) return false;
    const title = String(job.title || '')
      .trim()
      .toLowerCase();
    const category = String(job.category || 'General')
      .trim()
      .toLowerCase();
    if (!title) return false;
    const key = `${title}|${category}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function Collaboration() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [jobAds, setJobAds] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [categories, setCategories] = useState([]);
  const [summaries, setSummaries] = useState(null);
  const [summariesAll, setSummariesAll] = useState([]);
  const [summariesPage, setSummariesPage] = useState(1);
  const [summariesPageSize] = useState(6);
  const [summariesTotalPages, setSummariesTotalPages] = useState(0);
  const [columns, setColumns] = useState(() => getColumnsFromMQ());
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsFetchError, setJobsFetchError] = useState(null);
  const requestIdRef = useRef(0);
  const resizeTimeoutRef = useRef(null);
  const columnsRef = useRef(columns);
  // KEEP ACTIVE TAB (required)
  const [activeTab, setActiveTab] = useState('jobPostings');

  const darkMode = useSelector(state => state.theme?.darkMode);
  const history = useHistory();
  console.log(jobAds);
  const handleTabChange = tab => {
    setActiveTab(tab);

    if (tab === 'whatWeDo') {
      // Leaving job/summaries view
      setSummaries(null);
    }

    if (tab === 'jobPostings') {
      // Returning to job postings
      setSummaries(null);
    }

    globalThis.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const calculateAdsPerPage = () => {
    const rows = 5;
    return columns * rows;
  };

  // Get category-specific image - using high-quality relevant images
  const getCategoryImage = category => {
    const categoryLower = (category || 'General').toLowerCase();

    // Category to image URL mapping (grouped by image to reduce duplication)
    const categoryImageMap = [
      {
        keywords: ['software', 'it', 'programming'],
        url:
          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=640&h=480&fit=crop&q=80',
      },
      {
        keywords: ['engineering', 'technical', 'design'],
        url:
          'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=640&h=480&fit=crop&q=80',
      },
      {
        keywords: ['administrative', 'support', 'admin'],
        url:
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=640&h=480&fit=crop&q=80',
      },
      {
        keywords: ['electric', 'electrical'],
        url:
          'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=640&h=480&fit=crop&q=80',
      },
      {
        keywords: ['plumbing'],
        url:
          'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=640&h=480&fit=crop&q=80',
      },
      {
        keywords: ['culinary', 'chef'],
        url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=640&h=480&fit=crop&q=80',
      },
      {
        keywords: ['civil', 'construction'],
        url:
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=640&h=480&fit=crop&q=80',
      },
      {
        keywords: ['nutrition', 'diet'],
        url:
          'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=640&h=480&fit=crop&q=80',
      },
      {
        keywords: ['mechanical'],
        url:
          'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=640&h=480&fit=crop&q=80',
      },
    ];

    // Find matching category
    for (const { keywords, url } of categoryImageMap) {
      if (keywords.some(keyword => categoryLower.includes(keyword))) {
        return url;
      }
    }

    // Default General category - Professional workspace
    return 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=640&h=480&fit=crop&q=80';
  };

  const fetchJobAds = async (overrides = {}) => {
    const adsPerPage = calculateAdsPerPage();
    const page = overrides.page ?? currentPage;
    const search = overrides.search ?? searchTerm;
    const category = overrides.category ?? selectedCategory;

    setLoadingJobs(true);
    setJobsFetchError(null);

    const requestId = ++requestIdRef.current;

    try {
      const requestOptions = { method: 'GET' };
      if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
        requestOptions.signal = AbortSignal.timeout(15000);
      }
      const response = await fetch(
        `${ApiEndpoint}/jobs?page=${page}&limit=${adsPerPage}` +
          `&search=${encodeURIComponent(search)}` +
          `&category=${encodeURIComponent(category)}`,
        requestOptions,
      );

      if (!response.ok) throw new Error(`Failed to fetch jobs: ${response.statusText}`);

      const data = await response.json();
      const jobs = dedupeJobsByTitle(Array.isArray(data?.jobs) ? data.jobs : []);
      // Ignore responses from requests superseded by a newer filter/page change.
      if (requestId !== requestIdRef.current) return;
      setJobAds(jobs);
      setTotalPages(Math.max(0, Number(data?.pagination?.totalPages) || 0));
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      setJobAds([]);
      setTotalPages(0);
      const isTimeout = error?.name === 'TimeoutError' || error?.name === 'AbortError';
      setJobsFetchError(
        isTimeout
          ? 'Jobs API timed out. Ensure HGNRest is running on port 4500 and MongoDB is connected.'
          : 'Could not load jobs. Ensure the backend is running (npm start in HGNRest).',
      );
      toast.error('Error fetching jobs');
    } finally {
      if (requestId === requestIdRef.current) setLoadingJobs(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${ApiEndpoint}/jobs/categories`, { method: 'GET' });
      if (!response.ok) throw new Error(`Failed to fetch categories: ${response.statusText}`);

      const data = await response.json();
      const sorted = Array.isArray(data?.categories)
        ? [
            ...new Set(data.categories.filter(category => typeof category === 'string')),
          ].sort((a, b) => a.localeCompare(b))
        : [];
      setCategories(sorted);
    } catch {
      toast.error('Error fetching categories');
    }
  };

  const handleSearch = e => setSearchTerm(e.target.value);

  const handleSubmit = e => {
    e.preventDefault();

    const submittedSearch = e.currentTarget.elements.search?.value ?? searchTerm;
    setSearchTerm(submittedSearch);

    setSummaries(null);
    setActiveTab('jobPostings');
    setCurrentPage(1);

    fetchJobAds({ search: submittedSearch, page: 1 });
  };

  const handleCategoryChange = e => {
    const selectedValue = e.target.value;
    setSelectedCategory(selectedValue || '');
    setCurrentPage(1);
    setSummaries(null);
    setActiveTab('jobPostings');
    fetchJobAds({ category: selectedValue || '', page: 1 });
  };

  const handleResetFilters = async () => {
    const requestId = ++requestIdRef.current;
    setLoadingJobs(true);
    try {
      const adsPerPage = calculateAdsPerPage();
      const response = await fetch(`${ApiEndpoint}/jobs/reset-filters?page=1&limit=${adsPerPage}`, {
        method: 'GET',
      });

      if (!response.ok) throw new Error(`Failed to reset filters: ${response.statusText}`);

      const data = await response.json();
      if (requestId !== requestIdRef.current) return;
      setSearchTerm('');
      setSelectedCategory('');
      setCurrentPage(1);
      setJobAds(dedupeJobsByTitle(Array.isArray(data?.jobs) ? data.jobs : []));
      setTotalPages(data?.pagination?.totalPages || 0);
      setSummaries(null);
      setSummariesAll([]);
      setSummariesPage(1);
      setSummariesTotalPages(0);
      setActiveTab('jobPostings');
      globalThis.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      if (requestId !== requestIdRef.current) return;
      toast.error('Error resetting filters');
    } finally {
      if (requestId === requestIdRef.current) setLoadingJobs(false);
    }
  };

  const setPage = pageNumber => {
    const nextPage = clampPage(pageNumber, Math.max(1, totalPages));
    setCurrentPage(nextPage);
    fetchJobAds({ page: nextPage });
    globalThis.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowSummaries = async () => {
    try {
      setActiveTab('jobPostings');
      const response = await fetch(
        `${ApiEndpoint}/jobs/summaries?search=${encodeURIComponent(searchTerm)}` +
          `&category=${encodeURIComponent(selectedCategory)}`,
        { method: 'GET' },
      );

      if (!response.ok) throw new Error(`Failed to fetch summaries: ${response.statusText}`);

      const data = await response.json();
      const summariesData = dedupeJobsByTitle(Array.isArray(data?.jobs) ? data.jobs : []);

      setSummaries({ jobs: summariesData });
      setSummariesAll(summariesData);
      setSummariesPage(1);
      setSummariesTotalPages(Math.max(1, Math.ceil(summariesData.length / summariesPageSize)));
      globalThis.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      toast.error('Error fetching summaries');
    }
  };

  const handleSetSummariesPage = page => {
    setSummariesPage(clampPage(page, summariesTotalPages));
    globalThis.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToJobApplication = (ad, jobTitle, jobCategory) => {
    try {
      if (history && typeof history.push === 'function') {
        const search = jobTitle ? `?jobTitle=${encodeURIComponent(jobTitle)}` : '';
        history.push({
          pathname: '/job-application',
          search,
          state: {
            jobId: ad._id,
            jobTitle,
            jobDescription: ad.description || '',
            requirements: Array.isArray(ad.requirements) ? ad.requirements : [],
            category: jobCategory,
          },
        });
      } else {
        globalThis.location.href = '/job-application';
      }
    } catch {
      toast.error('Error opening job application');
    }
  };

  const handleImageError = event => {
    event.currentTarget.onerror = null;
    event.currentTarget.src =
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=640&h=480&fit=crop&q=80';
  };

  const handleJobAdClick = event => {
    const { jobId, jobTitle, jobCategory } = event.currentTarget.dataset;
    const job = jobAds.find(ad => String(ad?._id) === jobId);
    if (job) navigateToJobApplication(job, jobTitle, jobCategory);
  };

  const handlePaginationClick = event => {
    setPage(Number(event.currentTarget.dataset.page));
  };

  const renderCategoryOption = category => (
    <option key={category} value={category}>
      {category}
    </option>
  );

  const renderJobAd = ad => {
    if (!ad?._id) return null;
    const jobTitle = ad.title || 'Untitled Position';
    const jobCategory = ad.category || 'General';

    return (
      <button
        type="button"
        key={ad._id}
        className={styles.jobAd}
        data-job-id={ad._id}
        data-job-title={jobTitle}
        data-job-category={jobCategory}
        onClick={handleJobAdClick}
      >
        <img
          src={getCategoryImage(jobCategory)}
          alt={jobTitle}
          loading="lazy"
          onError={handleImageError}
        />
        <h3>
          {jobTitle} - {jobCategory}
        </h3>
      </button>
    );
  };

  const renderJobContent = () => {
    if (loadingJobs) {
      return <p className={styles.noJobads}>Loading jobs...</p>;
    }
    if (jobsFetchError) {
      return <p className={styles.noJobads}>{jobsFetchError}</p>;
    }

    if (jobAds.length > 0) {
      return <>{jobAds.map(renderJobAd)}</>;
    }
    return <p className={styles.noJobads}>No matching jobs found.</p>;
  };

  const renderPaginationButton = (_, index) => (
    <button
      type="button"
      key={index}
      data-page={index + 1}
      onClick={handlePaginationClick}
      disabled={currentPage === index + 1}
      className={darkMode ? 'bg-space-cadet text-light border-0' : ''}
    >
      {index + 1}
    </button>
  );

  // Initial fetch and setup
  useEffect(() => {
    fetchJobAds();
    fetchCategories();
    const handleResize = () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(() => {
        const newCols = getColumnsFromMQ();
        if (newCols === columnsRef.current) return;
        columnsRef.current = newCols;
        setColumns(newCols);
        setCurrentPage(1);
        fetchJobAds({ page: 1 });
      }, 200);
    };
    globalThis.addEventListener('resize', handleResize);
    return () => {
      globalThis.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      requestIdRef.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderSummaries = () => {
    const start = (summariesPage - 1) * summariesPageSize;
    const end = start + summariesPageSize;
    const pageItems = summariesAll.slice(start, end);

    return (
      <div className={`${styles.jobLanding} ${darkMode ? styles.jobLandingDark : ''}`}>
        <div className={styles.header}>
          <a
            href="https://www.onecommunityglobal.org/collaboration/"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={OneCommunityImage}
              alt="One Community Logo"
              className={styles.responsiveImg}
            />
          </a>
        </div>

        <div className={styles.collabContainer}>
          <nav className={styles.navbar}>
            <button
              type="button"
              className={activeTab === 'whatWeDo' ? styles.activeTab : styles.tabButton}
              onClick={() => handleTabChange('whatWeDo')}
            >
              What We Do
            </button>
            <div className={styles.navbarLeft}>
              <form className={styles.searchForm} onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="search"
                  placeholder="Search by title..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <button className={styles.searchButton} type="submit">
                  Go
                </button>
                <button className={styles.resetButton} type="button" onClick={handleResetFilters}>
                  Reset
                </button>
                <button
                  className={styles.showSummaries}
                  type="button"
                  onClick={handleShowSummaries}
                >
                  Show Summaries
                </button>
              </form>
            </div>

            <div className={styles.navbarRight}>
              <select
                aria-label="Job category"
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <option value="">Select from Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </nav>

          <div className={styles.summariesList}>
            <h1>Summaries</h1>

            {pageItems.length > 0 ? (
              pageItems.map(summary => (
                <div
                  key={summary._id || summary.jobDetailsLink || summary.title}
                  className={styles.summariesItem}
                >
                  <h3>
                    <a href={summary.jobDetailsLink} target="_blank" rel="noreferrer">
                      {summary.title}
                    </a>
                  </h3>
                  <p>{summary.description}</p>
                  <p className={styles.date}>
                    Date Posted:{' '}
                    {summary.datePosted ? new Date(summary.datePosted).toLocaleDateString() : '—'}
                  </p>
                </div>
              ))
            ) : (
              <p>No summaries found.</p>
            )}

            {summariesTotalPages > 1 && (
              <div className={styles.pagination}>
                {Array.from({ length: summariesTotalPages }, (_, i) => (
                  <button
                    type="button"
                    key={`summaries-${i}`}
                    onClick={() => handleSetSummariesPage(i + 1)}
                    disabled={summariesPage === i + 1}
                    className={darkMode ? 'bg-space-cadet text-light border-0' : ''}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (summaries) return renderSummaries();

  return (
    <div className={`${styles.jobLanding} ${darkMode ? styles.jobLandingDark : ''}`}>
      <div className={styles.header}>
        <a
          href="https://www.onecommunityglobal.org/collaboration/"
          target="_blank"
          rel="noreferrer"
        >
          <img src={OneCommunityImage} alt="One Community Logo" className={styles.responsiveImg} />
        </a>
      </div>

      <div className={styles.collabContainer}>
        <nav className={styles.navbar}>
          <button
            type="button"
            className={activeTab === 'whatWeDo' ? styles.activeTab : styles.tabButton}
            onClick={() => handleTabChange('whatWeDo')}
          >
            What We Do
          </button>
          <div className={styles.navbarLeft}>
            <form className={styles.searchForm} onSubmit={handleSubmit}>
              <input
                type="text"
                name="search"
                placeholder="Enter Job Title"
                value={searchTerm}
                onChange={handleSearch}
              />
              <button className={styles.searchButton} type="submit">
                Go
              </button>
              <button className={styles.resetButton} type="button" onClick={handleResetFilters}>
                Reset
              </button>
              <button className={styles.showSummaries} type="button" onClick={handleShowSummaries}>
                Show Summaries
              </button>
            </form>
          </div>

          <div className={styles.navbarRight}>
            <select
              aria-label="Job category"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="">Select From Positions</option>
              {categories.map(renderCategoryOption)}
            </select>
          </div>
        </nav>
        {activeTab === 'whatWeDo' ? (
          <WhatWeDoSection />
        ) : (
          <>
            <div className={styles.headings}>
              <h1 className={styles.mainHeading}>LIKE TO WORK WITH US? APPLY NOW!</h1>
            </div>

            <div className={styles.jobList}>{renderJobContent()}</div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                {Array.from({ length: totalPages }, renderPaginationButton)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Collaboration;
