/**
 * Represents a recent transaction for a Soroban contract
 */
export interface RecentTransaction {
  contractId: string;
  contractNickname: string | null;
  sourceAccount: string;
  transactionHash: string;
  ledgerSequence: number;
  createdAt: string;
  functionName: string;
  parameters: string;
  successful: boolean;
  feeCharged: number;
}

/**
 * Represents a recent event for a Soroban contract
 */
export interface RecentEvent {
  contractId: string;
  contractNickname: string | null;
  transactionHash: string;
  ledgerSequence: number;
  createdAt: string;
  eventType: string;
  topics: string[];
  data: any;
  successful: boolean;
  inSuccessfulContractCall: boolean;
}

/**
 * Represents a recent alert for a Soroban contract
 */
export interface RecentAlert {
  contractId: string;
  contractNickname: string | null;
  alertTime: string;
  totalTransactions: number;
  failedTransactions: number;
  errorRate: number;
}
