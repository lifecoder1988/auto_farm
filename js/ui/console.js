export function appendLog(args) {
  const consoleOut = document.getElementById("console-output");

  const line = document.createElement("div");
  line.className = "log-line";

  const time = document.createElement("span");
  time.className = "log-time";
  time.textContent = `[${getTimestamp()}]`;

  const body = document.createElement("pre");
  body.className = "log-body";
  body.textContent = args.map((a) => formatValue(a)).join(" ");

  line.appendChild(time);
  line.appendChild(body);

  consoleOut.appendChild(line);
  consoleOut.scrollTop = consoleOut.scrollHeight;
}

function getTimestamp() {
  const d = new Date();
  return (
    `${String(d.getHours()).padStart(2, "0")}:` +
    `${String(d.getMinutes()).padStart(2, "0")}:` +
    `${String(d.getSeconds()).padStart(2, "0")}.` +
    `${String(d.getMilliseconds()).padStart(3, "0")}`
  );
}

function formatValue(v) {
  if (v === null) return "null";
  if (v === undefined) return "undefined";
  if (typeof v === "object") {
    try {
      return JSON.stringify(v, null, 2);
    } catch {
      return String(v);
    }
  }
  return String(v);
}
