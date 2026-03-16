# Hex-WOrm Backend

## Local Prisma database setup

1. Copy `.env.example` to `.env` if you don't already have one.
2. Start local Postgres:

```bash
npm run db:start
```

3. Generate Prisma client and apply existing migrations:

```bash
npm run db:setup
```

4. Start the backend:

```bash
npm run dev
```

The local default connection string is:

`postgresql://postgres:postgres@localhost:5432/phishing_sim_dashboard?schema=public`

Set `DATABASE_URL` in your `.env` to override this for any other database.

To stop/remove the local DB container:

```bash
npm run db:stop
```
