// ==================================================================
//  DATE & TIME
// ==================================================================
function updateDateTime() {
  document.getElementById("dateTime").textContent = new Date().toLocaleString();
}
setInterval(updateDateTime, 1000);
updateDateTime();

// ==================================================================
//  GLOBAL VARIABLES
// ==================================================================
const relayStates = { 1: false, 2: false, 3: false, 4: false };
const usageTimers = { 1: 0, 2: 0, 3: 0, 4: 0 };
const usageLimits = { 1: 12, 2: 12, 3: 12, 4: 12 };
const autoOffTimers = {};

// ==================================================================
//  RELAY CONTROL
// ==================================================================
for (let i = 1; i <= 4; i++) {
  document.getElementById(`relay${i}`).addEventListener("change", (e) =>
    toggleRelay(i, e.target.checked)
  );
}

function toggleRelay(id, state) {
  relayStates[id] = state;
  document.getElementById(`s${id}`).textContent = state ? "ON" : "OFF";
  addNotification(`Load ${id} turned ${state ? "ON" : "OFF"}`);
}

// ==================================================================
//  AUTO-OFF TIMER
// ==================================================================
document.querySelectorAll(".preset").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.getElementById("customMin").value = btn.dataset.min;
  });
});

document.getElementById("applyTimer").addEventListener("click", () => {
  const load = document.getElementById("loadSelect").value;
  const mins = parseInt(document.getElementById("customMin").value);
  if (!mins || mins <= 0) return alert("Enter valid minutes");

  if (autoOffTimers[load]) clearTimeout(autoOffTimers[load]);
  autoOffTimers[load] = setTimeout(() => {
    document.getElementById(`relay${load}`).checked = false;
    toggleRelay(load, false);
    addNotification(`Auto-OFF: Load ${load} OFF after ${mins} min`);
  }, mins * 60 * 1000);

  addNotification(`Timer set for Load ${load}: ${mins} min`);
});

// ==================================================================
//  DAILY LIMIT LOGIC
// ==================================================================
document.getElementById("saveLimits").addEventListener("click", () => {
  for (let i = 1; i <= 4; i++) {
    usageLimits[i] = parseFloat(document.getElementById(`limit${i}`).value);
  }
  addNotification("Usage limits updated.");
});

setInterval(() => {
  for (let i = 1; i <= 4; i++) {
    if (relayStates[i]) {
      usageTimers[i] += 2;
      const hoursUsed = usageTimers[i] / 3600;
      if (hoursUsed >= usageLimits[i]) {
        document.getElementById(`relay${i}`).checked = false;
        toggleRelay(i, false);
        addNotification(`Limit reached: Load ${i} OFF after ${usageLimits[i]} hrs`);
      }
    }
  }
}, 2000);
// ==================================================================
//  LIVE MONITORING (USING Wh)  --> UPDATED WITH REALISTIC RANGES
// ==================================================================
function updateLiveDemo() {
  let totalCurrent = 0,
    totalPower = 0;
    

  // LOAD 1  --> 12.0 - 12.3V & 0.12 - 0.14A
  if (relayStates[1]) {
    var v1 = (12 + Math.random() * 0.3).toFixed(1);
    var c1 = (0.12 + Math.random() * 0.02).toFixed(2);
  } else {
    var v1 = "0.0";
    var c1 = "0.00";
  }

  // LOAD 2  --> 12.0 - 12.2V & 0.12 - 0.13A
  if (relayStates[2]) {
    var v2 = (12 + Math.random() * 0.2).toFixed(1);
    var c2 = (0.12 + Math.random() * 0.01).toFixed(2);
  } else {
    var v2 = "0.0";
    var c2 = "0.00";
  }

  // LOAD 3  --> FIXED 12.0V & 0.12A
  if (relayStates[3]) {
    var v3 = (12).toFixed(1);
    var c3 = (0.12).toFixed(2);
  } else {
    var v3 = "0.0";
    var c3 = "0.00";
  }

  // FAN  --> 12.0 - 12.5V & 0.11 - 0.16A
  if (relayStates[4]) {
    var v4 = (12 + Math.random() * 0.5).toFixed(1);
    var c4 = (0.11 + Math.random() * 0.05).toFixed(2);
  } else {
    var v4 = "0.0";
    var c4 = "0.00";
  }

  // ---- Update HTML Values ----
  const voltages = [v1, v2, v3, v4];
  const currents = [c1, c2, c3, c4];

  for (let i = 1; i <= 4; i++) {
    const power = (voltages[i - 1] * currents[i - 1]).toFixed(1);
    const energy = (currents[i - 1] > 0 ? Math.random() * 5 : 0).toFixed(2);

    document.getElementById(`v${i}`).textContent = voltages[i - 1] + "V";
    document.getElementById(`c${i}`).textContent = currents[i - 1] + "A";
    document.getElementById(`p${i}`).textContent = power + "W";
    document.getElementById(`s${i}`).textContent = relayStates[i] ? "ON" : "OFF";

    totalCurrent += parseFloat(currents[i - 1]);
    totalPower += parseFloat(power);
  }
// ---- TOTALS ---- (AVERAGE VOLTAGE)
let validVoltages = voltages.filter(v => parseFloat(v) > 0); // only ON loads
let avgVoltage = validVoltages.length > 0
  ? (validVoltages.reduce((a, b) => a + parseFloat(b), 0) / validVoltages.length).toFixed(1)
  : "0.0";

document.getElementById("tv").textContent = avgVoltage + "V";  // Average Voltage
document.getElementById("tc").textContent = totalCurrent.toFixed(2) + "A"; // Total Current
document.getElementById("tp").textContent = totalPower.toFixed(1) + "W";   // Total Power

}

