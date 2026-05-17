import {
  ref,
  onValue,
  push,
  get,
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";

import { db } from "./firebase.js";

let logsArray = [];

function buildTable(data) {
  const table = document.getElementById("myTable");
  if (!table) return;

  table.innerHTML = "";

  for (let i = 0; i < data.length; i++) {
    const row = `
      <tr>
        <td>${data[i].Time}</td>
        <td>${data[i].Type}</td>
        <td>${data[i].Cup}</td>
        <td>${data[i].Medication}</td>
        <td>${data[i].ScheduledTime}</td>
      </tr>
    `;

    table.innerHTML += row;
  }
}
function getLogs() {
  const totalLogs = document.getElementById("total-logs");
  const logsRef = ref(db, "users/Abdelaziz/logs");

  get(logsRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        logsArray = Object.values(data).reverse();

        if (totalLogs) {
          totalLogs.innerHTML = `Total logs: ${logsArray.length}`;
        }

        buildTable(logsArray);
      } else {
        buildTable([]);
        if (totalLogs) totalLogs.textContent = "Total logs: 0";
      }
    })
    .catch((err) => {
      console.error("Failed to load logs:", err);
      buildTable([]);
      if (totalLogs) {
        totalLogs.textContent = "Could not load logs";
      }
    });
}

getLogs();
document.getElementById("exportPDF")?.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  doc.text("Medication Logs", 14, 15);

  doc.autoTable({
    html: "#logsTable", // your full table id
    startY: 25,
  });

  doc.save("medication-logs.pdf");
});

const csvBtn = document.getElementById("exportCSV");

csvBtn?.addEventListener("click", () => {
  const table = document.getElementById("logsTable");
  let csv = [];

  for (let row of table.rows) {
    let rowData = [];

    for (let cell of row.cells) {
      rowData.push(`"${cell.innerText}"`);
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
});

let th = document.getElementsByTagName("th");

for (const header of th) {
  header.addEventListener("click", () => {
    console.log("column clicked");
  });
}
