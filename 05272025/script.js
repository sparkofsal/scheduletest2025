const sheetID = '1wqrnyX4_b0gbuDLnYh-3cX_h5SZwoBq7_fG4BFTnL1w';



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

    // Create table header row
    const headers = json.table.cols.map(col => `<th>${col.label}</th>`).join('');
    table.innerHTML += `<tr>${headers}</tr>`;

    // Create table body rows
    rows.forEach(row => {
      const cells = row.c.map(cell => `<td>${cell?.v ?? ''}</td>`).join('');
      table.innerHTML += `<tr>${cells}</tr>`;
    });

    // Duplicate the table for seamless scrolling
    const scrollContent = document.getElementById('scroll-content');
    scrollContent.innerHTML = '';
    scrollContent.appendChild(table.cloneNode(true));
    scrollContent.appendChild(table.cloneNode(true));
  } catch (err) {
    const scrollContent = document.getElementById('scroll-content');
    scrollContent.innerText = '⚠️ Failed to load schedule.';
    console.error('Error loading schedule:', err);
  }
}

// --- Smooth JS-controlled scroll ---

const scrollContainer = document.getElementById('table-container');
const scrollContent = document.getElementById('scroll-content');

let scrollSpeed = 1; // pixels per frame
let isPaused = false;
let animationFrameId;
let scrollStarted = false;

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

scrollContainer.addEventListener('mouseenter', () => {
  isPaused = true;
});

scrollContainer.addEventListener('mouseleave', () => {
  isPaused = false;
});

scrollContainer.addEventListener('focusin', () => {
  isPaused = true;
});

scrollContainer.addEventListener('focusout', () => {
  isPaused = false;
});

async function loadSchedule() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&cacheBuster=${Date.now()}`;
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substr(47).slice(0, -2));

    const table = document.createElement('table');
    const rows = json.table.rows;

    const headers = json.table.cols.map(col => `<th>${col.label}</th>`).join('');
    table.innerHTML += `<tr>${headers}</tr>`;

    rows.forEach(row => {
      const cells = row.c.map(cell => `<td>${cell?.v ?? ''}</td>`).join('');
      table.innerHTML += `<tr>${cells}</tr>`;
    });

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

loadSchedule();
updateClock();
setInterval(loadSchedule, 3 * 60 * 1000);
setInterval(updateClock, 1000);