setInterval(updateLiveDemo, 2000);

// ==================================================================
//  CHART SECTION (NO CHANGE)
// ==================================================================
// SAME CODE AS YOUR PREVIOUS VERSION...

// ==================================================================
//  PDF REPORT + NOTIFICATIONS (NO CHANGE)
// ==================================================================
// SAME CODE AS YOUR PREVIOUS VERSION...


// ==================================================================
//  CHARTS (IN Wh)
// ==================================================================
const filterSelect = document.getElementById("filterSelect");
const filterInputs = {
  day: document.getElementById("singleDay"),
  month: document.getElementById("singleMonth"),
  dayRange: document.getElementById("dayRangeInputs"),
  monthRange: document.getElementById("monthRangeInputs"),
};
filterSelect.addEventListener("change", () => {
  Object.values(filterInputs).forEach((el) => el.classList.add("hidden"));
  const selected = filterSelect.value;
  if (filterInputs[selected]) filterInputs[selected].classList.remove("hidden");
});

let chart;

// --- Cost calculation ---
function calculateCost(totalWh) {
  if (totalWh <= 50) return totalWh * 4;
  else if (totalWh <= 100) return totalWh * 6;
  else return totalWh * 8;
}

// --- Chart Load Button ---
document.getElementById("loadCharts").addEventListener("click", () => {
  const ctx = document.getElementById("chart").getContext("2d");
  if (chart) chart.destroy();

  const selected = filterSelect.value;
  const deviceLabels = ["Light 1", "Light 2", "Light 3", "Fan"];
  const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];
  let chartLabels = [];

  if (selected === "day")
    chartLabels = [document.getElementById("singleDay").value || "Today"];
  else if (selected === "month")
    chartLabels = [document.getElementById("singleMonth").value || "This Month"];
  else if (selected === "dayRange") {
    const from = new Date(document.getElementById("fromDay").value);
    const to = new Date(document.getElementById("toDay").value);
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1))
      chartLabels.push(new Date(d).toISOString().split("T")[0]);
  } else if (selected === "monthRange") {
    const from = new Date(document.getElementById("fromMonth").value + "-01");
    const to = new Date(document.getElementById("toMonth").value + "-01");
    for (let d = new Date(from); d <= to; d.setMonth(d.getMonth() + 1))
      chartLabels.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      );
  }

  const datasets = deviceLabels.map((load, i) => ({
    label: load,
    backgroundColor: colors[i],
    data: chartLabels.map(() => (Math.random() * 500 + 100).toFixed(1)), // demo Wh
  }));

  chart = new Chart(ctx, {
    type: document.getElementById("chartType").value,
    data: { labels: chartLabels, datasets },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Power Consumption (Wh)",
          color: "#e2e8f0",
        },
      },
    },
  });

  // --- Show total Wh & cost for each month separately ---
  const resultDiv = document.getElementById("chartResults");
  resultDiv.innerHTML = ""; // clear old results

  if (selected === "month" || selected === "monthRange") {
    let html = `<h3 style="color:#e2e8f0; margin-top:10px; text-align:center;">Monthly Summary</h3>`;

    chartLabels.forEach((label, index) => {
      let totalWh = 0;
      datasets.forEach((d) => (totalWh += parseFloat(d.data[index])));
      const cost = calculateCost(totalWh).toFixed(2);

      html += `
        <div style="
          margin-top:8px;
          background:#1e293b;
          padding:10px;
          border-radius:10px;
          text-align:center;
          width:60%;
          margin-left:auto;
          margin-right:auto;
          color:#e2e8f0;
          box-shadow:0 0 8px #0ea5e9;">
          <strong>${label}</strong><br>
          Total Energy: ${totalWh.toFixed(2)} Wh<br>
          Total Cost: ${cost} rupees
        </div>`;
    });

    resultDiv.innerHTML = html;
  } else {
    resultDiv.innerHTML = "";
  }
});

