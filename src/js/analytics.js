import {
    ref,
    onValue,
  } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";
  
  import { db } from "./firebase.js";
  
  const basePath = "users/Abdelaziz";
  
  const dateElement = document.getElementById("dateAnalytics");
  
  const filledCupsElement = document.getElementById("filledCups");
  const emptyCupsElement = document.getElementById("emptyCups");
  const totalPillsElement = document.getElementById("totalPills");
  const totalLogsElement = document.getElementById("totalLogsAnalytics");
  const recentActivityTable = document.getElementById("recentActivityTable");
  
  let scheduleData = {};
  let logsData = [];
  
  let cupStockChart;
  let cupStatusChart;
  let logActivityChart;
  let medicationChart;
  
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
  
      updateCupCards();
      updateCupStockChart();
      updateCupStatusChart();
      updateMedicationChart();
    });
  }
  
  function listenToLogs() {
    const logsRef = ref(db, `${basePath}/logs`);
  
    onValue(logsRef, (snapshot) => {
      if (snapshot.exists()) {
        logsData = Object.values(snapshot.val()).reverse();
      } else {
        logsData = [];
      }
  
      updateTotalLogs();
      updateLogActivityChart();
      updateRecentActivity();
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
  
  function updateCupCards() {
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
  
    if (filledCupsElement) {
      filledCupsElement.textContent = `${filled}/4`;
    }
  
    if (emptyCupsElement) {
      emptyCupsElement.textContent = `${empty}/4`;
    }
  
    if (totalPillsElement) {
      totalPillsElement.textContent = totalPills;
    }
  }
  
  function updateTotalLogs() {
    if (totalLogsElement) {
      totalLogsElement.textContent = logsData.length;
    }
  }
  
  function updateCupStockChart() {
    const cups = getCupArray();
  
    const labels = cups.map((cup) => `Cup ${cup.cupNumber}`);
    const values = cups.map((cup) => cup.stockPills);
  
    const ctx = document.getElementById("cupStockChart");
    if (!ctx) return;
  
    if (cupStockChart) {
      cupStockChart.destroy();
    }
  
    cupStockChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Pills in Cup",
            data: values,
            backgroundColor: ["#198754", "#ffc107", "#dc3545", "#6c757d"],
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
          },
        },
      },
    });
  }
  
  function updateCupStatusChart() {
    const cups = getCupArray();
  
    const filled = cups.filter(
      (cup) => cup.medication && cup.stockPills > 0
    ).length;
  
    const empty = 4 - filled;
  
    const ctx = document.getElementById("cupStatusChart");
    if (!ctx) return;
  
    if (cupStatusChart) {
      cupStatusChart.destroy();
    }
  
    cupStatusChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Filled Cups", "Empty Cups"],
        datasets: [
          {
            data: [filled, empty],
            backgroundColor: ["#198754", "#dc3545"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: {
            position: "right",
          },
        },
      },
    });
  }
  
  function updateLogActivityChart() {
    const counts = {
      Assigned: 0,
      Updated: 0,
      Empty: 0,
      Alert: 0,
    };
  
    logsData.forEach((log) => {
      const type = log.Type;
  
      if (counts[type] !== undefined) {
        counts[type]++;
      }
    });
  
    const ctx = document.getElementById("logActivityChart");
    if (!ctx) return;
  
    if (logActivityChart) {
      logActivityChart.destroy();
    }
  
    logActivityChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: Object.keys(counts),
        datasets: [
          {
            data: Object.values(counts),
            backgroundColor: ["#623ea9", "#018aca", "#d80303", "#ffc107"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: {
            position: "right",
          },
        },
      },
    });
  }
  
  function updateMedicationChart() {
    const cups = getCupArray();
  
    const medicationCounts = {};
  
    cups.forEach((cup) => {
      if (!cup.medication) return;
  
      medicationCounts[cup.medication] =
        (medicationCounts[cup.medication] || 0) + 1;
    });
  
    const labels = Object.keys(medicationCounts);
    const values = Object.values(medicationCounts);
  
    const ctx = document.getElementById("medicationChart");
    if (!ctx) return;
  
    if (medicationChart) {
      medicationChart.destroy();
    }
  
    medicationChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels.length ? labels : ["No medication"],
        datasets: [
          {
            data: values.length ? values : [1],
            backgroundColor: ["#198754", "#0d6efd", "#ffc107", "#dc3545"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
          },
        },
      },
    });
  }
  
  function updateRecentActivity() {
    if (!recentActivityTable) return;
  
    const recentLogs = logsData.slice(0, 5);
  
    if (recentLogs.length === 0) {
      recentActivityTable.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted">
            No recent activity
          </td>
        </tr>
      `;
      return;
    }
  
    recentActivityTable.innerHTML = recentLogs
      .map(
        (log) => `
        <tr>
          <td>${escapeHTML(log.Time ?? "")}</td>
          <td>${typeCell(log.Type ?? "")}</td>
          <td>${escapeHTML(log.Cup ?? "")}</td>
          <td>${escapeHTML(log.Medication ?? "")}</td>
          <td>${escapeHTML(log.ScheduledTime ?? "")}</td>
        </tr>
      `
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