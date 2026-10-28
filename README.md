# Smart Expense Tracker

A full-stack expense tracker with a React dashboard and an Express/MongoDB API.

## Requirements

- Node.js and npm
- MongoDB

## Run locally

1. Configure the server environment:

   ```powershell
   cd server
   Copy-Item .env.example .env
   ```

   Set `MONGO_URI` to your MongoDB connection string and replace `JWT_SECRET` with a
   long, random value. Never commit the `.env` file.

2. Install dependencies and start the API:

   ```powershell
   npm install
   npm run dev
   ```

3. In a separate terminal, install dependencies and start the React app:

   ```powershell
   cd client
   npm install
   npm run dev
   ```

The Vite development server proxies `/api` requests to `http://localhost:5000`.

## Production build

From the `client` directory, run:

```powershell
npm run build
```

This repository contains the application source. Hosting the source on GitHub does
not by itself deploy the app; the API and frontend need to be deployed separately
for a live production site.
