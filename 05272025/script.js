const sheetID = '1wqrnyX4_b0gbuDLnYh-3cX_h5SZwoBq7_fG4BFTnL1w';

const scrollContainer = document.getElementById('table-container');
const scrollContent = document.getElementById('scroll-content');

let scrollSpeed = 1;
let isPaused = false;
let scrollStarted = false;

function updateClock() {
  const now = new Date();
  const formatted = now.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  document.getElementById('datetime').textContent = formatted;
}

async function loadSchedule() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&cacheBuster=${Date.now()}`;
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substr(47).slice(0, -2));

    const table = document.createElement('table');
    const rows = json.table.rows;

    // Headers
    const headers = json.table.cols.map(col => `<th>${col.label}</th>`).join('');
    table.innerHTML += `<tr>${headers}</tr>`;

    // Data Rows
    rows.forEach(row => {
      const cells = row.c.map(cell => `<td>${cell?.v ?? ''}</td>`).join('');
      table.innerHTML += `<tr>${cells}</tr>`;
    });

    // Double content for infinite scroll effect
    scrollContent.innerHTML = '';
    scrollContent.appendChild(table.cloneNode(true));
    scrollContent.appendChild(table.cloneNode(true));

    scrollContainer.scrollTop = 0;

    if (!scrollStarted) {
      scrollStarted = true;
      scrollStep();
    }
  } catch (err) {
    scrollContent.innerText = '⚠️ Failed to load schedule.';
    console.error('Error loading schedule:', err);
  }
}

function scrollStep() {
  if (!isPaused) {
    scrollContainer.scrollTop += scrollSpeed;

    const resetPoint = Math.floor(scrollContent.scrollHeight / 2);
    if (scrollContainer.scrollTop >= resetPoint) {
      scrollContainer.scrollTop = 0;
    }
  }
  requestAnimationFrame(scrollStep);
}

// Pause on hover/focus
scrollContainer.addEventListener('mouseenter', () => { isPaused = true; });
scrollContainer.addEventListener('mouseleave', () => { isPaused = false; });
scrollContainer.addEventListener('focusin', () => { isPaused = true; });
scrollContainer.addEventListener('focusout', () => { isPaused = false; });

// Initialize
loadSchedule();
updateClock();
setInterval(loadSchedule, 3 * 60 * 1000); // refresh schedule
setInterval(updateClock, 1000); // update clock
