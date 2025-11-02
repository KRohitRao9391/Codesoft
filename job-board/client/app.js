const API_BASE = '/api';

async function fetchJobs(q=''){
  const res = await fetch(API_BASE + '/jobs' + (q? '?q='+encodeURIComponent(q):''));
  return res.json();
}

function renderJobs(list){
  const container = document.getElementById('jobs');
  container.innerHTML = '';
  if(!list.length) { container.innerHTML = '<p>No jobs found.</p>'; return; }
  list.forEach(j => {
    const el = document.createElement('div');
    el.className = 'job';
    el.innerHTML = `<h3>${escapeHtml(j.title)}</h3>
      <p><strong>${escapeHtml(j.company||'')}</strong> — ${escapeHtml(j.location||'')}</p>
      <p>${escapeHtml((j.description||'').slice(0,200))}...</p>
      <p><a href="#" data-id="${j._id}" class="view">View / Apply</a></p>`;
    container.appendChild(el);
  });
}

function escapeHtml(str){ return String(str).replace(/[&<>"]/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[s])); }

document.getElementById('searchBtn').addEventListener('click', async ()=>{
  const q = document.getElementById('q').value.trim();
  const jobs = await fetchJobs(q);
  renderJobs(jobs);
});

// initial load
fetchJobs().then(renderJobs);

// post job form
document.getElementById('postJob').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = {};
  fd.forEach((v,k)=> payload[k]=v);
  const res = await fetch('/api/jobs',{ method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
  if(res.ok){ alert('Posted'); fetchJobs().then(renderJobs); e.target.reset(); }
  else alert('Error posting');
});

// delegate view/apply
document.getElementById('jobs').addEventListener('click', (e)=>{
  if(e.target.matches('.view')){
    e.preventDefault();
    const id = e.target.dataset.id;
    showApply(id);
  }
});

let currentJobId = null;
function showApply(id){
  currentJobId = id;
  document.getElementById('applySection').style.display = 'block';
  window.scrollTo({ top: document.getElementById('applySection').offsetTop - 20, behavior: 'smooth' });
}

// apply form submit
document.getElementById('applyForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  if(!currentJobId){ alert('No job selected'); return; }
  const form = e.target;
  const fd = new FormData();
  fd.append('name', form.name.value);
  fd.append('email', form.email.value);
  fd.append('coverLetter', form.coverLetter.value);
  if(form.resume.files[0]) fd.append('resume', form.resume.files[0]);
  const res = await fetch('/api/jobs/' + encodeURIComponent(currentJobId) + '/apply', { method:'POST', body: fd });
  if(res.ok){ alert('Applied successfully'); form.reset(); document.getElementById('applySection').style.display='none'; fetchJobs().then(renderJobs); }
  else { alert('Error applying'); }
});
