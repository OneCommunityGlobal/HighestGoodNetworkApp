import { useEffect } from 'react';
import { fetchListings, fetchBiddings } from './data';
import { buildApiFilters, withVillageFallback } from './homeApiUtils';

export function useHomeTabData({
  activeTab,
  pagination,
  selectedVillage,
  dateRange,
  villageFilterCandidates,
  setAllListings,
  setAllBiddings,
  setPagination,
  setIsLoading,
  setError,
}) {
  useEffect(() => {
    const loadListings = async filters => {
      const listingsData = await withVillageFallback(
        fetchListings,
        pagination.currentPage,
        pagination.pageSize,
        filters,
        selectedVillage,
        villageFilterCandidates,
      );
      setAllListings(listingsData.items || []);
      setPagination(prev => ({
        ...prev,
        totalPages: listingsData.pagination.totalPages || 1,
      }));
    };

    const loadBiddings = async filters => {
      const biddingsData = await withVillageFallback(
        fetchBiddings,
        pagination.currentPage,
        pagination.pageSize,
        filters,
        selectedVillage,
        villageFilterCandidates,
      );
      setAllBiddings(biddingsData.items || []);
      setPagination(prev => ({
        ...prev,
        totalPages: biddingsData.pagination.totalPages || 1,
      }));
    };

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const filters = buildApiFilters(selectedVillage, dateRange);
        if (activeTab === 'listings') {
          await loadListings(filters);
        } else {
          await loadBiddings(filters);
        }
        setIsLoading(false);
      } catch (err) {
        console.error(`API Error (${activeTab}):`, err);
        if (activeTab === 'listings') {
          setAllListings([]);
        } else {
          setAllBiddings([]);
        }
        setError('Failed to load data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [
    activeTab,
    dateRange,
    pagination.currentPage,
    pagination.pageSize,
    selectedVillage,
    setAllBiddings,
    setAllListings,
    setError,
    setIsLoading,
    setPagination,
    villageFilterCandidates,
  ]);
}
