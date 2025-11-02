# Job Board - Minimal Runnable ZIP (Demo)

This archive contains a minimal job-board demo:
- **server/**: Express + Mongoose backend
- **client/**: Static frontend (served by Express) — simple UI to post jobs and apply

## Quick Start (local)

1. Install Node.js (v18+ recommended).
2. Ensure MongoDB is running locally, or update `server/.env.example` and rename to `.env` with your MongoDB URI.
3. From the `server` folder, install dependencies and start:
   ```bash
   cd server
   npm install
   # copy .env.example -> .env and edit if needed
   npm start
   ```
4. Open `http://localhost:5000` in your browser. The Express server serves the `client` static files.

## Notes
- This is a minimal demo to get you running quickly. It intentionally simplifies authentication and security.
- In production, protect routes with authentication, validate inputs, and store uploads in cloud storage (S3/Cloudinary).
- To extend: add JWT auth, employer/candidate dashboards, email notifications, and deploy to Render/Vercel/MongoDB Atlas.

