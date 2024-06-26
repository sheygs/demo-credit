### demo-credit

> Demo credit is a mobile lending application

### Objective

Demo Credit is a mobile lending app that requires wallet functionality. This is needed as borrowers need a wallet to receive the loans they have been granted and also send the money for repayments.

### Technical Requirement

### Tasks

- A user can create an account
- A user can fund their account
- A user can transfer funds to another user’s account
- A user can withdraw funds from their account.
- A user with records in the Lendsqr Adjutor [Karma blacklist](https://api.adjutor.io/) should never be onboarded

Bonus:

- View and export a weekly report analysis of transactions.

Tips:

- Ensure all operations are safe from race conditions, deadlocks and transactional integrity
- Any patterns used for safe concurrency.
- Security measures for financial transactions.

### Tech Stack

- Language: [TypeScript](https://www.typescriptlang.org/)
- Framework: [Express](https://expressjs.com/)
- Runtime: [Node.js](https://nodejs.org/en)
- KnexJS: [KnexJS](https://knexjs.org/)
- Dependency Injection: [Tsyringe](https://www.npmjs.com/package/tsyringe)
- Database: [MySQL](https://www.mysql.com/)

### Setup

- [Docker](https://www.docker.com/)
- [Postman](https://www.postman.com/downloads/)
- [Git](https://git-scm.com/downloads)

### Installation 📦

```bash
   $ git clone https://github.com/sheygs/demo-credit.git
   $ cd backend
   $ npm install
```

- Rename`.env.dev` to `.env` and populate variables

#### Backend

- Run `npm run start:dev` to run the service
- Open browser and visit `http://localhost:8282`

### Test

```bash
   $ npm run test
```

### Postman Documentation

- Navigate to `http://localhost:8282/api-docs` on your computer to view the openapi documentation.
