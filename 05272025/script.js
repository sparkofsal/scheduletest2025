const sheetID = '1wqrnyX4_b0gbuDLnYh-3cX_h5SZwoBq7_fG4BFTnL1w';
const scrollContainer = document.getElementById('table-container');
const scrollContent = document.getElementById('scroll-content');
const headerRow = document.getElementById('table-headers');

let scrollSpeed = 1;
let isPaused = false;
let scrollStarted = false;

function updateClock() {
  const now = new Date();
  document.getElementById('datetime').textContent = now.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

async function loadSchedule() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&cacheBuster=${Date.now()}`;
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substr(47).slice(0, -2));

    const rows = json.table.rows;
    const cols = json.table.cols;

    // Build headers
    headerRow.innerHTML = '';
    headerRow.innerHTML = cols.map(col => `<th>${col.label}</th>`).join('');

    // Build body rows
    scrollContent.innerHTML = '';
    rows.forEach(row => {
      const tr = document.createElement('tr');
      row.c.forEach(cell => {
        const td = document.createElement('td');
        td.textContent = cell?.v ?? '';
        tr.appendChild(td);
      });
      scrollContent.appendChild(tr);
    });

    // Duplicate rows for seamless scrolling
    rows.forEach(row => {
      const tr = document.createElement('tr');
      row.c.forEach(cell => {
        const td = document.createElement('td');
        td.textContent = cell?.v ?? '';
        tr.appendChild(td);
      });
      scrollContent.appendChild(tr);
    });

    if (!scrollStarted) {
      scrollStarted = true;
      scrollStep();
    }
  } catch (err) {
    scrollContent.innerHTML = '<tr><td colspan="100%">⚠️ Failed to load schedule.</td></tr>';
    console.error('Error loading schedule:', err);
  }
}

function scrollStep() {
  if (!isPaused) {
    scrollContainer.scrollTop += scrollSpeed;

    const resetPoint = scrollContent.scrollHeight / 2;
    if (scrollContainer.scrollTop >= resetPoint) {
      scrollContainer.scrollTop = 0;
    }
  }
  requestAnimationFrame(scrollStep);
}

// Pause scroll on hover
scrollContainer.addEventListener('mouseenter', () => { isPaused = true; });
scrollContainer.addEventListener('mouseleave', () => { isPaused = false; });

// Init
loadSchedule();
updateClock();
setInterval(loadSchedule, 3 * 60 * 1000);
setInterval(updateClock, 1000);
