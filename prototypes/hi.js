let selectedCup = null;
let userName = "";
const maxCupGrams = 100;
const lowThresholdGrams = 20;
let isSending = false;

let cups = [
  {
    id: 1,
    medicationName: "",
    pillsPerDose: 1,
    hour: "",
    minute: "",
    grams: 0,
  },
  {
    id: 2,
    medicationName: "",
    pillsPerDose: 1,
    hour: "",
    minute: "",
    grams: 0,
  },
  {
    id: 3,
    medicationName: "",
    pillsPerDose: 1,
    hour: "",
    minute: "",
    grams: 0,
  },
  {
    id: 4,
    medicationName: "",
    pillsPerDose: 1,
    hour: "",
    minute: "",
    grams: 0,
  },
];

const pageContainer = document.getElementById("pageContainer");
const setAllBtn = document.getElementById("setAllBtn");

function currentCup() {
  return cups.find((cup) => cup.id === selectedCup) || null;
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function normalizeGrams(value) {
  const grams = Number(value);
  if (isNaN(grams) || grams < 0) return 0;
  return grams;
}

function formatTime(hour, minute) {
  if (hour === "" || minute === "") return "--:--";
  return pad2(hour) + ":" + pad2(minute);
}

function getFillHeight(grams) {
  const g = Math.max(0, Math.min(normalizeGrams(grams), maxCupGrams));
  return (g / maxCupGrams) * 100 + "%";
}

function getCupState(grams) {
  const g = normalizeGrams(grams);
  if (g === 0) return "empty";
  if (g <= lowThresholdGrams) return "low";
  return "filled";
}

function getCupBadgeText(grams) {
  const state = getCupState(grams);
  if (state === "empty") return "EMPTY";
  if (state === "low") return "LOW";
  return "FILLED";
}

function saveToBrowser() {
  localStorage.setItem(
    "pillDispenserDashboardState",
    JSON.stringify({
      userName,
      cups,
    }),
  );
}

function loadSavedData() {
  const saved = localStorage.getItem("pillDispenserDashboardState");
  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);

    if (parsed.userName) {
      userName = parsed.userName;
    }

    if (Array.isArray(parsed.cups)) {
      cups = cups.map((cup) => {
        const savedCup = parsed.cups.find((c) => Number(c.id) === cup.id);
        const mergedCup = savedCup ? { ...cup, ...savedCup } : cup;

        if (!mergedCup.pillsPerDose || mergedCup.pillsPerDose < 1) {
          mergedCup.pillsPerDose = 1;
        }

        return mergedCup;
      });
    }
  } catch (error) {
    console.log(error);
  }
}

function lockSending() {
  if (isSending) return false;

  isSending = true;

  setTimeout(() => {
    isSending = false;
  }, 500);

  return true;
}

function sendToNodeRed(message) {
  console.log("Message output:", message);

  // For a regular HTML file, there is no Node-RED this.send().
  // Connect this part later to Firebase, MQTT over WebSocket, or fetch() to a Node-RED HTTP endpoint.
}

function renderOverviewPage() {
  pageContainer.innerHTML = `
        <div class="overview-page">
          <div class="section-title">Cup Overview</div>
          <div class="cup-grid">
            ${cups
              .map((cup) => {
                const state = getCupState(cup.grams);
                return `
                <div class="cup-card" data-cup-id="${cup.id}">
                  <div class="cup-header">
                    <span class="cup-name">
                      ${cup.medicationName ? cup.medicationName : "Cup " + cup.id}
                    </span>
                    <span class="cup-badge ${state}">
                      ${getCupBadgeText(cup.grams)}
                    </span>
                  </div>

                  <div class="medication-label">
                    ${cup.medicationName ? cup.medicationName : "No medication assigned"}
                  </div>

                  <div class="cup-visual">
                    <div class="cup-fill fill-${state}" style="height: ${getFillHeight(cup.grams)}"></div>
                  </div>

                  <div class="cup-stock">${normalizeGrams(cup.grams)} g</div>
                  <div class="cup-stock-label">current weight</div>

                  <div class="cup-time-box">
                    <small>Next Dose</small>
                    <strong>${formatTime(cup.hour, cup.minute)}</strong>
                  </div>
                </div>
              `;
              })
              .join("")}
          </div>
        </div>
      `;

  document.querySelectorAll(".cup-card").forEach((card) => {
    card.addEventListener("click", () => openCup(Number(card.dataset.cupId)));
  });
}

