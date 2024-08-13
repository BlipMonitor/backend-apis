import { clerkClient } from '@clerk/clerk-sdk-node';
import cron from 'node-cron';

import logger from '../config/logger';
import alertService from '../services/alert.service';
import emailService from '../services/email.service';
import savedContractService from '../services/savedContract.service';
import { Alert, AlertParams } from '../types/alert';
import { validateAndSanitizeContractId } from '../utils/contractValidation';

function truncateContractId(contractId: string): string {
  if (contractId.length <= 10) {
    return contractId;
  }
  return `${contractId.slice(0, 6)}...${contractId.slice(-4)}`;
}

interface UserAlertData extends Alert {
  contractNickname: string;
  userName: string;
  userEmail: string;
}

/**
 * Fetches recent alerts for the given contract IDs from BigQuery
 * @param contractIds - Array of contract IDs
 * @param startTime - Start time for the alert period
 * @param endTime - End time for the alert period
 * @returns Array of Alert
 */
async function fetchRecentAlerts(
  contractIds: string[],
  startTime: Date,
  endTime: Date
): Promise<Alert[]> {
  try {
    logger.debug('Entering fetchRecentAlerts function');
    logger.debug(`Fetching alerts from ${startTime} to ${endTime}`);

    const alertParams: AlertParams = {
      contractIds,
      startTime,
      endTime
    };

    logger.debug('Calling alertService.getHourlylerts');
    const alerts = await alertService.getHourlylerts(alertParams);
    logger.debug(`Received ${alerts.length} alerts from alertService`);
    logger.debug(`Alerts: ${JSON.stringify(alerts, null, 2)}`);

    return alerts;
  } catch (error) {
    logger.error('Error fetching recent Soroban contract alerts:', error);
    throw new Error('Failed to fetch recent Soroban contract alerts');
  }
}

/**
 * Sends alert emails to users
 * @param userAlerts - Array of UserAlertData
 */
async function sendAlertEmail(userAlerts: UserAlertData[]): Promise<void> {
  if (userAlerts.length === 0) {
    logger.info('No alerts to send, skipping email');
    return;
  }

  const { userName, userEmail } = userAlerts[0];

  logger.info(`Preparing alert email for ${userName} (${userEmail})`);

  const alertsHtml = userAlerts
    .map(
      (alert) => `
    <h2>Alert for Contract ${alert.contractNickname} (${truncateContractId(alert.contractId)})</h2>
    <ul>
      <li>Total Transactions: ${alert.totalTransactions}</li>
      <li>Failed Transactions: ${alert.failedTransactions}</li>
      <li>Error Rate: ${alert.errorRate}%</li>
    </ul>
  `
    )
    .join('');

  const htmlBody = `
    <h1>Soroban Contract Alerts - ${new Date().toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone: 'UTC'
    })}</h1>
    <p>Hello ${userName},</p>
    <p>We detected increased error rates for the following contracts in the last hour:</p>
    ${alertsHtml}
    <p>Please check your contracts for any issues.</p>
  `;

  const textBody = `
    Soroban Contract Alerts

    Hello ${userName},

    We detected increased error rates for the following contracts:

    ${userAlerts
      .map(
        (alert) => `
    Alert for Contract ${alert.contractNickname} (${alert.contractId})
    - Total Transactions: ${alert.totalTransactions}
    - Failed Transactions: ${alert.failedTransactions}
    - Error Rate: ${alert.errorRate}%
    `
      )
      .join('\n')}

    Please check your contracts for any issues.

    - Blip Team
  `;

  try {
    logger.info(`Sending alert email to ${userEmail}`);
    await emailService.sendEmail(userEmail, 'Soroban Contract Alerts - Blip', textBody, htmlBody);
    logger.info(`Alert email sent successfully to ${userEmail} for ${userAlerts.length} contracts`);
  } catch (error) {
    logger.error(`Failed to send alert email to ${userEmail}:`, error);
  }
}

/**
 * Main function to run the alert email scheduler
 */
async function runAlertEmailScheduler(): Promise<void> {
  const endTime = new Date(Date.now() - 30 * 60 * 1000);
  const startTime = new Date(endTime.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago

  try {
    // Fetch all saved contracts with user data
    const savedContracts = await savedContractService.getAllSavedContractsWithUsers();

    const contractIds = savedContracts.map((contract) =>
      validateAndSanitizeContractId(contract.contractId)
    );

    // Fetch recent alerts
    logger.debug(`Fetching alerts from ${startTime} to ${endTime}`);
    const alerts = await fetchRecentAlerts(contractIds, startTime, endTime);

    // Group alerts by user
    const userAlerts: { [userId: string]: UserAlertData[] } = {};

    for (const alert of alerts) {
      const contract = savedContracts.find((c) => c.contractId === alert.contractId);
      if (contract) {
        for (const user of contract.users) {
          if (!userAlerts[user.userId]) {
            userAlerts[user.userId] = [];
          }
          userAlerts[user.userId].push({
            ...alert,
            contractNickname: user.nickname,
            userName: '', // We'll set this later
            userEmail: '' // We'll set this later
          });
        }
      }
    }

    // Fetch user data and send emails
    for (const [userId, alerts] of Object.entries(userAlerts)) {
      try {
        const user = await clerkClient.users.getUser(userId);
        const userName = user.firstName || 'User';
        const userEmail = user.emailAddresses[0]?.emailAddress;

        if (userEmail) {
          const userAlertsWithNames = alerts.map((alert) => ({
            ...alert,
            userName,
            userEmail
          }));
          await sendAlertEmail(userAlertsWithNames);
        } else {
          logger.warn(`No email found for user ${userId}`);
        }
      } catch (error) {
        logger.error(`Failed to fetch user data or send email for userId ${userId}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error in alert email scheduler:', error);
  }
}

// Schedule the job to run every hour at 30 minutes past the hour
const alertEmailJob = cron.schedule('51 * * * *', runAlertEmailScheduler);

export default alertEmailJob;
