# Gong Fu Tea Scheduler — Frontend

React 18 (Create React App) + Material UI client for the Gong Fu Tea
appointment scheduler. Talks to the Django backend in `../SchedAppBE`.

## Setup

```bash
yarn install
yarn start        # http://localhost:3000
```

The backend must be running on `http://localhost:8000` (see the backend
README). To point at a different API, copy `.env.example` to `.env` and set
`REACT_APP_API_URL`.

## Structure

- `src/api/client.js` — the single axios instance: base URL, cookie
  credentials, CSRF header, and automatic JWT refresh on 401. All API calls go
  through it.
- `src/context/AuthContext.js` — login/logout/register state shared app-wide.
- `src/theme.js` — the MUI theme with the tea-house palette.
- `src/pages/` — routed pages (calendar, profile, admin dashboard, auth flows).
- `src/components/adminDash/` — admin dashboard panels.
- `src/components/navbar/` — navigation, routing, and route guards
  (`ProtectedRoute`, `AdminRoute`).

## Commands

```bash
yarn start    # dev server with hot reload
yarn build    # production build in ./build
yarn test     # jest test runner
```
