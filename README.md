# TQMS Checkpoint Frontend

Next.js App Router frontend for the TQMS checkpoint portal. The UI is organized by feature and talks to the NestJS mock API through a replaceable HTTP client.

For full project setup, API details and known limitations, see the [project README](../README.md).

## Local development

From this directory:

```bash
npm ci
cp .env.example .env.local
npm run dev
```

The app runs at `http://localhost:3000`. Start the backend in a second terminal before using authenticated pages. Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api` in `.env.local` to connect to the local NestJS backend, then restart Next.js after changing the value.

## Commands

```bash
npm run typecheck
npm run build
npm start
```

There is no automated frontend test script configured at this time.
For backend smoke checks and the manual browser checklist, see the [step-by-step testing guide](docs/TESTING_GUIDE.md).

## Feature structure

```text
src/
  app/                    App Router pages and layouts
  features/<feature>/     Feature APIs, hooks, schemas, types and components
  shared/api/             HTTP client, errors and lookup cache
  shared/forms/           React Hook Form fields, validation and error mapping
  shared/ui/              Tables, dialogs, pagination, status, toast and states
  shared/layout/          Authenticated application shell and navigation
```

Feature components call feature hooks; feature API modules use `apiFetch`. TanStack Query manages server data and cache invalidation. React Hook Form and Zod manage forms. Shared UI components keep lists and form behavior consistent. See [API_CONTRACT.md](docs/API_CONTRACT.md) and [SYSTEM_ANALYSIS.md](docs/SYSTEM_ANALYSIS.md).

## API URL

`NEXT_PUBLIC_API_BASE_URL` selects the API server. For local development use `http://localhost:4000/api`. `/api` is only suitable when a deployment proxy forwards that path to the backend; this project does not include Next.js API route handlers.
