import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

/**
 * @typedef {Object} FilterButton
 * @property {string} value - The filter value key.
 * @property {string} label - The human-readable label.
 * @property {string} variant - React-Bootstrap button variant.
 */

/**
 * Available task filters mapped to React-Bootstrap variants.
 * @type {FilterButton[]}
 */
export const filterButtons = [
  { value: 'all',        label: 'All',        variant: 'secondary' },
  { value: 'assigned',   label: 'Assigned',   variant: 'primary'   },
  { value: 'unassigned', label: 'Unassigned', variant: 'secondary' },
  { value: 'active',     label: 'Active',     variant: 'success'   },
  { value: 'inactive',   label: 'Inactive',   variant: 'light'     },
  { value: 'complete',   label: 'Complete',   variant: 'info'      },
  { value: 'paused',     label: 'Paused',     variant: 'warning'   },
];

/**
 * Props for FilterBar component.
 * @typedef {Object} FilterBarProps
 * @property {string} currentFilter - The active filter key.
 * @property {(filter: string) => void} onChange - Callback when a new filter is selected.
 */

/**
 * Renders a group of filter buttons.
 *
 * @param {FilterBarProps} props
 * @returns {JSX.Element}
 */
export function FilterBar({ currentFilter, onChange, isLoading }) {
  return (
    <div aria-label="Task Filters">
      {filterButtons.map(({ value, label, variant }) => (
        <Button
          size="sm"
          key={value}
          variant={variant}
          active={currentFilter === value}
          onClick={() => onChange(value)}
          disabled={isLoading}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}