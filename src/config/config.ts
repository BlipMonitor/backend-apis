import dotenv from 'dotenv';
import Joi from 'joi';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(30)
      .description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(30)
      .description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    POSTMARK_API_TOKEN: Joi.string().description('the API token for Postmark'),
    CLERK_PUBLISHABLE_KEY: Joi.string()
      .required()
      .description('the publishable key of the Clerk client'),
    CLERK_SECRET_KEY: Joi.string().required().description('the secret of the Clerk client'),
    CLERK_API_KEY: Joi.string().required().description('the API key of the Clerk client'),
    GOOGLE_CLOUD_PROJECT: Joi.string()
      .required()
      .description('the project ID of the Google Cloud project'),
    GOOGLE_APPLICATION_CREDENTIALS: Joi.string()
      .required()
      .description('the path to the service account key JSON file')
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD
      }
    },
    from: envVars.EMAIL_FROM,
    postmarkApiToken: envVars.POSTMARK_API_TOKEN
  },
  clerk: {
    publishableKey: envVars.CLERK_PUBLISHABLE_KEY,
    secretKey: envVars.CLERK_SECRET_KEY,
    apiKey: envVars.CLERK_API_KEY
  },
  bigquery: {
    projectId: envVars.GOOGLE_CLOUD_PROJECT,
    keyFilename: envVars.GOOGLE_APPLICATION_CREDENTIALS,
    dataset: envVars.GOOGLE_BIGQUERY_DATASET,
    table: envVars.GOOGLE_BIGQUERY_TABLE
  }
};
