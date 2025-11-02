async function loadSummary(){
  const res = await fetch('/api/summary');
  const s = await res.json();
  const el = document.getElementById('summary');
  el.innerHTML = '<div class="card"><h2>Dashboard</h2><p>Projects: '+s.projectsCount+'</p><p>Tasks: '+s.tasksCount+'</p><p>Status breakdown: '+JSON.stringify(s.byStatus)+'</p></div>';
}
loadSummary();
