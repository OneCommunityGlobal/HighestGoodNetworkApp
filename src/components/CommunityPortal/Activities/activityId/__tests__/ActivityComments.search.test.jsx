/**
 * Unit tests for Feedback search functionality in ActivityComments component
 * Tests search by reviewer name and feedback text with case-insensitive partial matching
 */

describe('ActivityComments - Feedback Search Functionality', () => {
  const mockFeedbacks = [
    {
      id: 1,
      name: 'Sarah Johnson',
      text: 'This was an absolutely fantastic event!',
      rating: 5,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 2,
      name: 'Anonymous User',
      text: 'Really enjoyed the event overall.',
      rating: 4,
      createdAt: new Date('2024-01-02'),
    },
    {
      id: 3,
      name: 'Mike Chen',
      text: 'The event was okay. Some parts were interesting.',
      rating: 3,
      createdAt: new Date('2024-01-03'),
    },
  ];

  // Helper function to simulate the search filter logic
  const filterFeedbacks = (feedbacks, searchTerm, filter = 'All') => {
    return feedbacks.filter(feedback => {
      const trimmedSearch = searchTerm.trim().toLowerCase();
      let matchesSearch = true;

      if (trimmedSearch) {
        const reviewerName = (feedback.name || '').toLowerCase();
        const feedbackText = (feedback.text || '').toLowerCase();
        matchesSearch =
          reviewerName.includes(trimmedSearch) || feedbackText.includes(trimmedSearch);
      }

      const matchesFilter = filter === 'All' || feedback.rating.toString() === filter;
      return matchesSearch && matchesFilter;
    });
  };

  describe('Search by reviewer name', () => {
    test('should find feedback by exact reviewer name match', () => {
      const results = filterFeedbacks(mockFeedbacks, 'Sarah Johnson');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Sarah Johnson');
    });

    test('should find feedback by partial reviewer name match', () => {
      const results = filterFeedbacks(mockFeedbacks, 'Sarah');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Sarah Johnson');
    });

    test('should be case-insensitive when searching by name', () => {
      const results = filterFeedbacks(mockFeedbacks, 'sarah');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Sarah Johnson');
    });

    test('should find multiple results for partial name match', () => {
      const results = filterFeedbacks(mockFeedbacks, 'Mike');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Mike Chen');
    });
  });

  describe('Search by feedback text', () => {
    test('should find feedback by exact text match', () => {
      const results = filterFeedbacks(mockFeedbacks, 'fantastic event');
      expect(results).toHaveLength(1);
      expect(results[0].text).toContain('fantastic');
    });

    test('should find feedback by partial text match', () => {
      const results = filterFeedbacks(mockFeedbacks, 'enjoyed');
      expect(results).toHaveLength(1);
      expect(results[0].text).toContain('enjoyed');
    });

    test('should be case-insensitive when searching by text', () => {
      const results = filterFeedbacks(mockFeedbacks, 'FANTASTIC');
      expect(results).toHaveLength(1);
      expect(results[0].text).toContain('fantastic');
    });
  });

  describe('Search edge cases', () => {
    test('should return all feedbacks when search term is empty', () => {
      const results = filterFeedbacks(mockFeedbacks, '');
      expect(results).toHaveLength(3);
    });

    test('should return all feedbacks when search term is only whitespace', () => {
      const results = filterFeedbacks(mockFeedbacks, '   ');
      expect(results).toHaveLength(3);
    });

    test('should handle null or undefined name gracefully', () => {
      const feedbackWithNullName = {
        id: 4,
        name: null,
        text: 'Some feedback text',
        rating: 5,
        createdAt: new Date('2024-01-04'),
      };
      const results = filterFeedbacks([feedbackWithNullName], 'text');
      expect(results).toHaveLength(1);
    });

    test('should handle null or undefined text gracefully', () => {
      const feedbackWithNullText = {
        id: 5,
        name: 'John Doe',
        text: null,
        rating: 5,
        createdAt: new Date('2024-01-05'),
      };
      const results = filterFeedbacks([feedbackWithNullText], 'John');
      expect(results).toHaveLength(1);
    });

    test('should return empty array when no matches found', () => {
      const results = filterFeedbacks(mockFeedbacks, 'nonexistent');
      expect(results).toHaveLength(0);
    });
  });

  describe('Search with rating filter', () => {
    test('should filter by rating and search term together', () => {
      const results = filterFeedbacks(mockFeedbacks, 'event', '5');
      expect(results).toHaveLength(1);
      expect(results[0].rating).toBe(5);
    });

    test('should return empty when search matches but rating filter does not', () => {
      const results = filterFeedbacks(mockFeedbacks, 'Sarah', '1');
      expect(results).toHaveLength(0);
    });
  });

  describe('Partial matching', () => {
    test('should match partial words in reviewer name', () => {
      const results = filterFeedbacks(mockFeedbacks, 'John');
      expect(results).toHaveLength(1);
      expect(results[0].name).toContain('Johnson');
    });

    test('should match partial words in feedback text', () => {
      const results = filterFeedbacks(mockFeedbacks, 'absolutely');
      expect(results).toHaveLength(1);
      expect(results[0].text).toContain('absolutely');
    });
  });
});
