import * as postmark from 'postmark';

import config from '../config/config';
import logger from '../config/logger';

const client = new postmark.ServerClient(config.email.postmarkApiToken);

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} textBody
 * @param {string} htmlBody
 * @returns {Promise}
 */
const sendEmail = async (to: string, subject: string, textBody: string, htmlBody: string) => {
  try {
    await client.sendEmail({
      From: config.email.from,
      To: to,
      Subject: subject,
      TextBody: textBody,
      HtmlBody: htmlBody
    });
  } catch (error) {
    logger.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to: string, token: string) => {
  const subject = 'Reset password';
  // replace this url with the link to the reset password page of your front-end app
  const resetPasswordUrl = `http://link-to-app/reset-password?token=${token}`;
  const text = `Dear user,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;
  await sendEmail(to, subject, text, '');
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to: string, token: string) => {
  const subject = 'Email Verification';
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `http://link-to-app/verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}`;
  await sendEmail(to, subject, text, '');
};

export default {
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail
};