// ==================================================================
//  PDF REPORT (IN Wh)
// ==================================================================
document.getElementById("downloadPdf").addEventListener("click", () => {
  const selected = filterSelect.value;
  if (selected !== "month" && selected !== "monthRange") {
    alert("PDF report available only for monthly or month-range data.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  const deviceLabels = ["Light 1", "Light 2", "Light 3", "Fan"];

  function generateMonthlyReport(label) {
    pdf.setFontSize(14);
    pdf.text(`Power Consumption Report - ${label}`, 14, 20);
    pdf.setFontSize(10);
    pdf.text("------------------------------------------", 14, 25);

    let totalWh = 0;
    const rows = [];

    deviceLabels.forEach((load) => {
      const used = (Math.random() * 5000 + 1000).toFixed(0);
      totalWh += parseFloat(used);
      rows.push([load, used]);
    });

    const cost = calculateCost(totalWh).toFixed(2);
    let y = 35;
    pdf.text("Load Name        | Power Used (Wh)", 14, y);
    y += 6;

    rows.forEach((r) => {
      pdf.text(`${r[0].padEnd(16)} | ${r[1]} Wh`, 14, y);
      y += 6;
    });

    y += 6;
    pdf.text("------------------------------------------", 14, y);
    y += 8;
    pdf.text(`Total Power: ${totalWh.toFixed(0)} Wh`, 14, y);
    y += 6;
    pdf.text(`Cost: ${cost} rupees`, 14, y);
  }

  if (selected === "month") {
    const val =
      document.getElementById("singleMonth").value ||
      new Date().toISOString().slice(0, 7);
    const [y, m] = val.split("-");
    const name = new Date(y, m - 1).toLocaleString("default", {
      month: "long",
    });
    generateMonthlyReport(`${name} ${y}`);
  } else {
    const from = new Date(document.getElementById("fromMonth").value + "-01");
    const to = new Date(document.getElementById("toMonth").value + "-01");
    let first = true;
    for (let d = new Date(from); d <= to; d.setMonth(d.getMonth() + 1)) {
      if (!first) pdf.addPage();
      const label = `${d.toLocaleString("default", {
        month: "long",
      })} ${d.getFullYear()}`;
      generateMonthlyReport(label);
      first = false;
    }
  }

  pdf.save("Monthly_Report_Wh.pdf");
});

// ==================================================================
//  NOTIFICATIONS + LOGOUT
// ==================================================================
document
  .getElementById("refreshNotifs")
  .addEventListener("click", () => addNotification("New data updated."));

document.getElementById("clearNotifs").addEventListener("click", () => {
  document.getElementById("notifs").innerHTML =
    "<li>No notifications yet.</li>";
});

function addNotification(msg) {
  const list = document.getElementById("notifs");
  if (list.children[0].textContent === "No notifications yet.")
    list.innerHTML = "";
  const li = document.createElement("li");
  li.textContent = `${new Date().toLocaleTimeString()} - ${msg}`;
  list.prepend(li);
}

function logout() {
  window.location.href = "index.html";
}
