# Job applications – Vue frontend

Minimal Vue 3 + Vite app for the GraphQL backend.

## Run

1. Start the Nest server (from `server/`): `npm run dev`
2. Start the client: `npm run dev`

App runs at http://localhost:5173 and proxies `/graphql` to http://localhost:3000.

## Build

`npm run build` → output in `dist/`. Set `VITE_GRAPHQL_URL` to your API URL (e.g. `http://localhost:3000/graphql`) when serving the build.
