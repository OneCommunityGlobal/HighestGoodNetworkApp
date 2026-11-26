import { useMemo } from 'react';
import { SAMPLE_LOSS_RECORDS } from './lossTrackingData';

/**
 * Single source of loss data for the Loss Tracking section.
 * Uses sample records for now; swap this for the loss-tracking API
 * (records of { date: 'YYYY-MM', project, category, cost }) when it exists.
 */
export default function useLossTrackingData() {
  return useMemo(() => ({ records: SAMPLE_LOSS_RECORDS, loading: false, isSample: true }), []);
}
