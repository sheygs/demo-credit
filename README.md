### demo-credit

> Demo Credit is a mobile lending app with wallet functionality for borrowers to receive loans and make repayments.

### Objective

Demo Credit is a mobile lending app that includes wallet functionality. Borrowers use the wallet to receive granted loans and make repayments.

### Project Architecture

Overall, the project is designed to be scalable, maintainable and extensible. The use of a modular monolithic architecture, where all key features are modularized. This can easily spin off to a micro-service that easily promotes code organization and separation of concerns.

### E-R Diagram

![E-R Diagram](./demo-credit-E-R-diagram.png)

### Technical Requirement

- A user can create an account
- A user can fund their account
- A user can transfer funds to another user’s account
- A user can withdraw funds from their account.
- A user with records in the Lendsqr Adjutor [Karma blacklist](https://api.adjutor.io/) should never be onboarded

### Tech Stack

- Language: [TypeScript](https://www.typescriptlang.org/)
- Framework: [Express](https://expressjs.com/)
- Runtime: [Node.js](https://nodejs.org/en)
- KnexJS: [KnexJS](https://knexjs.org/)
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

- Rename`.env.dev` to `.env` and populate variables with `****`

### Seeding

### Using Docker (Recommended)

- Run `docker compose up -d`.
- Open browser and visit `http://localhost:8281`

### Test

```bash
   $ npm run test
```

### API Documentation

- Navigate to `http://localhost:8281/api-docs` on your computer to view the openapi documentation.
