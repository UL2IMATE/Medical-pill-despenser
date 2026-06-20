import {
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";

import { db } from "./firebase.js";

const currentDate = document.getElementById("datee");

const typeFilter = document.getElementById("typeFilter");
const searchInput = document.getElementById("search");

const totalLogs = document.getElementById("total-logs");
const totalLogsCard = document.getElementById("totalLogsCard");
const takenCount = document.getElementById("takenCount");
const missedCount = document.getElementById("missedCount");
const alertsCount = document.getElementById("alertsCount");

let logsArray = [];
let displayedLogs = [];

let currentFilter = "All";
let currentSearch = "";

let sortState = {
  column: "Time",
  direction: "desc",
};

if (currentDate) {
  setDate(currentDate);
  setInterval(() => {
    setDate(currentDate);
  }, 1000);
}

listenToLogs();

typeFilter?.addEventListener("change", () => {
  currentFilter = typeFilter.value;
  applyFilters();
});

searchInput?.addEventListener("input", () => {
  currentSearch = searchInput.value.trim().toLowerCase();
  applyFilters();
});

document.getElementById("exportPDF")?.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  doc.text("Medication Logs", 14, 15);

  doc.autoTable({
    html: "#logsTable",
    startY: 25,
  });

  doc.save("medication-logs.pdf");
});

document.getElementById("exportCSV")?.addEventListener("click", () => {
  const table = document.getElementById("logsTable");
  let csv = [];

  for (let row of table.rows) {
    let rowData = [];

    for (let cell of row.cells) {
      rowData.push(`"${cell.innerText.replaceAll('"', '""')}"`);
    }

    csv.push(rowData.join(","));
  }

  const blob = new Blob([csv.join("\n")], {
    type: "text/csv",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "medication-logs.csv";
  link.click();

  URL.revokeObjectURL(link.href);
});

document.querySelectorAll("#logsTable th[data-column]").forEach((header) => {
  header.style.cursor = "pointer";

  header.addEventListener("click", () => {
    const column = header.dataset.column;

    if (sortState.column === column) {
      sortState.direction = sortState.direction === "asc" ? "desc" : "asc";
    } else {
      sortState.column = column;
      sortState.direction = "asc";
    }

    applyFilters();
  });
});

function listenToLogs() {
  const logsRef = ref(db, "users/Abdelaziz/logs");

  onValue(
    logsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        logsArray = Object.values(data)
          .map(normalizeLog)
          .reverse();

        updateSummaryCards(logsArray);
        applyFilters();
      } else {
        logsArray = [];
        updateSummaryCards([]);
        buildTable([]);

        if (totalLogs) totalLogs.textContent = "Total logs: 0";
      }
    },
    (err) => {
      console.error("Failed to load logs:", err);

      logsArray = [];
      updateSummaryCards([]);
      buildTable([]);

      if (totalLogs) {
        totalLogs.textContent = "Could not load logs";
      }
    }
  );
}

function normalizeLog(log) {
  return {
    Time: String(log.Time ?? "").trim(),
    Type: String(log.Type ?? "").trim(),
    Cup: String(log.Cup ?? "").trim(),
    Medication: String(log.Medication ?? "").trim(),
    ScheduledTime: String(log.ScheduledTime ?? "").trim(),
  };
}

function applyFilters() {
  displayedLogs = logsArray.filter((log) => {
    const typeMatch = checkTypeFilter(log);
    const searchMatch = checkSearch(log);

    return typeMatch && searchMatch;
  });

  displayedLogs.sort(compareLogs);

  buildTable(displayedLogs);

  if (totalLogs) {
    totalLogs.textContent = `Total logs: ${displayedLogs.length}`;
  }
}

function checkTypeFilter(log) {
  const type = log.Type;

  if (currentFilter === "All") {
    return true;
  }

  if (currentFilter === "Alerts") {
    return type === "Empty" || type === "Alert";
  }

  return type === currentFilter;
}

