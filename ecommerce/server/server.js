require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'client')));

const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

function read(file){ return JSON.parse(fs.readFileSync(file)); }
function write(file, data){ fs.writeFileSync(file, JSON.stringify(data, null, 2)); }

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

app.get('/api/products', (req,res)=>{
  const products = read(PRODUCTS_FILE);
  res.json(products);
});

app.get('/api/products/:id', (req,res)=>{
  const products = read(PRODUCTS_FILE);
  const p = products.find(x => x.id === req.params.id);
  if(!p) return res.status(404).json({ error: 'Product not found' });
  res.json(p);
});

// Auth: register
app.post('/api/auth/register', async (req,res)=>{
  const { name, email, password } = req.body;
  if(!email || !password) return res.status(400).json({ error: 'Missing fields' });
  const users = read(USERS_FILE);
  if(users.find(u=>u.email===email)) return res.status(400).json({ error: 'Email exists' });
  const hash = await bcrypt.hash(password, 10);
  const user = { id: uuidv4(), name: name||'', email, password: hash, createdAt: new Date().toISOString() };
  users.push(user);
  write(USERS_FILE, users);
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// Auth: login
app.post('/api/auth/login', async (req,res)=>{
  const { email, password } = req.body;
  const users = read(USERS_FILE);
  const user = users.find(u=>u.email===email);
  if(!user) return res.status(400).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if(!ok) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// middleware
function auth(req,res,next){
  const h = req.headers.authorization;
  if(!h) return res.status(401).json({ error: 'No token' });
  const token = h.split(' ')[1];
  try{
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  }catch(e){ return res.status(401).json({ error: 'Invalid token' }); }
}

// Place order (simulate payment)
app.post('/api/orders', auth, (req,res)=>{
  const { items, total, shipping } = req.body;
  if(!Array.isArray(items) || items.length===0) return res.status(400).json({ error: 'No items' });
  const orders = read(ORDERS_FILE);
  const order = { id: uuidv4(), userId: req.user.id, items, total, shipping, status: 'Processing', createdAt: new Date().toISOString() };
  orders.push(order);
  write(ORDERS_FILE, orders);
  res.json({ ok:true, orderId: order.id });
});

// serve client fallback
app.get('*', (req,res)=> {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log('E-commerce server running on', PORT));
