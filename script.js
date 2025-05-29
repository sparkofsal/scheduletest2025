const sheetID = '1wqrnyX4_b0gbuDLnYh-3cX_h5SZwoBq7_fG4BFTnL1w'; // Replace with your Google Sheet ID
const scrollContainer = document.getElementById('table-container');
const scrollContent = document.getElementById('scroll-content');
const headerRow = document.getElementById('table-headers');

let scrollSpeed = 0.5;
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

    // Helper to build one row
    function createFormattedRow(rowData) {
      const tr = document.createElement('tr');
      rowData.c.forEach(cell => {
        const td = document.createElement('td');
        let value = cell?.v ?? '';

        // Case 1: Google Sheets returns raw JS Date object
        if (value instanceof Date) {
          const mm = String(value.getMonth() + 1).padStart(2, '0');
          const dd = String(value.getDate()).padStart(2, '0');
          value = `${mm}/${dd}`;
        }

        // Case 2: Google returns string like 'Date(2025,4,15)'
        if (typeof value === 'string' && /^Date\(\d+,\d+,\d+\)$/.test(value)) {
          const [, y, m, d] = value.match(/Date\((\d+),(\d+),(\d+)\)/).map(Number);
          const mm = String(m + 1).padStart(2, '0');
          const dd = String(d).padStart(2, '0');
          value = `${mm}/${dd}`;
        }

        td.textContent = value;
        tr.appendChild(td);
      });
      return tr;
    }

    // This will create the rows and start scrolling
    scrollContent.innerHTML = '';
    rows.forEach(row => scrollContent.appendChild(createFormattedRow(row)));
    rows.forEach(row => scrollContent.appendChild(createFormattedRow(row))); // duplicate

    if (!scrollStarted) {
      scrollStarted = true;
      scrollStep();
    }
  } catch (err) {
    scrollContent.innerHTML = '<tr><td colspan="100%">⚠️ Failed to load schedule.</td></tr>';
    console.error('Error loading schedule:', err);
  }
}

// This function handles the scrolling logic
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

// This will pause scrolling when mouse is over the container
scrollContainer.addEventListener('mouseenter', () => { isPaused = true; });
scrollContainer.addEventListener('mouseleave', () => { isPaused = false; });

// Init
loadSchedule();
updateClock();
setInterval(loadSchedule, 3 * 60 * 1000);
setInterval(updateClock, 1000);
