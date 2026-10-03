export default function Calendar({ year, month, holidays }) {
  const first = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const title = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
  return (
    <section className="panel calendar">
      <div className="panel-heading">
        <h2>{title}</h2>
        <span className="tag">Monday first</span>
      </div>
      <div className="calendar-grid">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <span className="weekday" key={day}>
            {day}
          </span>
        ))}
        {Array.from({ length: first }, (_, i) => (
          <span aria-hidden="true" key={"blank" + i} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const day = i + 1;
          const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const names = holidays
            .filter((holiday) => holiday.date === date)
            .map((holiday) => holiday.name);
          return (
            <span
              className={`calendar-day ${names.length ? "holiday-day" : ""}`}
              key={day}
              title={names.join(", ")}
              aria-label={`${date}${names.length ? ": " + names.join(", ") : ""}`}
            >
              {day}
              {names.length > 0 && <i />}
            </span>
          );
        })}
      </div>
      <p className="calendar-key">
        <span /> Public holiday · regional rules may apply
      </p>
    </section>
  );
}
