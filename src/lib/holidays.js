export const todayKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
export const formatDate = (value) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(value + "T12:00:00Z"));
export async function getJson(path, signal) {
  let response;
  try {
    response = await fetch("https://date.nager.at/api/v3/" + path, {
      signal: AbortSignal.any([signal, AbortSignal.timeout(12000)]),
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error(
      error.name === "TimeoutError"
        ? "The holiday service took too long. Please try again."
        : "Cannot reach the holiday service. Check your connection and try again.",
    );
  }
  if (!response.ok)
    throw new Error("Holiday data is unavailable right now. Please try again.");
  const data = await response.json();
  if (!Array.isArray(data))
    throw new Error("The service returned an unexpected response.");
  return data;
}
export async function getHolidays(year, country, signal) {
  const data = await getJson(`PublicHolidays/${year}/${country}`, signal);
  if (
    !data.every(
      (item) =>
        typeof item.name === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(item.date) &&
        !Number.isNaN(Date.parse(item.date)),
    )
  )
    throw new Error("Some holiday dates could not be read.");
  return data.sort((a, b) => a.date.localeCompare(b.date));
}
export function exportCalendar(holidays, country) {
  const escape = (value) =>
    String(value)
      .replaceAll("\\", "\\\\")
      .replaceAll("\n", "\\n")
      .replaceAll(",", "\\,")
      .replaceAll(";", "\\;");
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Daymark//Holiday Calendar//EN",
    "CALSCALE:GREGORIAN",
  ];
  holidays.forEach((holiday, index) => {
    const end = new Date(holiday.date + "T00:00:00Z");
    end.setUTCDate(end.getUTCDate() + 1);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${country}-${holiday.date}-${index}@daymark.local`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${holiday.date.replaceAll("-", "")}`,
      `DTEND;VALUE=DATE:${end.toISOString().slice(0, 10).replaceAll("-", "")}`,
      `SUMMARY:${escape(holiday.name)}`,
      `DESCRIPTION:${escape("Source: Nager.Date. Verify regional applicability before planning.")}`,
      "END:VEVENT",
    );
  });
  lines.push("END:VCALENDAR");
  const url = URL.createObjectURL(
    new Blob([lines.join("\r\n") + "\r\n"], {
      type: "text/calendar;charset=utf-8",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `daymark-${country}.ics`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
