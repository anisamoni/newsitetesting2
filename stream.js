const playerFrame = document.getElementById("playerFrame");
const channelsListEl = document.getElementById("channelsList");
const matchTitleEl = document.getElementById("matchTitle");
const matchTimeEl = document.getElementById("matchTime");
const matchStatusEl = document.getElementById("matchStatus");
const streamStatus = document.getElementById("streamStatus");

function getQueryParam(name) {
  return new URLSearchParams(location.search).get(name);
}

function formatLocalFromMs(ms) {
  return new Date(ms).toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days}D ${hours}H ${minutes}M ${seconds}S`;
}

(function(){
  const idx = Number(getQueryParam("idx"));
  const matches = JSON.parse(sessionStorage.getItem("parsedMatches") || "[]");

  if (!matches || !matches[idx]) {
    streamStatus.textContent = "Match not found.";
    return;
  }

  const match = matches[idx];
  const start = match.eventUtcMs;
  const end = start + 150 * 60 * 1000; // 150 minutes

  matchTitleEl.textContent = match.matchName;
  

  function updateStatus() {
    const now = Date.now();
    let html = "";

    if (now >= end) {
      html = `<span class="status-badge status-finished">Finished</span>`;
    } else if (now >= start) {
      html = `<span class="status-badge status-running">Live</span> (Started: ${formatLocalFromMs(start)})`;
    } else {
      const countdown = formatCountdown(start - now);
      html = `Upcoming — Start: ${formatLocalFromMs(start)} <br> ⏳ ${countdown}`;
    }

    matchStatusEl.innerHTML = html;
  }

  updateStatus();
  setInterval(updateStatus, 1000); // update every second

  // --- render channel buttons ---
  channelsListEl.innerHTML = "";
  match.channels.forEach((url, i) => {
    const btn = document.createElement("button");
    btn.className = "channel-btn";
    btn.textContent = `Channel ${i+1}`;
    btn.title = url;
    btn.addEventListener("click", () => {
      Array.from(channelsListEl.children).forEach(el => el.classList.remove("active"));
      btn.classList.add("active");
      playerFrame.src = url;
      streamStatus.textContent = `Loaded channel ${i+1}`;
    });
    channelsListEl.appendChild(btn);
  });

  if (channelsListEl.firstChild) channelsListEl.firstChild.click();
})();
