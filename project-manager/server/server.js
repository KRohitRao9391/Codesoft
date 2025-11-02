const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'client')));

const DATA_DIR = path.join(__dirname, 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

function ensureFile(file, init){
  if(!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(init, null, 2));
}
ensureFile(PROJECTS_FILE, []);
ensureFile(USERS_FILE, [
  { "id": "u1", "name": "Alice" },
  { "id": "u2", "name": "Bob" }
]);
ensureFile(TASKS_FILE, []);

function read(file){ return JSON.parse(fs.readFileSync(file)); }
function write(file, data){ fs.writeFileSync(file, JSON.stringify(data, null, 2)); }

// Projects API
app.get('/api/projects', (req,res)=> {
  const projects = read(PROJECTS_FILE);
  res.json(projects);
});
app.post('/api/projects', (req,res)=> {
  const { title, description, dueDate } = req.body;
  if(!title) return res.status(400).json({ error: 'Title required' });
  const projects = read(PROJECTS_FILE);
  const p = { id: uuidv4(), title, description: description||'', dueDate: dueDate||null, createdAt: new Date().toISOString() };
  projects.push(p);
  write(PROJECTS_FILE, projects);
  res.json(p);
});
app.get('/api/projects/:id', (req,res)=> {
  const projects = read(PROJECTS_FILE);
  const p = projects.find(x=>x.id===req.params.id);
  if(!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

// Users
app.get('/api/users', (req,res)=> {
  const users = read(USERS_FILE);
  res.json(users);
});

// Tasks
app.get('/api/tasks', (req,res)=> {
  const tasks = read(TASKS_FILE);
  res.json(tasks);
});
app.post('/api/tasks', (req,res)=> {
  const { title, projectId, assigneeId, dueDate, status } = req.body;
  if(!title || !projectId) return res.status(400).json({ error: 'Title and projectId required' });
  const tasks = read(TASKS_FILE);
  const t = { id: uuidv4(), title, projectId, assigneeId: assigneeId||null, dueDate: dueDate||null, status: status||'Todo', createdAt: new Date().toISOString() };
  tasks.push(t);
  write(TASKS_FILE, tasks);
  res.json(t);
});
app.put('/api/tasks/:id', (req,res)=> {
  const tasks = read(TASKS_FILE);
  const idx = tasks.findIndex(x=>x.id===req.params.id);
  if(idx===-1) return res.status(404).json({ error: 'Not found' });
  const updated = Object.assign(tasks[idx], req.body);
  tasks[idx] = updated;
  write(TASKS_FILE, tasks);
  res.json(updated);
});

// Dashboard summary
app.get('/api/summary', (req,res)=> {
  const projects = read(PROJECTS_FILE);
  const tasks = read(TASKS_FILE);
  const users = read(USERS_FILE);
  const summary = {
    projectsCount: projects.length,
    tasksCount: tasks.length,
    byStatus: tasks.reduce((acc,t)=> (acc[t.status] = (acc[t.status]||0)+1, acc), {}),
    upcomingDeadlines: tasks.filter(t => t.dueDate).sort((a,b)=> new Date(a.dueDate)-new Date(b.dueDate)).slice(0,5)
  };
  res.json(summary);
});

// Serve client SPA fallback
app.get('*', (req,res)=> {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log('Project Manager server running on', PORT));
