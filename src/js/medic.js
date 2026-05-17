import {
  ref,
  onValue,
  update,
  push,
  get,
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";

import { db } from "./firebase.js";

let cup1 = {};
let cup2 = {};
let cup3 = {};
let cup4 = {};

function AssignEmail() {
  const emailInput = document.getElementById("emailInput");
  update(ref(db, "users/Abdelaziz/alertContact"), {
    email: emailInput.value,
  });
}

const insertEmail = document.getElementById("insertEmail");
insertEmail?.addEventListener("click", AssignEmail);

let cup = [cup1, cup2, cup3, cup4];

function cupsInfo() {
  for (let i = 0; i < 4; i++) {
    let userRef = ref(db, `users/Abdelaziz/schedule/cup${i + 1}`);
    onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.assign(cup[i], {
          pills: data.pills,
          hours: data.hour % 12 || 12,
          Medication: data.Medication,
          minute: data.minute,
          period: data.hour >= 12 ? "PM" : "AM",
          assignedAt: new Date().toLocaleString() || null,
        });

        //    }
      }
    });
  }
}
function buildTable(data) {
  let table = document.getElementById("myTable");
  if (!table) return;
  table.innerHTML = "";
  for (let i = 0; i < data.length; i++) {
    const row = `<tr>
      <td scope="row">${data[i].Time}</td>
      <td scope="row">${data[i].Type}</td>
      <td scope="row">${data[i].Cup}</td>
      <td scope="row">${data[i].Medication}</td>
    </tr>`;
    table.innerHTML += row;
  }
}

const logs = [];
logs.push();

const currentDate = document.getElementById("date");

function SetDate(Datte) {
  const date = new Date();
  let mon = "";
  switch (date.getMonth() + 1) {
    case 1:
      mon = "Jan";
      break;
    case 2:
      mon = "Feb";
      break;
    case 3:
      mon = "Mar";
      break;
    case 4:
      mon = "Apr";
      break;
    case 5:
      mon = "May";
      break;
    case 6:
      mon = "Jun";
      break;
    case 7:
      mon = "Jul";
      break;
    case 8:
      mon = "Aug";
      break;
    case 9:
      mon = "Sep";
      break;
    case 10:
      mon = "Oct";
      break;
    case 11:
      mon = "Nov";
      break;
    case 12:
      mon = "Dec";
      break;
  }

  let AmorPm = date.getHours() > 12 ? "PM" : "AM";
  let hour12 = date.getHours() % 12 || 12;
  Datte.innerHTML = ` ${date.getDate()}, ${mon}. ${hour12}:${date.getMinutes().toString().padStart(2, "0")} ${AmorPm}`;
}
if (currentDate) {
  SetDate(currentDate);
  setInterval(() => {
    SetDate(currentDate);
  }, 1000);
}

function Cup1Status(e) {
  const Cup1Pill = document.getElementById("Cup1Pill");
  const Cup1PillName = document.getElementById("Cup1PillName");
  const Cup1Remainder = document.getElementById("Cup1Remainder");
  const Cup1Weight = document.getElementById("Cup1Weight");
  const Cup1Time = document.getElementById("Cup1Time");
  const Cup1 = document.getElementById("Cup-1");
  const Cup1Button = document.getElementById("Cup1Button");
  const Cup1Badge = document.getElementById("Cup1Badge");

  if (!cup1.Medication) {
    Cup1Badge.classList =
      "text-bg-secondary rounded badge rounded-pill px-3 py-2 mb-3";

    Cup1Badge.innerHTML = "Empty";
    Cup1PillName.innerHTML = "-";
    Cup1Remainder.innerHTML = "-";
    Cup1Weight.innerHTML = "-";
    Cup1Time.innerHTML = "-";

    Cup1Button.classList = "btn btn-outline-secondary";
    Cup1Button.innerHTML = "Assign medication";
  } else {
    Cup1Badge.classList = "badge rounded-pill text-bg-success  px-3 py-2 mb-3";
    Cup1Badge.innerHTML = ' <i class="fa-solid fa-check me-1"></i>Occupied';
    Cup1PillName.innerHTML = cup1.Medication;
    Cup1Remainder.innerHTML = cup1.pills;
    Cup1Button.classList = "btn btn-success";
    Cup1Button.innerHTML = "Configure";
    Cup1Time.innerHTML = `${cup1.hours}:${cup1.minute}${cup1.period}`;
  }
}

