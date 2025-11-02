const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');

// simple get all jobs
router.get('/', async (req,res)=>{
  const q = req.query.q || '';
  const filter = q ? { title: { $regex: q, $options: 'i' } } : {};
  const jobs = await Job.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json(jobs);
});

// post job (no auth in this minimal ZIP) - in prod protect this route
router.post('/', async (req,res)=>{
  try{
    const job = await Job.create(req.body);
    res.json(job);
  }catch(e){ res.status(500).json({ error: e.message }); }
});

// job detail
router.get('/:id', async (req,res)=>{
  const job = await Job.findById(req.params.id).populate('postedBy','name email');
  if(!job) return res.status(404).json({ msg: 'Not found' });
  res.json(job);
});

// apply to job (multipart/form-data)
router.post('/:id/apply', upload.single('resume'), async (req,res)=>{
  try{
    const job = await Job.findById(req.params.id);
    if(!job) return res.status(404).json({ msg: 'Job not found' });
    // minimal: create a dummy applicant user if email provided
    let applicant = null;
    if(req.body.email){
      applicant = await User.findOne({ email: req.body.email });
      if(!applicant){
        applicant = await User.create({ name: req.body.name || 'Applicant', email: req.body.email, password: 'placeholder', role: 'candidate' });
      }
    }
    const resumeUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const application = await Application.create({
      job: job._id,
      applicant: applicant ? applicant._id : null,
      resumeUrl,
      coverLetter: req.body.coverLetter || ''
    });
    res.json({ msg: 'Applied', application });
  }catch(e){ console.error(e); res.status(500).json({ error: e.message }); }
});

module.exports = router;
