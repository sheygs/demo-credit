### finpay

> A minimalistic wallet system designed to simplify financial management.

### Objective

The system must be robust and secure against financial frauds and technical issues like race conditions and deadlocks.

### Technical Requirement

- Implement safeguards against race conditions, deadlocks, and ensure
  transactional integrity.

### Tasks

1. Core Wallet Functionality:

      - Create RESTful APIs for the wallet system that supports:

           - Crediting an amount to the wallet.
           - Debiting an amount from the wallet.

      - Ensure all operations are safe from race conditions and deadlocks.

2. Technical Documentation:

      - Document your code extensively.
      - Write a technical report detailing decisions taken during the design and
        implementation phases, including but not limited to:

           - Schema design.
           - Choice of libraries and frameworks.
           - Any patterns used for safe concurrency.
           - Security measures for financial transactions.

3. Postman Documentation:

      - Provide a Postman collection that covers all API endpoints with example requests and expected responses.

4. Admin Dashboard:

      - Develop an admin dashboard with capabilities to:

           - Manually credit or debit amounts to/from wallets.
           - View and export a weekly report analysis of transactions.

      - Include functionalities to seed data into the system for testing purposes.

5. Version Control:

      - Push your code to a GitHub repository.
      - Ensure the repository is public and includes a `README.md` file with setup and
        running instructions.

### Tech Stack

- Language: [TypeScript](https://www.typescriptlang.org/)
- Framework: [Express](https://expressjs.com/)
- ORM: [Sequelize](https://sequelize.org/)
- Runtime: [Node.js](https://nodejs.org/en)
- Frontend (UI): [ReactJS](https://react.dev/)
- Database: [SQLite](https://sqlite.org/)

### Setup

- [Docker](https://www.docker.com/)
- [Postman](https://www.postman.com/downloads/)
- [Git](https://git-scm.com/downloads)

### Installation 📦

```bash
   $ git clone https://github.com/sheygs/finpay.git
   $ cd finpay
   $ npm install
```

### Rename`.env.dev` to `.env` and populate variables

```bash
PORT=8282
NODE_ENV=development
SQLITE_PASSWORD=****
SQLITE_PORT=5432
SQLITE_HOST=postgres
SQLITE_USER=postgres
SQLITE_DATABASE=****
JWT_SECRET=****
JWT_EXPIRES_IN=*d
JWT_COOKIE_EXPIRES_IN=*
```

#### Using Docker (Recommended)

- Run `docker-compose up -d`.
- Open browser and visit `http://localhost:8282`

### Test

```bash
   $ npm run test
```

### Postman Documentation

- Please see `/postman_docs` directory on the root OR
- Navigate to `http://localhost:8282/api-docs` on your computer to view the openapi documentation.

#### Improvement Points
