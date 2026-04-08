const fs = require('fs');

// ===== 1. Fix dashboard.html =====
let d = fs.readFileSync('c:/Pirabel Labs/temp_repo/app/views/dashboard.html', 'utf8');

// Fix the ga-btn style block to add ga-chart-container and responsive rules
d = d.replace(
  /\.ga-btn\{background:transparent;border:none;color:var\(--muted\);padding:\.4rem \.8rem;font-size:\.7rem;font-family:inherit;cursor:pointer;text-transform:uppercase;letter-spacing:\.06em;\}\s*\.ga-btn:hover\{color:var\(--text\);\}\s*\.ga-btn\.ga-active\{background:var\(--accent\);color:#000;font-weight:700;\}/,
  `.ga-btn{background:transparent;border:none;color:var(--muted);padding:.4rem .8rem;font-size:.7rem;font-family:inherit;cursor:pointer;text-transform:uppercase;letter-spacing:.06em;}
    .ga-btn:hover{color:var(--text);}
    .ga-btn.ga-active{background:var(--accent);color:#000;font-weight:700;}
    .ga-chart-container{position:relative;height:220px;width:100%;}
    @media(max-width:900px){.ga-chart-container{height:160px;}.chart-row-3{grid-template-columns:1fr!important;}}
    @media(max-width:600px){.ga-chart-container{height:120px;}.grid-2{grid-template-columns:1fr!important;}.search-wrap{display:none;}}`
);

fs.writeFileSync('c:/Pirabel Labs/temp_repo/app/views/dashboard.html', d, 'utf8');
console.log('dashboard.html fixed');

// ===== 2. Fix candidates.html =====
let c = fs.readFileSync('c:/Pirabel Labs/temp_repo/app/views/candidates.html', 'utf8');

// Replace the non-responsive kanban style with responsive one
c = c.replace(
  '.kanban{display:grid;grid-template-columns:repeat(7,minmax(220px,1fr));gap:.75rem;overflow-x:auto;padding-bottom:1rem;}',
  '.kanban{display:grid;grid-template-columns:repeat(7,minmax(200px,1fr));gap:.75rem;overflow-x:auto;padding-bottom:1rem;-webkit-overflow-scrolling:touch;min-height:50vh;}'
);

// Add mobile media queries before </style>
c = c.replace(
  '.detail-row strong{color:var(--muted);text-transform:uppercase;font-size:.65rem;letter-spacing:.06em;}\n</style>',
  `.detail-row strong{color:var(--muted);text-transform:uppercase;font-size:.65rem;letter-spacing:.06em;}
/* Mobile responsive */
@media(max-width:768px){
  .kanban{grid-template-columns:repeat(4,minmax(170px,1fr));}
  .kanban-body{max-height:60vh;}
}
@media(max-width:500px){
  .kanban{grid-template-columns:repeat(2,minmax(160px,1fr));}
}
</style>`
);

// Add hamburger button to topbar for mobile sidebar toggle
if (!c.includes('hamburger-dash')) {
  c = c.replace(
    '<div style="display:flex;align-items:center;gap:1rem;">\n      <div class="topbar-title">Candidatures</div>',
    '<div style="display:flex;align-items:center;gap:1rem;">\n      <button class="hamburger-dash" onclick="document.getElementById(\'sidebar\').classList.toggle(\'open\')"><span class="material-symbols-outlined">menu</span></button>\n      <div class="topbar-title">Candidatures</div>'
  );
}

fs.writeFileSync('c:/Pirabel Labs/temp_repo/app/views/candidates.html', c, 'utf8');
console.log('candidates.html fixed');
