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

const DATA_FILE = path.join(__dirname, 'data', 'quizzes.json');

// ensure data file exists
if(!fs.existsSync(DATA_FILE)){
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

function readData(){
  return JSON.parse(fs.readFileSync(DATA_FILE));
}
function writeData(data){
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// API: list quizzes
app.get('/api/quizzes', (req,res)=>{
  const quizzes = readData();
  // hide answers in listing
  const list = quizzes.map(q => ({ id: q.id, title: q.title, description: q.description, questionsCount: q.questions.length, createdAt: q.createdAt }));
  res.json(list);
});

// API: get quiz detail (without exposing correct answers)
app.get('/api/quizzes/:id', (req,res)=>{
  const quizzes = readData();
  const q = quizzes.find(x => x.id === req.params.id);
  if(!q) return res.status(404).json({ error: 'Not found' });
  // send quiz but strip correctIndex
  const safe = {
    id: q.id,
    title: q.title,
    description: q.description,
    questions: q.questions.map(qq => ({ text: qq.text, options: qq.options }))
  };
  res.json(safe);
});

// API: create quiz
app.post('/api/quizzes', (req,res)=>{
  const { title, description, questions } = req.body;
  if(!title || !Array.isArray(questions) || questions.length===0) return res.status(400).json({ error: 'Invalid payload' });
  // each question: { text, options:[], correctIndex }
  const quizzes = readData();
  const newQ = {
    id: uuidv4(),
    title,
    description: description||'',
    questions: questions.map(q => ({ text: q.text, options: q.options, correctIndex: Number(q.correctIndex) })),
    createdAt: new Date().toISOString()
  };
  quizzes.push(newQ);
  writeData(quizzes);
  res.json({ ok: true, id: newQ.id });
});

// API: submit answers
app.post('/api/quizzes/:id/submit', (req,res)=>{
  const { answers } = req.body; // array of selected indices
  const quizzes = readData();
  const q = quizzes.find(x => x.id === req.params.id);
  if(!q) return res.status(404).json({ error: 'Not found' });
  if(!Array.isArray(answers)) return res.status(400).json({ error: 'Answers array required' });
  let score = 0;
  const details = q.questions.map((ques, idx) => {
    const sel = typeof answers[idx] === 'number' ? answers[idx] : null;
    const correct = Number(ques.correctIndex);
    const isCorrect = sel === correct;
    if(isCorrect) score++;
    return { index: idx, question: ques.text, selected: sel, correctIndex: correct, isCorrect, options: ques.options };
  });
  res.json({ total: q.questions.length, score, details });
});

// fallback to client index.html for SPA
app.get('*', (req,res)=> {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log('Quiz Maker server running on', PORT));
