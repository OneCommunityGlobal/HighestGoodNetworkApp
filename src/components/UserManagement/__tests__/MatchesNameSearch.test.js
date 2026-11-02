import { describe, it, expect } from 'vitest';
import { matchesNameSearch } from '../UserManagement';

describe('matchesNameSearch', () => {
  describe('substring matching without trailing spaces', () => {
    it('matches exact names', () => {
      expect(matchesNameSearch('Test', 'test')).toBe(true);
    });

    it('matches partial words at the beginning', () => {
      expect(matchesNameSearch('TestUser', 'test')).toBe(true);
    });

    it('matches partial words at the end', () => {
      expect(matchesNameSearch('DontTest', 'test')).toBe(true);
    });
  });

  describe('whole-word matching with trailing spaces', () => {
    it('matches an exact word', () => {
      expect(matchesNameSearch('Test', 'test ')).toBe(true);
    });

    it('matches a complete word at the beginning', () => {
      expect(matchesNameSearch('Test User', 'test ')).toBe(true);
    });

    it('does not match partial words', () => {
      expect(matchesNameSearch('TestUser', 'test ')).toBe(false);
    });

    it('does not match words that continue with additional characters', () => {
      expect(matchesNameSearch('Testing', 'test ')).toBe(false);
    });

    it('matches a complete word at the end', () => {
      expect(matchesNameSearch('Dont Test', 'test ')).toBe(true);
      expect(matchesNameSearch('DontTest', 'test ')).toBe(false);
    });

    it('matches a complete word in the middle', () => {
      expect(matchesNameSearch('DontTestUser', 'test ')).toBe(false);
      expect(matchesNameSearch('Dont Test User', 'test ')).toBe(true);
    });
  });

  describe('multi-word searches', () => {
    it('matches names containing multiple words', () => {
      expect(matchesNameSearch('DontEdit Admin', 'dontedit admin')).toBe(true);
    });

    it('matches multi-word phrases with trailing spaces', () => {
      expect(matchesNameSearch('Test User', 'test user ')).toBe(true);
    });

    it('normalizes consecutive whitespace in names and searches', () => {
      expect(matchesNameSearch('test     manager', 'test manager')).toBe(true);
      expect(matchesNameSearch('test     manager', 'test   manager')).toBe(true);
    });

    it('preserves whole-word matching with consecutive whitespace', () => {
      expect(matchesNameSearch('test     manager', 'test manager ')).toBe(true);
      expect(matchesNameSearch('testing     manager', 'test ')).toBe(false);
    });
  });

  describe('case and whitespace handling', () => {
    it('matches names regardless of capitalization', () => {
      expect(matchesNameSearch('TEST MANAGER', 'test manager')).toBe(true);
    });

    it('ignores leading spaces in the search input', () => {
      expect(matchesNameSearch('Test Manager', '   test')).toBe(true);
    });

    it('preserves trailing-space behavior with leading spaces', () => {
      expect(matchesNameSearch('Test User', '   test ')).toBe(true);
    });

    it('returns true for an empty search', () => {
      expect(matchesNameSearch('Test Manager', '')).toBe(true);
    });
  });
});