function checkSearch(log) {
  if (!currentSearch) {
    return true;
  }

  const text = `
    ${log.Time}
    ${log.Type}
    ${log.Cup}
    ${log.Medication}
    ${log.ScheduledTime}
  `.toLowerCase();

  return text.includes(currentSearch);
}

function compareLogs(a, b) {
  let valueA = getSortValue(a, sortState.column);
  let valueB = getSortValue(b, sortState.column);

  if (valueA < valueB) {
    return sortState.direction === "asc" ? -1 : 1;
  }

  if (valueA > valueB) {
    return sortState.direction === "asc" ? 1 : -1;
  }

  return 0;
}

function getSortValue(log, column) {
  if (column === "Time") {
    const time = new Date(log.Time).getTime();
    return Number.isNaN(time) ? 0 : time;
  }

  return String(log[column] ?? "").toLowerCase();
}

function updateSummaryCards(data) {
  const todayLogs = data.filter((log) => isToday(log.Time));

  const takenToday = todayLogs.filter((log) => log.Type === "Taken").length;
  const missedToday = todayLogs.filter((log) => log.Type === "Missed").length;
  const alertsToday = todayLogs.filter(
    (log) => log.Type === "Empty" || log.Type === "Alert"
  ).length;

  const todayDoseTotal = takenToday + missedToday;

  if (takenCount) {
    takenCount.textContent = `${takenToday}/${todayDoseTotal}`;
  }

  if (missedCount) {
    missedCount.textContent = `${missedToday}/${todayDoseTotal}`;
  }

  if (alertsCount) {
    alertsCount.textContent = alertsToday;
  }

  if (totalLogsCard) {
    totalLogsCard.textContent = data.length;
  }
}

function isToday(timeValue) {
  const logDate = new Date(timeValue);

  if (Number.isNaN(logDate.getTime())) {
    return false;
  }

  const today = new Date();

  return (
    logDate.getDate() === today.getDate() &&
    logDate.getMonth() === today.getMonth() &&
    logDate.getFullYear() === today.getFullYear()
  );
}

function typeCell(type) {
  const types = {
    Taken: {
      color: "#10a535",
      icon: "fa-circle-check",
    },
    Missed: {
      color: "#d80303",
      icon: "fa-circle-xmark",
    },
    Assigned: {
      color: "#623ea9",
      icon: "fa-bell",
    },
    Empty: {
      color: "#d80303",
      icon: "fa-circle-exclamation",
    },
    Updated: {
      color: "#018aca",
      icon: "fa-pills",
    },
    Alert: {
      color: "#f0ad00",
      icon: "fa-triangle-exclamation",
    },
  };

  const cfg = types[type];

  if (!cfg) {
    return escapeHTML(type);
  }

  return `
    <span class="fw-semibold d-inline-flex align-items-center gap-2" style="color: ${cfg.color}">
      <i class="fa-solid ${cfg.icon}"></i>
      ${escapeHTML(type)}
    </span>
  `;
}

function buildTable(data) {
  const tbody = document.getElementById("myTable");

  if (!tbody) {
    return;
  }

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-muted py-4">
          No logs found
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = data
    .map(
      (log) => `
      <tr>
        <td>${escapeHTML(log.Time)}</td>
        <td>${typeCell(log.Type)}</td>
        <td>${escapeHTML(log.Cup)}</td>
        <td>${escapeHTML(log.Medication)}</td>
        <td>${escapeHTML(log.ScheduledTime)}</td>
      </tr>
    `
    )
    .join("");
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setDate(dateElement) {
  const date = new Date();

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const mon = months[date.getMonth()];
  const period = date.getHours() >= 12 ? "PM" : "AM";
  const hour12 = date.getHours() % 12 || 12;
  const minute = date.getMinutes().toString().padStart(2, "0");

  dateElement.innerHTML = ` ${date.getDate()}, ${mon}. ${hour12}:${minute} ${period}`;
}