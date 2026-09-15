// src/pages/Collaboration/Collaboration.jsx
import { useEffect, useState, useMemo, useRef } from 'react';
import styles from './Collaboration.module.css';
import { toast } from 'react-toastify';
import { ApiEndpoint } from '~/utils/URL';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import OneCommunityImage from '../../assets/images/logo2.png';
import WhatWeDoSection from '../WhatWeDo/WhatWeDo';

const ADS_PER_PAGE = 18;

function Collaboration() {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriesSelected, setCategoriesSelected] = useState([]);
  const history = useHistory();
  const [currentPage, setCurrentPage] = useState(1);
  const [jobAds, setJobAds] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [summaries, setSummaries] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState('');
  // KEEP ACTIVE TAB (required)
  const [activeTab, setActiveTab] = useState('jobPostings');

  const dropdownRef = useRef(null);
  const [selectedJob, setSelectedJob] = useState(null);

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

  const darkMode = useSelector(state => state.theme.darkMode);

  /* ================= FETCH JOBS ================= */
  const fetchJobs = async (page = currentPage) => {
    try {
      const url =
        `${ApiEndpoint}/jobs` +
        `?page=${page}` +
        `&limit=${ADS_PER_PAGE}` +
        `&search=${encodeURIComponent(searchTerm || '')}` +
        `&category=${encodeURIComponent(JSON.stringify(categoriesSelected))}`;

      const res = await fetch(url);
      const data = await res.json();
      setAllJobs(data.jobs || []);
      setTotalPages(Math.max(data.pagination?.totalPages || 1, 1));
    } catch {
      toast.error('Error fetching jobs');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${ApiEndpoint}/jobs/categories`);
      const data = await res.json();
      setCategories((data.categories || []).sort((a, b) => a.localeCompare(b)));
    } catch {
      toast.error('Error fetching categories');
    }
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchJobs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, categoriesSelected]);

  /* ================= FILTERED JOBS ================= */
  const filteredJobs = useMemo(() => {
    if (!selectedPosition) return allJobs;

    return allJobs.filter(job =>
      (job.position || job.title || '').toLowerCase().includes(selectedPosition.toLowerCase()),
    );
  }, [allJobs, selectedPosition]);

  /* ================= PAGINATION ================= */
  // Pagination is server-side (see fetchJobs); allJobs already holds only the
  // current page's results, so jobAds just mirrors the (position-filtered) list.
  useEffect(() => {
    setJobAds(filteredJobs);
  }, [filteredJobs]);

  const goToPage = page => {
    setCurrentPage(page);
    fetchJobs(page);
  };

  /* ================= ESC CLOSE MODAL ================= */
  useEffect(() => {
    if (!selectedJob) return;
    const esc = e => e.key === 'Escape' && setSelectedJob(null);
    globalThis.addEventListener('keydown', esc);
    return () => globalThis.removeEventListener('keydown', esc);
  }, [selectedJob]);

  /* ================= CLICK OUTSIDE DROPDOWN ================= */
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ================= HANDLERS ================= */
  const handleSubmit = e => {
    e.preventDefault();

    setSummaries(null);
    setActiveTab('jobPostings');
    setCurrentPage(1);

    fetchJobAds();
  };

  const handleClearAllFilters = () => {
    setCategoriesSelected([]);
    setSelectedPosition('');
    setSearchTerm('');
    setQuery('');
    setCurrentPage(1);
    setSummaries(null);
    setActiveTab('jobPostings');
    fetchJobAds({ category: selectedValue || '', page: 1 });
  };

  const handleCategoryToggle = cat =>
    setCategoriesSelected(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat],
    );

      if (!response.ok) throw new Error(`Failed to reset filters: ${response.statusText}`);

      const data = await response.json();
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
    } catch (error) {
      console.error('Error resetting filters:', error);
      toast.error('Error resetting filters');
    }
  };

  const setPage = pageNumber => {
    setCurrentPage(pageNumber);
    fetchJobAds();
    globalThis.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowSummaries = async () => {
    try {
      setActiveTab('jobPostings');
      const res = await fetch(
        `${ApiEndpoint}/jobs/summaries?search=${searchTerm}&category=${encodeURIComponent(
          JSON.stringify(categoriesSelected),
        )}`,
      );
      setSummaries(await res.json());
    } catch {
      toast.error('Error fetching summaries');
    }
  };

  const handleJobClick = ad => {
    const title = ad.title || '';
    const search = title ? `?jobTitle=${encodeURIComponent(title)}` : '';
    history.push({
      pathname: '/job-application',
      search,
      state: {
        jobId: ad._id,
        jobTitle: title,
        jobDescription: ad.description || '',
        requirements: ad.requirements || [],
        category: ad.category || 'General',
      },
    });
  };

  /* ================= SUMMARIES VIEW ================= */
  if (summaries) {
    return (
      <div className={`${styles.jobLanding} ${darkMode ? styles.dark : ''}`}>
        <div className={styles.jobHeader}>
          <a href="https://www.onecommunityglobal.org/collaboration/">
            <img src={OneCommunityImage} alt="One Community Logo" />
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

          {summaries.jobs?.length ? (
            summaries.jobs.map(job => (
              <div key={job._id}>
                <h4>
                  <a href={job.jobDetailsLink}>{job.title}</a>
                </h4>
                <p>{job.description}</p>
              </div>
            ))
          ) : (
            <p>No summaries found.</p>
          )}

          <button type="button" className="btn btn-secondary" onClick={() => setSummaries(null)}>
            ← Back to Job Listings
          </button>
        </div>
      </div>
    );
  }

  /* ================= MAIN VIEW ================= */
  return (
    <div className={`${styles.jobLanding} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.jobHeader}>
        <a href="https://www.onecommunityglobal.org/collaboration/">
          <img src={OneCommunityImage} alt="One Community Logo" />
        </a>
      </div>

      <div className={styles.userCollaborationContainer}>
        {/* NAVBAR */}
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

            {showCategoryDropdown && (
              <div className={styles.jobSelect}>
                {categories.map(cat => (
                  <label key={cat} className={styles.dropdownItem}>
                    <input
                      type="checkbox"
                      checked={categoriesSelected.includes(cat)}
                      onChange={() => handleCategoryToggle(cat)}
                    />
                    {cat}
                  </label>
                ))}
              </div>
            )}
          </div>
        </nav>
        {activeTab === 'whatWeDo' ? (
          <WhatWeDoSection />
        ) : (
          <>
            <div className={styles.headings}>
              <h1 className={styles.mainHeading}>LIKE TO WORK WITH US? APPLY NOW!</h1>
            </div>

            <div className={styles.jobList}>
              {(() => {
                if (loadingJobs) {
                  return <p className={styles.noJobads}>Loading jobs...</p>;
                }

                if (jobsFetchError) {
                  return <p className={styles.noJobads}>{jobsFetchError}</p>;
                }

                // Show categories if no search term and no category filter
                const shouldShowCategories = !searchTerm && !selectedCategory && jobAds.length > 0;

                if (shouldShowCategories) {
                  const uniqueCategories = getUniqueCategories();
                  if (uniqueCategories.length > 0) {
                    return uniqueCategories.map(catInfo => {
                      const categoryName = catInfo.category || 'General';
                      const categoryImage = getCategoryImage(categoryName);

                      return (
                        <button
                          type="button"
                          key={categoryName}
                          className={styles.jobAd}
                          onClick={() => {
                            setSelectedCategory(categoryName);
                            setCurrentPage(1);
                            setSummaries(null);
                            setActiveTab('jobPostings');
                            fetchJobAds({ category: categoryName, page: 1 });
                          }}
                        >
                          <img
                            src={categoryImage}
                            alt={categoryName}
                            loading="lazy"
                            onError={e => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src =
                                'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=640&h=480&fit=crop&q=80';
                            }}
                          />
                          <h3 className={styles.categoryTitle}>{categoryName.toUpperCase()}</h3>
                        </button>
                      );
                    });
                  }
                }

                if (jobAds.length > 0) {
                  return jobAds.map(ad => {
                    if (!ad?._id) return null;
                    const jobTitle = ad.title || 'Untitled Position';
                    const jobCategory = ad.category || 'General';
                    const jobImageUrl = getCategoryImage(jobCategory);

                    return (
                      <button
                        type="button"
                        key={ad._id}
                        className={styles.jobAd}
                        onClick={() => navigateToJobApplication(ad, jobTitle, jobCategory)}
                      >
                        <img
                          src={jobImageUrl}
                          alt={jobTitle}
                          loading="lazy"
                          onError={e => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=640&h=480&fit=crop&q=80';
                          }}
                        />
                        <h3>
                          {jobTitle} - {jobCategory}
                        </h3>
                      </button>
                    );
                  });
                }

                return <p className={styles.noJobads}>No matching jobs found.</p>;
              })()}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setPage(i + 1)}
                    disabled={currentPage === i + 1}
                    className={darkMode ? 'bg-space-cadet text-light border-0' : ''}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL */}
      {selectedJob && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setSelectedJob(null)}
            >
              ×
            </button>

            <h2>{selectedJob.title}</h2>
            <p>
              <strong>Category:</strong> {selectedJob.category}
            </p>
            <p>{selectedJob.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Collaboration;
