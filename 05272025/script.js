const sheetID = '1wqrnyX4_b0gbuDLnYh-3cX_h5SZwoBq7_fG4BFTnL1w';

const scrollContainer = document.getElementById('table-container');
const scrollContent = document.getElementById('scroll-content');

let scrollSpeed = 1; // pixels per frame
let isPaused = false;
let animationFrameId;
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

    // Header row
    const headers = json.table.cols.map(col => `<th>${col.label}</th>`).join('');
    table.innerHTML += `<tr>${headers}</tr>`;

    // Body rows
    rows.forEach(row => {
      const cells = row.c.map(cell => `<td>${cell?.v ?? ''}</td>`).join('');
      table.innerHTML += `<tr>${cells}</tr>`;
    });

    // Clear previous content, add duplicated tables for seamless scroll
    scrollContent.innerHTML = '';
    scrollContent.appendChild(table.cloneNode(true));
    scrollContent.appendChild(table.cloneNode(true));

    // Reset scroll position
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
  animationFrameId = requestAnimationFrame(scrollStep);
}

// Pause scroll on hover/focus
scrollContainer.addEventListener('mouseenter', () => { isPaused = true; });
scrollContainer.addEventListener('mouseleave', () => { isPaused = false; });
scrollContainer.addEventListener('focusin', () => { isPaused = true; });
scrollContainer.addEventListener('focusout', () => { isPaused = false; });

// Start everything
loadSchedule();
updateClock();
setInterval(loadSchedule, 3 * 60 * 1000); // reload every 3 mins
setInterval(updateClock, 1000);            // update clock every sec
