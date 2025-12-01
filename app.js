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
//  CHART & PDF SECTION (UPDATED)
// ==================================================================
// ================================================================
//  SUPABASE CONNECTION  (CHANGE WITH YOUR DETAILS)
// ================================================================
const SUPABASE_URL = "https://qcmtwrllhkecstwnnfik.supabase.co";
const SUPABASE_KEY = "YOUR_ANON_KEY";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// ================================================================
//  CHART & REPORT — FULL WORKING CODE
// ================================================================
let chartInstance;

// Show / hide inputs based on selection
document.getElementById("filterSelect").addEventListener("change", function () {
  document.querySelectorAll(".filter-input").forEach(el => el.classList.add("hidden"));
  const selected = this.value;

  if (selected === "day") document.getElementById("singleDay").classList.remove("hidden");
  else if (selected === "month") document.getElementById("singleMonth").classList.remove("hidden");
  else if (selected === "dayRange") document.getElementById("dayRangeInputs").classList.remove("hidden");
  else if (selected === "monthRange") document.getElementById("monthRangeInputs").classList.remove("hidden");
});


// ================================================================
//  LOAD CHART DATA FROM SUPABASE
// ================================================================
document.getElementById("loadCharts").addEventListener("click", async function () {
  const selected = document.getElementById("filterSelect").value;
  let query = supabase.from("power_logs").select("*");
  let chartLabels = [];
  let chartData = [];

  if (selected === "day") {
    const day = document.getElementById("singleDay").value;
    query = query.eq("date", day);
    chartLabels.push(day);

  } else if (selected === "month") {
    const monthInput = document.getElementById("singleMonth").value; // yyyy-mm format
    const from = monthInput + "-01";
    const to = new Date(new Date(from).getFullYear(), new Date(from).getMonth() + 1, 0)
      .toISOString().split("T")[0];   // last date of month
    query = query.gte("date", from).lte("date", to);

  } else if (selected === "dayRange") {
    const from = document.getElementById("fromDay").value;
    const to = document.getElementById("toDay").value;
    query = query.gte("date", from).lte("date", to);

  } else if (selected === "monthRange") {
    const fromMonth = document.getElementById("fromMonth").value + "-01";
    const toMonth = document.getElementById("toMonth").value + "-01";
    for (let d = new Date(fromMonth); d <= new Date(toMonth); d.setMonth(d.getMonth() + 1)) {
      chartLabels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    query = query.gte("date", fromMonth).lte("date", toMonth);
  }

  const { data, error } = await query;
  if (error || !data.length) {
    document.getElementById("chartResults").innerHTML = "<b>No data found!</b>";
    if (chartInstance) chartInstance.destroy();
    return;
  }

  // Format Data for Chart
  data.forEach(entry => {
    chartLabels.push(entry.date);
    chartData.push(entry.total_power || entry.power || 0);
  });

  loadChart(chartLabels, chartData);
  showReport(chartData);
});


// ================================================================
//  LOAD CHART
// ================================================================
function loadChart(labels, data) {
  const ctx = document.getElementById("chart").getContext("2d");
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: document.getElementById("chartType").value,
    data: {
      labels: labels,
      datasets: [{
        label: "Power Consumption (W)",
        data: data,
        borderWidth: 2,
        fill: true
      }]
    },
    options: { responsive: true }
  });
}


// ================================================================
//  SHOW REPORT SUMMARY
// ================================================================
function showReport(data) {
  const total = data.reduce((a, b) => a + b, 0);
  const avg = (total / data.length).toFixed(2);

  document.getElementById("chartResults").innerHTML = `
    <b>Total Power:</b> ${total.toFixed(2)} W  |
    <b>Average:</b> ${avg} W |
    <b>Entries:</b> ${data.length}
  `;
}


// ================================================================
//  PDF DOWNLOAD
// ================================================================
document.getElementById("downloadPdf").addEventListener("click", function () {
  if (!chartInstance) return alert("Load chart first!");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  const imgData = chartInstance.toBase64Image();

  pdf.text("Power Usage Report", 10, 10);
  pdf.addImage(imgData, "PNG", 10, 20, 180, 100);
  pdf.text(document.getElementById("chartResults").innerText, 10, 130);
  pdf.save("report.pdf");
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
