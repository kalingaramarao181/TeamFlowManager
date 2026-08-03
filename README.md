# TeamFlowManager

TeamFlowManager is a React, Express, and MySQL work-management platform. The
current application supports projects, issues, daily employee work status,
reports, weekly timesheets, administrative review, users, and holidays.

## Local setup

1. Install Node.js 20 and MySQL 8.
2. Create a dedicated MySQL application user. Do not run the application with
   the MySQL `root` account.
3. Import the required schema into a non-production database. The repository SQL
   export may contain personal data and must not be used as a public fixture.
4. Copy `server/.env.example` to `server/.env` and provide private values.
5. Run `npm install` in both `server` and `client`.
6. Start the API with `npm start` from `server`.
7. Start the web application with `npm start` from `client`.

The API defaults to `http://localhost:4000` and the web application to
`http://localhost:3000`.

## Security

- Never commit `.env` files, database exports, employee uploads, or credentials.
- Rotate the database password that previously existed in source history.
- Use a least-privilege database account.
- Production deployments require HTTPS and a restricted `CORS_ORIGINS` value.
- Public upload URLs are retained temporarily for compatibility and must be
  replaced by authenticated download endpoints before production use.

## Architecture

- `client/src/api`: HTTP client boundary
- `client/src/Pages` and `client/src/component`: screens and reusable UI
- `server/routes`: HTTP routing and authorization boundary
- `server/controllers`: request orchestration
- `server/models`: MySQL access
- `server/middlewares`: authentication and shared request policy
- `docs/ENTERPRISE_ROADMAP.md`: staged enterprise migration

## Current production blockers

- The existing schema needs versioned migrations and database-backed RBAC.
- Resource ownership checks must be added to user-specific endpoints.
- Uploads need an allowlist, size limits, malware scanning, and private storage.
- Authentication needs refresh-token rotation, session revocation, login history,
  and account lockout.
- Automated tests and CI quality gates are required.

See [the enterprise roadmap](docs/ENTERPRISE_ROADMAP.md) for the planned delivery
sequence and definition of done.

