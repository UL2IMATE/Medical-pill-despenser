import {
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";

import { db } from "./firebase.js";

const basePath = "users/Abdelaziz";

const currentDate = document.getElementById("datee");

const typeFilter = document.getElementById("typeFilter");
const searchInput = document.getElementById("search");

const totalLogs = document.getElementById("total-logs");
const totalLogsCard = document.getElementById("totalLogsCard");
const alertsCount = document.getElementById("alertsCount");

const filledCupsElement = document.getElementById("filledCups");
const emptyCupsElement = document.getElementById("emptyCups");

let scheduleData = {};
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

listenToSchedule();
listenToLogs();

typeFilter?.addEventListener("change", () => {
  currentFilter = typeFilter.value;
  applyFilters();
});

searchInput?.addEventListener("input", () => {
  currentSearch = searchInput.value.trim().toLowerCase();
  applyFilters();
});

document.getElementById("exportPDF")?.addEventListener("click", exportPDF);
document.getElementById("exportCSV")?.addEventListener("click", exportCSV);

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

function listenToSchedule() {
  const scheduleRef = ref(db, `${basePath}/schedule`);

  onValue(
    scheduleRef,
    (snapshot) => {
      scheduleData = snapshot.exists() ? snapshot.val() : {};
      updateCupCards();
      console.log("Schedule data:", scheduleData);
    },
    (error) => {
      console.error("Failed to load schedule:", error);
      updateCupCards();
    },
  );
}

function listenToLogs() {
  const logsRef = ref(db, `${basePath}/logs`);

  onValue(
    logsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        logsArray = Object.values(snapshot.val()).map(normalizeLog).reverse();
      } else {
        logsArray = [];
      }

      updateLogCards(logsArray);
      applyFilters();

      console.log("Logs data:", logsArray);
    },
    (error) => {
      console.error("Failed to load logs:", error);

      logsArray = [];
      updateLogCards([]);
      buildTable([]);

      if (totalLogs) {
        totalLogs.textContent = "Could not load logs";
      }
    },
  );
}

function normalizeLog(log) {
  return {
    Time: String(log.Time ?? log.time ?? "").trim(),
    Type: String(log.Type ?? log.type ?? "").trim(),
    Cup: String(log.Cup ?? log.cup ?? "").trim(),
    Medication: String(
      log.Medication ?? log.medication ?? log.medicationName ?? "",
    ).trim(),
    ScheduledTime: String(
      log.ScheduledTime ?? log.scheduledTime ?? log.scheduleTime ?? "",
    ).trim(),
  };
}

function getCupArray() {
  return [1, 2, 3, 4].map((num) => {
    const cup =
      scheduleData[`cup${num}`] ||
      scheduleData[`Cup${num}`] ||
      scheduleData[num] ||
      {};

    return {
      cupNumber: num,
      medication: String(cup.Medication ?? cup.medication ?? "").trim(),
      pills: toNumber(cup.pills),
      pillsInCup: toNumber(cup.pillsInCup),
      stockPills: toNumber(cup.stockPills),
    };
  });
}

function updateCupCards() {
  const cups = getCupArray();

  let filled = 0;
  let empty = 0;

  cups.forEach((cup) => {
    const hasPills = Number(cup.stockPills) > 0 || Number(cup.pillsInCup) > 0;

    if (hasPills) {
      filled++;
    } else {
      empty++;
    }
  });

  if (filledCupsElement) {
    filledCupsElement.textContent = `${filled}/4`;
  }

  if (emptyCupsElement) {
    emptyCupsElement.textContent = `${empty}/4`;
  }

  console.log("Filled cups:", filled);
  console.log("Empty cups:", empty);
}

function updateLogCards(data) {
  const alerts = data.filter((log) => {
    const type = log.Type.toLowerCase();
    return type === "empty" || type === "alert" || type === "alerts";
  }).length;

  if (alertsCount) {
    alertsCount.textContent = alerts;
  }

  if (totalLogsCard) {
    totalLogsCard.textContent = data.length;
  }

  console.log("Alerts:", alerts);
  console.log("Total logs:", data.length);
}

function applyFilters() {
  displayedLogs = logsArray.filter((log) => {
    return checkTypeFilter(log) && checkSearch(log);
  });

  displayedLogs.sort(compareLogs);

  buildTable(displayedLogs);

  if (totalLogs) {
    totalLogs.textContent = `Total logs: ${displayedLogs.length}`;
  }
}

function checkTypeFilter(log) {
  const type = log.Type.toLowerCase();

  if (currentFilter === "All") {
    return true;
  }

  if (currentFilter === "Alerts") {
    return type === "empty" || type === "alert" || type === "alerts";
  }

  return type === currentFilter.toLowerCase();
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
  const valueA = getSortValue(a, sortState.column);
  const valueB = getSortValue(b, sortState.column);

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
    const parsedTime = new Date(log.Time).getTime();
    return Number.isNaN(parsedTime) ? 0 : parsedTime;
  }

  return String(log[column] ?? "").toLowerCase();
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
      `,
    )
    .join("");
}

function typeCell(type) {
  const types = {
    Assigned: {
      color: "#623ea9",
      icon: "fa-bell",
    },
    Updated: {
      color: "#018aca",
      icon: "fa-pills",
    },
    Empty: {
      color: "#d80303",
      icon: "fa-circle-exclamation",
    },
    Alert: {
      color: "#ffc107",
      icon: "fa-triangle-exclamation",
    },
    Alerts: {
      color: "#ffc107",
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

function exportPDF() {
  if (!window.jspdf) {
    alert("PDF library is not loaded.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Medication Logs", 14, 15);

  doc.autoTable({
    startY: 25,
    head: [["Time", "Type", "Cup", "Medication", "Scheduled Time"]],
    body: displayedLogs.map((log) => [
      log.Time,
      log.Type,
      log.Cup,
      log.Medication,
      log.ScheduledTime,
    ]),
  });

  doc.save("medication-logs.pdf");
}

function exportCSV() {
  const headers = ["Time", "Type", "Cup", "Medication", "Scheduled Time"];

  const rows = displayedLogs.map((log) => [
    log.Time,
    log.Type,
    log.Cup,
    log.Medication,
    log.ScheduledTime,
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "medication-logs.csv";
  link.click();

  URL.revokeObjectURL(link.href);
}

function toNumber(value) {
  const number = Number(value);
  return Number.isNaN(number) ? 0 : number;
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

  const month = months[date.getMonth()];
  const period = date.getHours() >= 12 ? "PM" : "AM";
  const hour12 = date.getHours() % 12 || 12;
  const minute = date.getMinutes().toString().padStart(2, "0");

  dateElement.innerHTML = ` ${date.getDate()}, ${month}. ${hour12}:${minute} ${period}`;
}
