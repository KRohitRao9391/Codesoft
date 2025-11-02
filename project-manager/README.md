Project Manager - Minimal Runnable ZIP

This demo provides a lightweight project management tool (no external DB).

Features:
- Create projects
- Create tasks and assign to users
- View projects, tasks, and a dashboard summary

How to run:
1. Extract the zip.
2. Install Node.js (v14+).
3. cd project-manager/server
4. npm install
5. npm start
6. Open http://localhost:5000

Notes:
- Data is persisted to JSON files in server/data/.
- To extend: add authentication, change storage to MongoDB/Postgres, add real-time updates with Socket.io.
