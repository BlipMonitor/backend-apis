/**
 * Compared metric data for total/overall counts
 */
export interface ComparedMetric {
  previousCount: number | null;
  absoluteChange: number;
  percentageChange: number | null;
}

/**
 * Interval transaction volume data
 */
export interface IntervalTransactionVolume {
  date: string;
  transactionCount: number;
}

/**
 * Transaction volume data with comparison for total volume
 */
export interface TransactionVolumeWithComparison {
  intervalVolumes: IntervalTransactionVolume[];
  totalVolume: number;
  comparedTotalVolume: ComparedMetric;
}

/**
 * Interval transaction success rate data
 */
export interface IntervalTransactionSuccessRate {
  date: string;
  transactionCount: number;
  successfulTransactions: number;
  failedTransactions: number;
  intervalSuccessRate: number;
  intervalFailureRate: number;
}

/**
 * Transaction success rate data with comparison for overall rates
 */
export interface TransactionSuccessRateWithComparison {
  intervalSuccessRates: IntervalTransactionSuccessRate[];
  totalTransactions: number;
  totalSuccessful: number;
  totalFailed: number;
  overallSuccessRate: number;
  overallFailureRate: number;
  comparedTotalTransactions: ComparedMetric;
  comparedTotalSuccessful: ComparedMetric;
  comparedTotalFailed: ComparedMetric;
  comparedOverallSuccessRate: ComparedMetric;
  comparedOverallFailureRate: ComparedMetric;
}

/**
 * Interval unique users data
 */
export interface IntervalUniqueUsers {
  date: string;
  uniqueUsers: number;
}

/**
 * Unique users data with comparison for total unique users
 */
export interface UniqueUsersWithComparison {
  intervalUniqueUsers: IntervalUniqueUsers[];
  totalUniqueUsers: number;
  comparedTotalUniqueUsers: ComparedMetric;
}

/**
 * Interval transaction fees data
 */
export interface IntervalTransactionFees {
  date: string;
  totalFees: number;
  avgFee: number;
  transactionCount: number;
}

/**
 * Transaction fees data with comparison for overall fees
 */
export interface TransactionFeesWithComparison {
  intervalFees: IntervalTransactionFees[];
  overallTotalFees: number;
  overallAvgFee: number;
  overallTotalTransactions: number;
  comparedOverallTotalFees: ComparedMetric;
  comparedOverallAvgFee: ComparedMetric;
  comparedOverallTotalTransactions: ComparedMetric;
}

/**
 * Top event data with comparison
 */
export interface TopEvent {
  contractId: string;
  contractNickname: string;
  eventName: string;
  eventCount: number;
  compared: ComparedMetric;
}

/**
 * Top user data with comparison
 */
export interface TopUser {
  contractId: string;
  contractNickname: string;
  user: string;
  transactionCount: number;
  compared: ComparedMetric;
}