function renderDetailsPage() {
  const cup = currentCup();
  if (!cup) return;

  pageContainer.innerHTML = `
        <div class="details-page">
          <div class="details-header">
            <div>
              <h3>Cup ${cup.id} Settings</h3>
              <p>${cup.medicationName ? cup.medicationName : "No medication assigned from admin yet"}</p>
            </div>

            <button type="button" class="back-btn" id="backBtn">Back</button>
          </div>

          <div class="details-content">
            <div class="control-section">
              <label>Pills to Dispense</label>
              <div class="pills-control">
                <button type="button" class="pill-step-btn" id="decreasePillsBtn">−</button>
                <div class="pill-value">${cup.pillsPerDose || 1}</div>
                <button type="button" class="pill-step-btn" id="increasePillsBtn">+</button>
              </div>
            </div>

            <div class="time-grid">
              <div class="time-control">
                <label>Hour</label>
                <div class="time-touch-row">
                  <button type="button" class="time-side-btn" id="decreaseHourBtn">−</button>
                  <div class="time-display">${cup.hour !== "" ? pad2(cup.hour) : "--"}</div>
                  <button type="button" class="time-side-btn" id="increaseHourBtn">+</button>
                </div>
              </div>

              <div class="time-control">
                <label>Minute</label>
                <div class="time-touch-row">
                  <button type="button" class="time-side-btn" id="decreaseMinuteBtn">−</button>
                  <div class="time-display">${cup.minute !== "" ? pad2(cup.minute) : "--"}</div>
                  <button type="button" class="time-side-btn" id="increaseMinuteBtn">+</button>
                </div>
              </div>
            </div>

            <div class="details-actions">
              <button type="button" class="save-btn" id="saveCupBtn">Save Cup</button>
              <button type="button" class="clear-btn" id="clearCupBtn">Clear Cup</button>
            </div>
          </div>
        </div>
      `;

  document.getElementById("backBtn").addEventListener("click", goBack);
  document
    .getElementById("decreasePillsBtn")
    .addEventListener("click", decreasePills);
  document
    .getElementById("increasePillsBtn")
    .addEventListener("click", increasePills);
  document
    .getElementById("decreaseHourBtn")
    .addEventListener("click", decreaseHour);
  document
    .getElementById("increaseHourBtn")
    .addEventListener("click", increaseHour);
  document
    .getElementById("decreaseMinuteBtn")
    .addEventListener("click", decreaseMinute);
  document
    .getElementById("increaseMinuteBtn")
    .addEventListener("click", increaseMinute);
  document.getElementById("saveCupBtn").addEventListener("click", saveCup);
  document.getElementById("clearCupBtn").addEventListener("click", clearCup);
}

function render() {
  if (selectedCup === null) {
    renderOverviewPage();
  } else {
    renderDetailsPage();
  }
}

function openCup(id) {
  selectedCup = id;

  const cup = currentCup();
  if (cup && (!cup.pillsPerDose || cup.pillsPerDose < 1)) {
    cup.pillsPerDose = 1;
  }

  render();
}

function goBack() {
  selectedCup = null;
  render();
}

function increasePills() {
  const cup = currentCup();
  if (!cup) return;

  let value = Number(cup.pillsPerDose || 1);
  value++;
  if (value > 99) value = 99;

  cup.pillsPerDose = value;
  saveToBrowser();
  render();
}

function decreasePills() {
  const cup = currentCup();
  if (!cup) return;

  let value = Number(cup.pillsPerDose || 1);
  value--;
  if (value < 1) value = 1;

  cup.pillsPerDose = value;
  saveToBrowser();
  render();
}

function increaseHour() {
  const cup = currentCup();
  if (!cup) return;

  let value = cup.hour === "" ? 0 : Number(cup.hour);
  value++;
  if (value > 23) value = 0;

  cup.hour = pad2(value);
  saveToBrowser();
  render();
}

function decreaseHour() {
  const cup = currentCup();
  if (!cup) return;

  let value = cup.hour === "" ? 0 : Number(cup.hour);
  value--;
  if (value < 0) value = 23;

  cup.hour = pad2(value);
  saveToBrowser();
  render();
}

function increaseMinute() {
  const cup = currentCup();
  if (!cup) return;

  let value = cup.minute === "" ? 0 : Number(cup.minute);
  value += 5;
  if (value > 59) value = 0;

  cup.minute = pad2(value);
  saveToBrowser();
  render();
}

