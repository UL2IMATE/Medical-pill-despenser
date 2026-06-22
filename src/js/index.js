import {
    ref,
    onValue,
  } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";
  
  import { db } from "./firebase.js";
  
  const basePath = "users/Abdelaziz";
  
  const dateElement = document.getElementById("date");
  
  const filledCupsElement = document.getElementById("filledCups");
  const emptyCupsElement = document.getElementById("emptyCups");
  const totalPillsElement = document.getElementById("totalPills");
  const totalLogsElement = document.getElementById("totalLogs");
  
  const cupsOverview = document.getElementById("cupsOverview");
  const scheduleList = document.getElementById("scheduleList");
  const recentLogs = document.getElementById("recentLogs");
  
  let scheduleData = {};
  let logsData = [];
  
  if (dateElement) {
    setDate(dateElement);
    setInterval(() => {
      setDate(dateElement);
    }, 1000);
  }
  
  listenToSchedule();
  listenToLogs();
  
  function listenToSchedule() {
    const scheduleRef = ref(db, `${basePath}/schedule`);
  
    onValue(scheduleRef, (snapshot) => {
      scheduleData = snapshot.exists() ? snapshot.val() : {};
  
      updateTopCards();
      buildCupsOverview();
      buildScheduleList();
    });
  }
  
  function listenToLogs() {
    const logsRef = ref(db, `${basePath}/logs`);
  
    onValue(logsRef, (snapshot) => {
      logsData = snapshot.exists() ? Object.values(snapshot.val()).reverse() : [];
  
      if (totalLogsElement) {
        totalLogsElement.textContent = logsData.length;
      }
  
      buildRecentLogs();
    });
  }
  
  function getCupArray() {
    return [1, 2, 3, 4].map((num) => {
      const cup = scheduleData[`cup${num}`] || {};
  
      return {
        cupNumber: num,
        medication: cup.Medication || cup.medication || "",
        stockPills: Number(cup.stockPills ?? cup.pillsInCup ?? 0),
        pills: Number(cup.pills ?? 0),
        hour: cup.hour,
        minute: cup.minute,
      };
    });
  }
  
  function updateTopCards() {
    const cups = getCupArray();
  
    let filled = 0;
    let empty = 0;
    let totalPills = 0;
  
    cups.forEach((cup) => {
      totalPills += cup.stockPills;
  
      if (cup.medication && cup.stockPills > 0) {
        filled++;
      } else {
        empty++;
      }
    });
  
    if (filledCupsElement) filledCupsElement.textContent = `${filled}/4`;
    if (emptyCupsElement) emptyCupsElement.textContent = `${empty}/4`;
    if (totalPillsElement) totalPillsElement.textContent = totalPills;
  }
  
  function buildCupsOverview() {
    if (!cupsOverview) return;
  
    const colors = {
      1: {
        border: "success",
        icon: "primary",
        bg: "rgba(25, 135, 84, 0.05)",
        button: "success",
      },
      2: {
        border: "warning",
        icon: "warning",
        bg: "rgba(255, 193, 7, 0.05)",
        button: "warning",
      },
      3: {
        border: "danger",
        icon: "danger",
        bg: "#ffffff",
        button: "danger",
      },
      4: {
        border: "secondary",
        icon: "secondary",
        bg: "#ffffff",
        button: "secondary",
      },
    };
  
    const cups = getCupArray();
  
    cupsOverview.innerHTML = cups
      .map((cup) => {
        const isFilled = cup.medication && cup.stockPills > 0;
        const color = colors[cup.cupNumber];
  
        return `
          <div class="col-lg-3 col-md-12">
            <div
              class="card h-100 rounded-4 border-${isFilled ? color.border : "secondary"} border-2 shadow-sm"
              style="background-color: ${color.bg}; ${!isFilled ? "border-style: dashed !important;" : ""}"
            >
              <div class="card-body d-flex flex-column text-center p-3">
                <div class="mb-3">
                  <i class="bi bi-${cup.cupNumber}-circle-fill text-${isFilled ? color.icon : "secondary"} fs-1 ${!isFilled ? "opacity-50" : ""}"></i>
                  <h3 class="fw-bolder mt-2 ${!isFilled ? "text-secondary" : ""}">
                    Cup ${cup.cupNumber}
                  </h3>
                </div>
  
                <span class="badge rounded-pill ${isFilled ? "text-bg-success" : "text-bg-secondary"} w-75 mx-auto py-2 mb-3">
                  ${isFilled ? '<i class="fa-solid fa-check me-1"></i>Filled' : "Empty"}
                </span>
  
                ${
                  isFilled
                    ? `
                      <h5 class="fw-bold mb-1">${escapeHTML(cup.medication)}</h5>
                      <small class="text-muted">Stock: ${cup.stockPills} pills</small>
  
                      <div class="mt-auto pt-3">
                        <small class="text-muted d-block">Next dose:</small>
                        <span class="fw-semibold fs-5">
                          <i class="fa-regular fa-clock text-success me-1"></i>
                          ${formatTime(cup.hour, cup.minute)}
                        </span>
                      </div>
  
                      <a href="medic.html" class="btn btn-sm btn-${color.button} fw-bold rounded-pill px-3 mt-3">
                        Configure
                      </a>
                    `
                    : `
                      <p class="small text-muted mb-0">No medication assigned</p>
  
                      <div class="mt-auto pt-3">
                        <a href="medic.html" class="btn btn-sm btn-outline-primary fw-bold rounded-pill px-3">
                          + Assign Medication
                        </a>
                      </div>
                    `
                }
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }
  
  function buildScheduleList() {
    if (!scheduleList) return;
  
    const scheduledCups = getCupArray()
      .filter((cup) => cup.medication)
      .sort((a, b) => {
        const aTime = Number(a.hour || 0) * 60 + Number(a.minute || 0);
        const bTime = Number(b.hour || 0) * 60 + Number(b.minute || 0);
        return aTime - bTime;
      });
  
    if (scheduledCups.length === 0) {
      scheduleList.innerHTML = `
        <li class="list-group-item text-center text-muted p-4">
          No schedule available
        </li>
      `;
      return;
    }
  
    scheduleList.innerHTML = scheduledCups
      .map(
        (cup) => `
        <li class="list-group-item d-flex align-items-center p-4 border">
          <div class="badge text-bg-primary p-2 fs-6 fw-normal" style="min-width: 100px;">
            ${formatTime(cup.hour, cup.minute)}
          </div>
  
          <div class="ms-3 me-3">
            <p class="mb-0 fs-5 fw-bolder text-dark">Cup ${cup.cupNumber}</p>
            <ul class="list-unstyled mb-0 text-muted small">
              <li class="fw-bolder">
                <i class="fa-solid fa-pills me-1"></i>
                ${escapeHTML(cup.medication)} - ${cup.pills || 0} pills
              </li>
            </ul>
          </div>
  
          <div class="status ms-auto badge text-primary bg-primary-subtle border border-primary-subtle p-2 px-2">
            Scheduled
          </div>
        </li>
      `
      )
      .join("");
  }
  
  function buildRecentLogs() {
    if (!recentLogs) return;
  
    const latestLogs = logsData.slice(0, 3);
  
    if (latestLogs.length === 0) {
      recentLogs.innerHTML = `
        <li class="list-group-item text-center text-muted p-4">
          No recent logs
        </li>
      `;
      return;
    }
  
    recentLogs.innerHTML = latestLogs
      .map((log) => {
        const cfg = getLogStyle(log.Type);
  
        return `
          <li class="list-group-item d-flex align-items-center p-3">
            <div class="fs-1 fw-normal ms-3" style="min-width: 80px; color: ${cfg.color}">
              <i class="fa-solid ${cfg.icon}"></i>
            </div>
  
            <div class="ms-1 text-center text-md-start">
              <p class="mb-0 fs-6 fw-bold text-dark">
                ${escapeHTML(log.Type || "Activity")}
                <span class="fw-bolder fs-6" style="color: ${cfg.color}">
                  ${escapeHTML(log.Cup || "")}
                </span>
              </p>
  
              <ul class="list-unstyled mb-0 text-muted small">
                <li class="fw-bolder text-center text-md-start">
                  <i class="fa-solid fa-pills me-1"></i>
                  ${escapeHTML(log.Medication || "-")} - ${escapeHTML(log.ScheduledTime || "-")}
                </li>
              </ul>
            </div>
  
            <div class="ms-auto text-muted p-2 px-3 fs-6 fw-semibold text-center">
              ${escapeHTML(log.Time || "")}
            </div>
          </li>
        `;
      })
      .join("");
  }
  
  function getLogStyle(type) {
    const styles = {
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
    };
  
    return (
      styles[type] || {
        color: "#6c757d",
        icon: "fa-circle-info",
      }
    );
  }
  
  function formatTime(hour, minute) {
    if (hour === undefined || minute === undefined) {
      return "-";
    }
  
    const h = Number(hour);
    const m = Number(minute);
  
    if (Number.isNaN(h) || Number.isNaN(m)) {
      return "-";
    }
  
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
  
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
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
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
  
    const month = months[date.getMonth()];
    const period = date.getHours() >= 12 ? "PM" : "AM";
    const hour12 = date.getHours() % 12 || 12;
    const minute = date.getMinutes().toString().padStart(2, "0");
  
    dateElement.innerHTML = ` ${date.getDate()}, ${month}. ${hour12}:${minute} ${period}`;
  }