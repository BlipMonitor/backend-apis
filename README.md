# Blip Project Hub

Blip is a powerful, real-time smart contract monitoring dashboard designed specifically for the Stellar Soroban ecosystem. This project provides developers with essential tools to track, analyze, and optimize their Soroban smart contracts, enhancing the overall development experience on the Stellar network.

## About Blip

Blip addresses a critical need in the Stellar Soroban ecosystem by offering real-time monitoring and security insights for Soroban smart contracts. As Soroban continues to grow and evolve, Blip aims to become an indispensable tool for developers, project managers, and auditors working with Stellar's smart contract platform.

Key benefits of Blip for the Stellar Soroban ecosystem:

1. **Enhanced Contract Visibility**: Provides real-time insights into contract performance, transaction volumes, and error rates, allowing developers to quickly identify and resolve issues.

2. **Security Monitoring**: Helps detect potential security vulnerabilities and unusual activity patterns in Soroban contracts, contributing to a more secure ecosystem.

3. **Optimization Opportunities**: By tracking gas usage and transaction costs, Blip enables developers to optimize their contracts for better performance and cost-efficiency.

4. **Ecosystem Growth**: As a open-source tool, Blip encourages more developers to build on Soroban by providing professional-grade monitoring capabilities.

5. **Integration with Stellar Infrastructure**: Leverages Stellar's APIs and the Stellar SDK to provide accurate and up-to-date information about contract interactions on the network.

## Quick Start

Clone the repo:

```bash
git clone --depth 1 https://github.com/BlipMonitor/backend-apis.git
cd project-hub
npx rimraf ./.git
```

Install the dependencies:

```bash
yarn install
```

Set the environment variables:

```bash
cp .env.example .env

# open .env and modify the environment variables (if needed)
```

## Features

- **Real-time Monitoring**: Track contract activities, transactions, and events as they happen on the Stellar network.
- **Customizable Dashboards**: Create personalized views to focus on the metrics that matter most for your Soroban contracts.
- **Alert System**: Set up custom alerts for specific contract activities or anomalies.
- **Historical Data Analysis**: Access and analyze historical data to identify trends and patterns in contract usage.
- **Multi-Contract Support**: Monitor and compare multiple Soroban contracts simultaneously.
- **Stellar Network Integration**: Seamless integration with Stellar's infrastructure using @stellar/stellar-sdk.
- **BigQuery Integration**: Leverage Google BigQuery for efficient storage and analysis of large-scale contract data.
- **WebSocket Support**: Provide real-time updates to the frontend using WebSocket connections.

## Technical Stack

- **Backend**: Node.js with TypeScript and Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk integration
- **API Documentation**: Swagger
- **Process Management**: PM2
- **Containerization**: Docker support for easy deployment
- **Testing**: Jest for unit and integration testing

## Project Structure

```
src\
 |--config\         # Environment variables and configuration
 |--controllers\    # Route controllers (controller layer)
 |--docs\           # Swagger files
 |--middlewares\    # Custom express middlewares
 |--routes\         # Routes
 |--services\       # Business logic (service layer)
 |--utils\          # Utility classes and functions
 |--validations\    # Request data validation schemas
 |--queries\        # BigQuery queries for data analysis
 |--types\          # TypeScript type definitions
 |--app.ts          # Express app
 |--index.ts        # App entry point
```

## Commands

Running locally:

```bash
yarn dev
```

Running in production:

```bash
yarn start
```

Testing:

```bash
yarn test
```

Linting:

```bash
yarn lint
yarn lint:fix
```

## API Documentation

To view the list of available APIs and their specifications, run the server and go to `http://localhost:3000/v1/docs` in your browser. This documentation page is automatically generated using Swagger.

## Error Handling

The app has a centralized error handling mechanism. Controllers should use the `catchAsync` utility wrapper, which forwards the error to the error handling middleware.

```typescript
import catchAsync from '../utils/catchAsync';

const controller = catchAsync(async (req, res) => {
  // This error will be forwarded to the error handling middleware
  throw new Error('Something wrong happened');
});
```

## Validation

Request data is validated using [Joi](https://joi.dev/). Check the `src/validations` directory for validation schemas.

## Authentication

This project uses Clerk for authentication. To require authentication for certain routes, use the `auth` middleware.

```typescript
import express from 'express';
import auth from '../../middlewares/auth';
import * as userController from '../../controllers/user.controller';

const router = express.Router();

router.post('/users', auth(), userController.createUser);
```

## Authorization

The `auth` middleware can also be used to require certain permissions to access a route.

```typescript
router.post('/users', auth('manageUsers'), userController.createUser);
```

## Logging

Import the logger from `src/config/logger.ts`. It uses the Winston logging library.

```typescript
import logger from '<path to src>/config/logger';

logger.error('message');
logger.warn('message');
logger.info('message');
logger.http('message');
logger.debug('message');
```

## Contributing

Contributions are welcome! Please check out the [contributing guide](CONTRIBUTING.md).

## License

[MIT](LICENSE)

## Acknowledgements

Blip is proud to be part of the Stellar ecosystem and is committed to supporting the growth and adoption of Soroban smart contracts. We'd like to thank the Stellar Development Foundation for their ongoing support and the broader Stellar community for their valuable feedback and contributions.
