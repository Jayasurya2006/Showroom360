# Showroom360

MERN billing and inventory system (Owner and Client roles).

## Run locally
1. `cd server && npm install && cp .env.example .env` — fill in `MONGO_URI`, `JWT_SECRET`, and the `OWNER_*` values (your owner login).
2. `npm run seed` (creates owner, 22 products, 2 sample clients, 4 sample invoices), then `npm run dev`.
3. `cd client && npm install && cp .env.example .env && npm run dev` → http://localhost:5173
Sample clients: anita@example.com / karthik@example.com, password `Client@1234` (demo only; change before deploying).

## Deploy
- MongoDB Atlas: create a cluster, allow network access, copy the connection string to `MONGO_URI`.
- Render (server): root `server`, build `npm install`, start `npm start`; set `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN` (your Vercel URL). Health check: `/api/health`.
- Vercel (client): root `client`, framework Vite; set `VITE_API_URL=https://<render-app>/api`.

## Notes
Tax/discount rates are configurable settings for demonstration and do not make invoices tax-compliant. Payment methods are only recorded; no gateway is integrated.
Stock is decremented atomically on the server (conditional update, rolled back on failure); repeated requests with the same `requestId` return the original invoice.