function Cup2Status(e) {
  const Cup2Pill = document.getElementById("Cup2Pill");
  const Cup2PillName = document.getElementById("Cup2PillName");
  const Cup2Remainder = document.getElementById("Cup2Remainder");
  const Cup2Weight = document.getElementById("Cup2Weight");
  const Cup2Time = document.getElementById("Cup2Time");
  const Cup2 = document.getElementById("Cup-2");
  const Cup2Button = document.getElementById("Cup2Button");

  const Cup2Badge = document.getElementById("Cup2Badge");

  if (!cup2.Medication) {
    Cup2Badge.classList =
      "text-bg-secondary rounded badge rounded-pill px-3 py-2 mb-3";
    Cup2Badge.innerHTML = "Empty";
    Cup2PillName.innerHTML = "-";
    Cup2Remainder.innerHTML = "-";
    Cup2Weight.innerHTML = "-";
    Cup2Time.innerHTML = "-";

    Cup2Button.classList = "btn btn-outline-secondary";
    Cup2Button.innerHTML = "Assign medication";
  } else {
    Cup2Badge.classList = "badge rounded-pill text-bg-success  px-3 py-2 mb-3";
    Cup2Badge.innerHTML = ' <i class="fa-solid fa-check me-1"></i>Occupied';
    Cup2PillName.innerHTML = cup2.Medication;
    Cup2Remainder.innerHTML = cup2.pills;
    Cup2Button.classList = "btn btn-warning ";
    Cup2Button.innerHTML = "Configure";
    Cup2Time.innerHTML = `${cup2.hours}:${cup2.minute}${cup2.period}`;
  }
}

function Cup3Status() {
  const Cup3PillName = document.getElementById("Cup3PillName");
  const Cup3Remainder = document.getElementById("Cup3Remainder");
  const Cup3Weight = document.getElementById("Cup3Weight");
  const Cup3Time = document.getElementById("Cup3Time");
  const Cup3Button = document.getElementById("Cup3Button");
  const Cup3Badge = document.getElementById("Cup3Badge");

  if (!cup3.Medication) {
    Cup3Badge.classList =
      "text-bg-secondary rounded badge rounded-pill px-3 py-2 mb-3";
    Cup3Badge.innerHTML = "Empty";
    Cup3PillName.innerHTML = "-";
    Cup3Remainder.innerHTML = "-";
    Cup3Weight.innerHTML = "-";
    Cup3Time.innerHTML = "-";

    Cup3Button.classList = "btn btn-outline-secondary";
    Cup3Button.innerHTML = "Assign medication";
  } else {
    Cup3Badge.classList = "badge rounded-pill text-bg-success  px-3 py-2 mb-3";
    Cup3Badge.innerHTML = ' <i class="fa-solid fa-check me-1"></i>Occupied';
    Cup3PillName.innerHTML = cup3.Medication;
    Cup3Remainder.innerHTML = cup3.pills;
    Cup3Button.classList = "btn btn-danger ";
    Cup3Button.innerHTML = "Configure";
    Cup3Time.innerHTML = `${cup3.hours}:${cup3.minute}${cup3.period}`;
  }
}

function Cup4Status() {
  const Cup4PillName = document.getElementById("Cup4PillName");
  const Cup4Remainder = document.getElementById("Cup4Remainder");
  const Cup4Weight = document.getElementById("Cup4Weight");
  const Cup4Time = document.getElementById("Cup4Time");
  const Cup4Button = document.getElementById("Cup4Button");
  const Cup4Badge = document.getElementById("Cup4Badge");

  if (!cup4.Medication) {
    Cup4Badge.classList =
      "text-bg-secondary rounded badge rounded-pill px-3 py-2 mb-3";
    Cup4Badge.innerHTML = "Empty";
    Cup4PillName.innerHTML = "-";
    Cup4Remainder.innerHTML = "-";
    Cup4Weight.innerHTML = "-";
    Cup4Time.innerHTML = "-";

    Cup4Button.classList = "btn btn-outline-secondary";
    Cup4Button.innerHTML = "Assign medication";
  } else {
    Cup4Badge.classList = "badge rounded-pill text-bg-success  px-3 py-2 mb-3";
    Cup4Badge.innerHTML = ' <i class="fa-solid fa-check me-1"></i>Occupied';
    Cup4PillName.innerHTML = cup4.Medication;
    Cup4Remainder.innerHTML = cup4.pills;
    Cup4Button.classList = "btn btn-secondary ";
    Cup4Button.innerHTML = "Configure";
    Cup4Time.innerHTML = `${cup4.hours}:${cup4.minute}${cup4.period}`;
  }
}

