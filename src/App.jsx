import { useEffect, useState } from "react";
import Shell from "./components/Shell";
import Calendar from "./components/Calendar";
import {
  getJson,
  getHolidays,
  todayKey,
  formatDate,
  exportCalendar,
} from "./lib/holidays";
export default function App() {
  const currentYear = new Date().getFullYear();
  const [country, setCountry] = useState("GB");
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [countries, setCountries] = useState([]);
  const [countryError, setCountryError] = useState("");
  const [holidays, setHolidays] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setCountryError("");
    getJson("AvailableCountries", controller.signal)
      .then((data) => {
        if (!controller.signal.aborted)
          setCountries(
            data.filter(
              (item) =>
                item &&
                typeof item.name === "string" &&
                /^[A-Z]{2}$/.test(item.countryCode),
            ),
          );
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setCountryError(
            "The country list could not load. The current country remains available.",
          );
      });
    return () => controller.abort();
  }, [attempt]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    getHolidays(year, country, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setHolidays(data);
      })
      .catch((problem) => {
        if (!controller.signal.aborted) setError(problem.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [year, country, attempt]);
  const visible = holidays.filter(
    (holiday) =>
      Number(holiday.date.slice(5, 7)) === month &&
      `${holiday.name} ${holiday.localName}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const countryName =
    countries.find((item) => item.countryCode === country)?.name ||
    "United Kingdom";
  const upcoming = holidays.find((holiday) => holiday.date >= todayKey());
  const months = Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat("en", { month: "long", timeZone: "UTC" }).format(
      new Date(Date.UTC(year, i, 1)),
    ),
  );
  return (
    <Shell section="Holiday calendar">
      <section className="heading">
        <div>
          <p className="eyebrow">GOOD PLANS START WITH A CLEAR CALENDAR</p>
          <h1>
            A little more room
            <br />
            for the days that matter.
          </h1>
          <p className="subtitle">
            Explore public holidays, see the month, and take your calendar with
            you.
          </p>
        </div>
        <div className="calendar-art" aria-hidden="true">
          <span>MAKE SOME SPACE</span>
          <strong>{String(month).padStart(2, "0")}</strong>
          <small>
            {months[month - 1]} / {year}
          </small>
        </div>
      </section>
      <section className="controls-panel">
        <label>
          Country
          <select
            className="control"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            {countries.length ? (
              countries.map((item) => (
                <option key={item.countryCode} value={item.countryCode}>
                  {item.name}
                </option>
              ))
            ) : (
              <option value="GB">United Kingdom</option>
            )}
          </select>
        </label>
        <label>
          Year
          <select
            className="control"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {Array.from({ length: 8 }, (_, i) => currentYear - 2 + i).map(
              (y) => (
                <option key={y}>{y}</option>
              ),
            )}
          </select>
        </label>
        <label>
          Month
          <select
            className="control"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {months.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <button
          className="primary"
          disabled={loading || !!error || !visible.length}
          onClick={() => exportCalendar(visible, country)}
        >
          Export this view .ics ↓
        </button>
      </section>
      {countryError && (
        <div className="notice" role="status">
          {countryError}{" "}
          <button
            className="text-button"
            onClick={() => setAttempt((value) => value + 1)}
          >
            Reload countries
          </button>
        </div>
      )}
      {loading ? (
        <div className="loading" role="status">
          <h2>Opening your calendar…</h2>
          <p>Fetching public holiday data.</p>
        </div>
      ) : error ? (
        <section className="empty" role="alert">
          <h2>A small delay in the plans.</h2>
          <p>{error}</p>
          <button
            className="secondary"
            onClick={() => setAttempt((value) => value + 1)}
          >
            Try again
          </button>
        </section>
      ) : (
        <>
          <section className="stats">
            <div className="stat">
              <span>Holiday dates in {year}</span>
              <strong>{new Set(holidays.map((item) => item.date)).size}</strong>
              <small>{countryName} · includes regional dates</small>
            </div>
            <div className="stat">
              <span>Dates this month</span>
              <strong>
                {
                  new Set(
                    holidays
                      .filter((item) => Number(item.date.slice(5, 7)) === month)
                      .map((item) => item.date),
                  ).size
                }
              </strong>
              <small>{months[month - 1]}</small>
            </div>
            <div className="stat accent">
              <span>Next listed holiday from today</span>
              <strong className="next-date">
                {upcoming ? formatDate(upcoming.date) : "None ahead"}
              </strong>
              <small>{upcoming?.name || "Try another year"}</small>
            </div>
          </section>
          <div className="holiday-layout">
            <Calendar year={year} month={month} holidays={holidays} />
            <section className="panel holiday-list">
              <div className="panel-heading">
                <h2>The month ahead</h2>
                <span className="count">{visible.length}</span>
              </div>
              <input
                type="search"
                className="control"
                aria-label="Search holidays"
                placeholder="Find a holiday…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {visible.length ? (
                visible.map((holiday, i) => (
                  <article
                    className="holiday-card"
                    key={holiday.date + holiday.name + i}
                  >
                    <div className="date-block">
                      <strong>{holiday.date.slice(-2)}</strong>
                      <span>{months[month - 1].slice(0, 3)}</span>
                    </div>
                    <div>
                      <h3>{holiday.name}</h3>
                      <p>
                        {holiday.localName !== holiday.name
                          ? holiday.localName
                          : formatDate(holiday.date)}
                      </p>
                      <span className="tag">
                        {holiday.global ? "Nationwide" : "Regional"}
                      </span>
                      {!holiday.global && (
                        <p className="small">
                          {holiday.counties?.join(", ") ||
                            "Check local applicability"}
                        </p>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <div className="mini-empty">
                  <h3>No matching holidays.</h3>
                  <p>Choose another month or clear the search.</p>
                </div>
              )}
            </section>
          </div>
          <p className="source-note">
            Public holiday data from{" "}
            <a href="https://date.nager.at/">Nager.Date</a>. Coverage and
            regional observance vary; confirm dates with local official sources
            before making plans.
          </p>
        </>
      )}
    </Shell>
  );
}