function decreaseMinute() {
  const cup = currentCup();
  if (!cup) return;

  let value = cup.minute === "" ? 0 : Number(cup.minute);
  value -= 5;
  if (value < 0) value = 55;

  cup.minute = pad2(value);
  saveToBrowser();
  render();
}

function saveCup() {
  const cup = currentCup();
  if (!cup) return;
  if (!lockSending()) return;

  saveToBrowser();

  sendToNodeRed({
    topic: "save_cup",
    payload: {
      userName,
      cup: cup.id,
      hour: Number(cup.hour),
      minute: Number(cup.minute),
      pills: Number(cup.pillsPerDose),
      grams: Number(cup.grams || 0),
    },
  });
}

function setAllCups() {
  if (!lockSending()) return;

  saveToBrowser();

  sendToNodeRed({
    topic: "set_all_cups",
    payload: {
      userName,
      schedules: cups.map((cup) => ({
        cup: cup.id,
        hour: Number(cup.hour),
        minute: Number(cup.minute),
        pills: Number(cup.pillsPerDose),
        grams: Number(cup.grams || 0),
      })),
    },
  });
}

function clearCup() {
  const cup = currentCup();
  if (!cup) return;

  cup.pillsPerDose = 1;
  cup.hour = "";
  cup.minute = "";

  saveToBrowser();
  render();
}

function applyMedicationPayload(payload) {
  const cupId = Number(
    payload.cup || payload.cupId || payload.id || selectedCup,
  );
  const medicationName = String(
    payload.medicationName ||
      payload.Medication ||
      payload.medication ||
      payload.name ||
      "",
  );

  if (!cupId || !medicationName) return;

  const cup = cups.find((c) => c.id === cupId);

  if (cup) {
    cup.medicationName = medicationName;
    saveToBrowser();
    render();
  }
}

// Optional helper for testing incoming data manually from browser console.
// Example: receiveMessage({ topic: "cup_grams", payload: { cup: 1, grams: 55 } })
function receiveMessage(msg) {
  const topic = msg.topic;
  const payload = msg.payload || {};

  if (topic === "user_name") {
    userName = String(payload.userName || payload.name || msg.payload || "");
    saveToBrowser();
  }

  if (topic === "cup_grams") {
    const cupId = Number(payload.cup);
    const cup = cups.find((c) => c.id === cupId);
    if (cup) {
      cup.grams = normalizeGrams(payload.grams);
      saveToBrowser();
    }
  }

  if (topic === "cup_medication" || topic === "assign_medication") {
    applyMedicationPayload(payload);
  }

  if (topic === "all_cup_medications") {
    cups.forEach((cup) => {
      const key = "cup" + cup.id;
      if (payload[key] !== undefined) {
        cup.medicationName = String(
          payload[key].medicationName ||
            payload[key].Medication ||
            payload[key].medication ||
            payload[key].name ||
            payload[key] ||
            "",
        );
      }
    });
    saveToBrowser();
  }

  if (payload.Medication || payload.medicationName || payload.medication) {
    applyMedicationPayload(payload);
  }

  if (topic === "full_schedule_from_firebase") {
    if (payload.userName) {
      userName = String(payload.userName);
    }

    if (payload.schedule) {
      cups.forEach((cup) => {
        const key = "cup" + cup.id;
        const firebaseCup = payload.schedule[key];

        if (firebaseCup) {
          if (firebaseCup.hour !== undefined) cup.hour = pad2(firebaseCup.hour);
          if (firebaseCup.minute !== undefined)
            cup.minute = pad2(firebaseCup.minute);
          if (firebaseCup.pills !== undefined)
            cup.pillsPerDose = Number(firebaseCup.pills);
          if (firebaseCup.grams !== undefined)
            cup.grams = normalizeGrams(firebaseCup.grams);

          if (
            firebaseCup.medicationName !== undefined ||
            firebaseCup.Medication !== undefined ||
            firebaseCup.medication !== undefined ||
            firebaseCup.name !== undefined
          ) {
            cup.medicationName = String(
              firebaseCup.medicationName ||
                firebaseCup.Medication ||
                firebaseCup.medication ||
                firebaseCup.name ||
                "",
            );
          }
        }
      });
    }

    saveToBrowser();
  }

  render();
}

window.receiveMessage = receiveMessage;

setAllBtn.addEventListener("click", setAllCups);
loadSavedData();
render();
