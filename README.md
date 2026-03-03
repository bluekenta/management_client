# Job applications – Vue frontend

Minimal Vue 3 + Vite app for the GraphQL backend.

## Run

1. Start the Nest server (from `server/`): `npm run dev`
2. Start the client: `npm run dev`

App runs at http://localhost:9999 and proxies `/graphql` to http://localhost:9998.

## Build

`npm run build` → output in `dist/`. Set `VITE_GRAPHQL_URL` to your API URL (e.g. `http://localhost:9998/graphql`) when serving the build.