function pillNameCup1() {
  const PillName = document.getElementById("Pill_name");

  const oldMedication = cup1.Medication || "";
  const newMedication = PillName.value.trim();

  let logType = "";

  if (oldMedication === "" && newMedication !== "") {
    logType = "Assigned";
  } else if (oldMedication !== "" && newMedication === "") {
    logType = "Empty";
  } else if (oldMedication !== "" && newMedication !== "") {
    logType = "Updated";
  } else {
    return;
  }

  const now = new Date().toLocaleString();

  update(ref(db, "users/Abdelaziz/schedule/cup1"), {
    Medication: newMedication,
    assignedAt: now,
  })
    .then(() => {
      push(ref(db, "users/Abdelaziz/logs"), {
        Time: now,
        Type: logType,
        Cup: "cup1",
        Medication: newMedication || oldMedication || "-",
        ScheduledTime: `${cup1.hours}:${cup1.minute}${cup1.period}`,
      });

      alert("Pill assigned successfully");
    })
    .catch((error) => {
      alert(error);
    });
}

function pillNameCup2() {
  const PillName = document.getElementById("Pill2name");

  const oldMedication = cup2.Medication || "";
  const newMedication = PillName.value.trim();
  let logType = "";

  if (oldMedication === "" && newMedication !== "") {
    logType = "Assigned";
  } else if (oldMedication !== "" && newMedication === "") {
    logType = "Empty";
  } else if (oldMedication !== "" && newMedication !== "") {
    logType = "Updated";
  } else {
    return;
  }

  const now = new Date().toLocaleString();

  update(ref(db, "users/Abdelaziz/schedule/cup2"), {
    Medication: newMedication,
    assignedAt: now,
  })
    .then(() => {
      push(ref(db, "users/Abdelaziz/logs"), {
        Time: now,
        Type: logType,
        Cup: "cup2",
        Medication: newMedication || oldMedication || "-",
        ScheduledTime: `${cup2.hours}:${cup2.minute}${cup2.period}`,
      });

      alert("Pill assigned successfully");
    })
    .catch((error) => {
      alert(error);
    });
}
function pillNameCup3() {
  const PillName = document.getElementById("Pill3name");

  const oldMedication = cup3.Medication || "";
  const newMedication = PillName.value.trim();

  let logType = "";

  if (oldMedication === "" && newMedication !== "") {
    logType = "Assigned";
  } else if (oldMedication !== "" && newMedication === "") {
    logType = "Empty";
  } else if (oldMedication !== "" && newMedication !== "") {
    logType = "Updated";
  } else {
    return;
  }

  const now = new Date().toLocaleString();

  update(ref(db, "users/Abdelaziz/schedule/cup3"), {
    Medication: newMedication,
    assignedAt: now,
  })
    .then(() => {
      push(ref(db, "users/Abdelaziz/logs"), {
        Time: now,
        Type: logType,
        Cup: "cup3",
        Medication: newMedication || oldMedication || "-",
        ScheduledTime: `${cup3.hours}:${cup3.minute}${cup3.period}`,
      });

      alert("Pill assigned successfully");
    })
    .catch((error) => {
      alert(error);
    });
}
function pillNameCup4() {
  const PillName = document.getElementById("Pill4name");

  const oldMedication = cup4.Medication || "";
  const newMedication = PillName.value.trim();

  let logType = "";

  if (oldMedication === "" && newMedication !== "") {
    logType = "Assigned";
  } else if (oldMedication !== "" && newMedication === "") {
    logType = "Empty";
  } else if (oldMedication !== "" && newMedication !== "") {
    logType = "Updated";
  } else {
    return;
  }

  const now = new Date().toLocaleString();

  update(ref(db, "users/Abdelaziz/schedule/cup4"), {
    Medication: newMedication,
    assignedAt: now,
  })
    .then(() => {
      push(ref(db, "users/Abdelaziz/logs"), {
        Time: now,
        Type: logType,
        Cup: "cup4  ",
        Medication: newMedication || oldMedication || "-",
        ScheduledTime: `${cup4.hours}:${cup4.minute}${cup4.period}`,
      });

      alert("Pill assigned successfully");
    })
    .catch((error) => {
      alert(error);
    });
}

cupsInfo();

setInterval(() => {
  Cup1Status();
}, 1000);

setInterval(() => {
  Cup2Status();
}, 1000);

setInterval(() => {
  Cup3Status();
}, 1000);

setInterval(() => {
  Cup4Status();
}, 1000);

const Cup1Pill = document.getElementById("Cup1Pill");
const Cup2Pill = document.getElementById("Cup2Pill");
const Cup3Pill = document.getElementById("Cup3Pill");
const Cup4Pill = document.getElementById("Cup4Pill");

Cup1Pill?.addEventListener("click", pillNameCup1);
Cup2Pill?.addEventListener("click", pillNameCup2);
Cup3Pill?.addEventListener("click", pillNameCup3);
Cup4Pill?.addEventListener("click", pillNameCup4);
