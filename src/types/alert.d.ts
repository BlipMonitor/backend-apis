import { AlertType } from '@prisma/client';

/**
 * Represents an alert for a Soroban contract
 */
export interface Alert {
  id: string;
  contractId: string;
  contractNickname: string | null;
  alertTime: Date;
  alertType: AlertType;
  totalTransactions: number;
  failedTransactions: number;
  errorRate: number;
  message: string;
}

/**
 * Represents the parameters for fetching alerts
 */
export interface AlertParams {
  contractIds: string[];
  startTime: Date;
  endTime: Date;
}
