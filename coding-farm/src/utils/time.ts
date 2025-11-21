export function getCurrentTimeString() {
  const d = new Date();

  const pad = (n: number) => String(n).padStart(2, "0");

  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hour = pad(d.getHours());
  const min = pad(d.getMinutes());
  const sec = pad(d.getSeconds());

  return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
}
