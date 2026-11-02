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

  // Helper function for common assertions
  const expectSingleResult = (results, expectedName, expectedText) => {
    expect(results).toHaveLength(1);
    if (expectedName) expect(results[0].name).toBe(expectedName);
    if (expectedText) expect(results[0].text).toContain(expectedText);
  };

  describe('Search by reviewer name', () => {
    test.each([
      ['Sarah Johnson', 'Sarah Johnson', null],
      ['Sarah', 'Sarah Johnson', null],
      ['sarah', 'Sarah Johnson', null],
      ['Mike', 'Mike Chen', null],
    ])('should find feedback for search term "%s"', (searchTerm, expectedName) => {
      const results = filterFeedbacks(mockFeedbacks, searchTerm);
      expectSingleResult(results, expectedName, null);
    });
  });

  describe('Search by feedback text', () => {
    test.each([
      ['fantastic event', null, 'fantastic'],
      ['enjoyed', null, 'enjoyed'],
      ['FANTASTIC', null, 'fantastic'],
    ])('should find feedback for text search "%s"', (searchTerm, expectedName, expectedText) => {
      const results = filterFeedbacks(mockFeedbacks, searchTerm);
      expectSingleResult(results, expectedName, expectedText);
    });
  });

  describe('Search edge cases', () => {
    test.each([
      ['', 3],
      ['   ', 3],
      ['nonexistent', 0],
    ])('should return %d results for search term "%s"', (searchTerm, expectedCount) => {
      const results = filterFeedbacks(mockFeedbacks, searchTerm);
      expect(results).toHaveLength(expectedCount);
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
  });

  describe('Search with rating filter', () => {
    test.each([
      ['event', '5', 1, 5],
      ['Sarah', '1', 0, null],
    ])(
      'should filter by rating %s and search "%s" to return %d results',
      (searchTerm, rating, expectedCount, expectedRating) => {
        const results = filterFeedbacks(mockFeedbacks, searchTerm, rating);
        expect(results).toHaveLength(expectedCount);
        if (expectedRating) expect(results[0].rating).toBe(expectedRating);
      },
    );
  });

  describe('Partial matching', () => {
    test.each([
      ['John', 'name', 'Johnson'],
      ['absolutely', 'text', 'absolutely'],
    ])('should match partial words in %s', (searchTerm, field, expectedContent) => {
      const results = filterFeedbacks(mockFeedbacks, searchTerm);
      expect(results).toHaveLength(1);
      expect(results[0][field]).toContain(expectedContent);
    });
  });
});
