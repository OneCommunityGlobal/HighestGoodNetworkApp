import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import GradingTable from './GradingTable';
import SummaryList from './SummaryList';
import ConfirmationModal from './ConfirmationModal';
import AddReviewerModal from './AddReviewerModal';
import styles from './PRGradingDashboard.module.css';
import { SelectionProvider } from './SelectionContext';

const TEAM_CODE = 'TeamA';
const TEAM_NAME = 'Team Alpha';

// Mock data for fallback
const mockData = [
  {
    reviewer: 'Alice',
    prsNeeded: 10,
    prsReviewed: 7,
    gradedPrs: [{ prNumbers: '1070 + 1256', grade: 'Exceptional', isNew: false }],
  },
  {
    reviewer: 'Bob',
    prsNeeded: 8,
    prsReviewed: 5,
    gradedPrs: [{ prNumbers: '1234', grade: 'Okay', isNew: false }],
  },
  {
    reviewer: 'Charlie',
    prsNeeded: 12,
    prsReviewed: 9,
    gradedPrs: [],
  },
];

function PRGradingDashboard() {
  const [gradings, setGradings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(null); // reviewer name or null
  const [pendingPR, setPendingPR] = useState(null); // { reviewer, prNumbers, grade } or null
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAddReviewerModal, setShowAddReviewerModal] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchGradings();
  }, []);

  const fetchGradings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_APIENDPOINT}/weekly-grading?team=${TEAM_CODE}`,
      );
      if (response.data && Array.isArray(response.data)) {
        // Mark all existing PRs as not new
        const gradingsWithFlags = response.data.map(g => ({
          ...g,
          gradedPrs: g.gradedPrs.map(pr => ({ ...pr, isNew: false })),
        }));
        setGradings(gradingsWithFlags);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      // Use mock data if API fails
      setGradings(mockData);
      toast.info('Using mock data - API connection failed');
    } finally {
      setLoading(false);
    }
  };

  // Update PRs Reviewed for a reviewer
  const updatePRsReviewed = (reviewer, value) => {
    setGradings(prev =>
      prev.map(g =>
        g.reviewer === reviewer ? { ...g, prsReviewed: parseInt(value, 10) || 0 } : g,
      ),
    );
  };

  // Request to add a new graded PR (shows confirmation)
  const requestAddGradedPR = (reviewer, prNumbers, grade) => {
    setPendingPR({ reviewer, prNumbers, grade });
    setShowConfirmation(true);
    setOpenAddModal(null);
  };

  // Actually add the PR after confirmation
  const confirmAddGradedPR = () => {
    if (!pendingPR) return;

    const { reviewer, prNumbers, grade } = pendingPR;
    setGradings(prev =>
      prev.map(g => {
        if (g.reviewer === reviewer) {
          // Always increment by 1, regardless of how many PR numbers are in the string
          return {
            ...g,
            prsReviewed: g.prsReviewed + 1,
            gradedPrs: [...g.gradedPrs, { prNumbers, grade, isNew: true }],
          };
        }
        return g;
      }),
    );
    setPendingPR(null);
    setShowConfirmation(false);
    toast.success('PR added successfully! Click Save to save the changes.');
  };

  // Cancel adding PR
  const cancelAddGradedPR = () => {
    setPendingPR(null);
    setShowConfirmation(false);
  };

  // Update grade for a specific PR
  const updateGrade = (reviewer, prIndex, newGrade) => {
    setGradings(prev =>
      prev.map(g => {
        if (g.reviewer === reviewer) {
          const updatedGradedPrs = [...g.gradedPrs];
          updatedGradedPrs[prIndex] = { ...updatedGradedPrs[prIndex], grade: newGrade };
          return {
            ...g,
            gradedPrs: updatedGradedPrs,
          };
        }
        return g;
      }),
    );
  };

  // Add a new reviewer
  const addReviewer = newReviewer => {
    // Check if reviewer already exists
    const reviewerExists = gradings.some(
      g => g.reviewer.toLowerCase() === newReviewer.reviewer.toLowerCase(),
    );
    if (reviewerExists) {
      toast.error(`Reviewer "${newReviewer.reviewer}" already exists.`);
      return;
    }
    setGradings(prev => [...prev, newReviewer]);
    setShowAddReviewerModal(false);
    toast.success(`Reviewer "${newReviewer.reviewer}" added successfully.`);
  };

  // Remove a graded PR (only new ones)
  const removeGradedPR = (reviewer, prIndex) => {
    // Check if PR can be removed before updating state
    const reviewerGrading = gradings.find(g => g.reviewer === reviewer);
    if (!reviewerGrading) return;

    const prToRemove = reviewerGrading.gradedPrs[prIndex];
    if (!prToRemove) return;

    // Only allow removal of new PRs
    if (!prToRemove.isNew) {
      toast.warning('Cannot delete existing PRs. Only newly added PRs can be removed.');
      return;
    }

    // Show success toast
    toast.success('PR removed successfully! Click Save to save the changes.');

    // Update state
    setGradings(prev =>
      prev.map(g => {
        if (g.reviewer === reviewer) {
          // Always decrement by 1, regardless of how many PR numbers are in the string
          return {
            ...g,
            prsReviewed: Math.max(0, g.prsReviewed - 1),
            gradedPrs: g.gradedPrs.filter((_, index) => index !== prIndex),
          };
        }
        return g;
      }),
    );
  };

  // Save data
  const handleSave = async () => {
    try {
      setSaving(true);
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      // Remove isNew flag before sending to API
      const payload = {
        teamCode: TEAM_CODE,
        date: currentDate,
        gradings: gradings.map(g => ({
          reviewer: g.reviewer,
          prsReviewed: g.prsReviewed,
          prsNeeded: g.prsNeeded,
          gradedPrs: g.gradedPrs.map(pr => ({
            prNumbers: pr.prNumbers,
            grade: pr.grade,
          })),
        })),
      };

      await axios.post(`${process.env.REACT_APP_APIENDPOINT}/weekly-grading/save`, payload);
      toast.success('Grading data saved successfully!');

      // After saving, mark all PRs as not new
      setGradings(prev =>
        prev.map(g => ({
          ...g,
          gradedPrs: g.gradedPrs.map(pr => ({ ...pr, isNew: false })),
        })),
      );
    } catch (error) {
      toast.error('Failed to save grading data. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading grading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>{TEAM_NAME}</h1>
            <p className={styles.date}>{currentDate}</p>
          </div>
        </div>

        {/* Main Table */}
        <SelectionProvider>
          <div className={styles.section}>
            <div className={styles.tableHeaderActions}>
              <button
                type="button"
                onClick={() => setShowAddReviewerModal(true)}
                className={styles.addReviewerButton}
              >
                + Add Reviewer
              </button>
            </div>
            <GradingTable
              gradings={gradings}
              onUpdatePRsReviewed={updatePRsReviewed}
              onAddPRClick={setOpenAddModal}
              openAddModal={openAddModal}
              onAddGradedPR={requestAddGradedPR}
            />
          </div>

          {/* Summary Section */}
          <div className={styles.summarySection}>
            <h2 className={styles.summaryTitle}>Summary</h2>
            <SummaryList
              gradings={gradings}
              onUpdateGrade={updateGrade}
              onRemovePR={removeGradedPR}
            />
          </div>
        </SelectionProvider>

        {/* Footer */}

        <div className={styles.footerContent}>
          <button
            onClick={handleSave}
            disabled={saving}
            type="button"
            className={styles.saveButton}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && pendingPR && (
        <ConfirmationModal
          reviewer={pendingPR.reviewer}
          prNumbers={pendingPR.prNumbers}
          grade={pendingPR.grade}
          onConfirm={confirmAddGradedPR}
          onCancel={cancelAddGradedPR}
        />
      )}

      {/* Add Reviewer Modal */}
      {showAddReviewerModal && (
        <AddReviewerModal onAdd={addReviewer} onCancel={() => setShowAddReviewerModal(false)} />
      )}
    </div>
  );
}

export default PRGradingDashboard;
