import { TimeRange } from '../types/timeRange';

/**
 * Converts a TimeRange enum to a BigQuery interval string
 * @param timeRange - The time range to convert
 * @returns A BigQuery interval string
 */
const timeRangeToInterval = (timeRange: TimeRange): string => {
  switch (timeRange) {
    case TimeRange.HOUR_1:
      return 'INTERVAL 1 HOUR';
    case TimeRange.HOUR_3:
      return 'INTERVAL 3 HOUR';
    case TimeRange.HOUR_12:
      return 'INTERVAL 12 HOUR';
    case TimeRange.DAY_1:
      return 'INTERVAL 24 HOUR';
    case TimeRange.WEEK_1:
      return 'INTERVAL 7 DAY';
    case TimeRange.WEEK_2:
      return 'INTERVAL 14 DAY';
    case TimeRange.MONTH_1:
      return 'INTERVAL 30 DAY';
    case TimeRange.MONTH_3:
      return 'INTERVAL 90 DAY';
    case TimeRange.MONTH_6:
      return 'INTERVAL 180 DAY';
    case TimeRange.YEAR_1:
      return 'INTERVAL 365 DAY';
    default:
      return 'INTERVAL 7 DAY';
  }
};

/**
 * Gets the previous interval based on the current time range
 * @param timeRange - The current time range
 * @returns A BigQuery interval string for the previous period
 */
const getPreviousInterval = (timeRange: TimeRange): string => {
  switch (timeRange) {
    case TimeRange.HOUR_1:
      return 'INTERVAL 2 HOUR';
    case TimeRange.HOUR_3:
      return 'INTERVAL 6 HOUR';
    case TimeRange.HOUR_12:
      return 'INTERVAL 24 HOUR';
    case TimeRange.DAY_1:
      return 'INTERVAL 48 HOUR';
    case TimeRange.WEEK_1:
      return 'INTERVAL 14 DAY';
    case TimeRange.WEEK_2:
      return 'INTERVAL 28 DAY';
    case TimeRange.MONTH_1:
      return 'INTERVAL 60 DAY';
    case TimeRange.MONTH_3:
      return 'INTERVAL 180 DAY';
    case TimeRange.MONTH_6:
      return 'INTERVAL 360 DAY';
    case TimeRange.YEAR_1:
      return 'INTERVAL 730 DAY';
    default:
      return 'INTERVAL 14 DAY';
  }
};

/**
 * Determines the appropriate GROUP BY clause based on the time range
 * @param timeRange - The time range to use for grouping
 * @returns A BigQuery GROUP BY clause
 */
const getGroupByClause = (timeRange: TimeRange): string => {
  if (
    timeRange === TimeRange.HOUR_1 ||
    timeRange === TimeRange.HOUR_3 ||
    timeRange === TimeRange.HOUR_6 ||
    timeRange === TimeRange.HOUR_12 ||
    timeRange === TimeRange.DAY_1
  ) {
    return 'DATETIME_TRUNC(soroban_operations.closed_at, HOUR)';
  }
  return 'DATE(soroban_operations.closed_at)';
};

export { getGroupByClause, getPreviousInterval, timeRangeToInterval };
