import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import GradingTable from './GradingTable';
import SummaryList from './SummaryList';

const API_BASE_URL = 'http://localhost:5000';
const TEAM_CODE = 'TeamA';
const TEAM_NAME = 'Team Alpha';

// Mock data for fallback
const mockData = [
  {
    reviewer: 'Alice',
    prsNeeded: 10,
    prsReviewed: 7,
    gradedPrs: [{ prNumbers: '1070 + 1256', grade: 'Exceptional' }],
  },
  {
    reviewer: 'Bob',
    prsNeeded: 8,
    prsReviewed: 5,
    gradedPrs: [{ prNumbers: '1234', grade: 'Okay' }],
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

  // Fetch data on mount
  useEffect(() => {
    fetchGradings();
  }, []);

  const fetchGradings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/weekly-grading?team=${TEAM_CODE}`);
      if (response.data && Array.isArray(response.data)) {
        setGradings(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.warn('Failed to fetch gradings, using mock data:', error);
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

  // Add a new graded PR to a reviewer
  const addGradedPR = (reviewer, prNumbers, grade) => {
    setGradings(prev =>
      prev.map(g => {
        if (g.reviewer === reviewer) {
          return {
            ...g,
            gradedPrs: [...g.gradedPrs, { prNumbers, grade }],
          };
        }
        return g;
      }),
    );
    setOpenAddModal(null);
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

  // Remove a graded PR
  const removeGradedPR = (reviewer, prIndex) => {
    setGradings(prev =>
      prev.map(g => {
        if (g.reviewer === reviewer) {
          return {
            ...g,
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

      const payload = {
        teamCode: TEAM_CODE,
        date: currentDate,
        gradings: gradings.map(g => ({
          reviewer: g.reviewer,
          prsReviewed: g.prsReviewed,
          prsNeeded: g.prsNeeded,
          gradedPrs: g.gradedPrs,
        })),
      };

      await axios.post(`${API_BASE_URL}/api/weekly-grading/save`, payload);
      toast.success('Grading data saved successfully!');
    } catch (error) {
      console.error('Error saving gradings:', error);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading grading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">{TEAM_NAME}</h1>
            <p className="text-lg text-gray-600">{currentDate}</p>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <GradingTable
            gradings={gradings}
            onUpdatePRsReviewed={updatePRsReviewed}
            onAddPRClick={setOpenAddModal}
            openAddModal={openAddModal}
            onAddGradedPR={addGradedPR}
          />
        </div>

        {/* Summary Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Summary</h2>
          <SummaryList
            gradings={gradings}
            onUpdateGrade={updateGrade}
            onRemovePR={removeGradedPR}
          />
        </div>

        {/* Footer */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              {saving ? 'Saving...' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PRGradingDashboard;
