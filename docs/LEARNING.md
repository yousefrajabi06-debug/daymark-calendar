# Learning guide — Daymark Calendar

A public-holiday explorer with a monthly calendar and downloadable calendar events.

## Important files

- [`src/App.jsx`](../src/App.jsx): Country/year/month controls and request lifecycles.
- [`src/components/Calendar.jsx`](../src/components/Calendar.jsx): Month grid, weekday offset, and holiday markers.
- [`src/lib/holidays.js`](../src/lib/holidays.js): Fetch wrapper, data validation, date formatting, and ICS export.
- [`tests/app.spec.js`](../tests/app.spec.js): Deterministic API fixtures, retry behavior, controls, export, and mobile layout.

## Five things to study

1. Trace async/await and the difference between network errors and HTTP errors.
2. Explain useEffect cleanup and why an old response must not overwrite a new selection.
3. Calculate the weekday offset for a Monday-first calendar.
4. Understand all-day events and the exclusive end date in ICS.
5. Use browser test route fixtures to test a remote API failure predictably.

## One feature to build independently

Add a button that returns the calendar to the current month and year.

## Rebuild to understand

Start in an empty branch or separate practice folder. Rebuild the main form and one data update without copying, then add persistence or the API request. Explain the data flow aloud and recreate one behavior test. Compare your work with the original only after it works.

## Honest presentation

This is an AI-assisted learning project. Describe the code you can explain and the features you rebuilt yourself. Do not present it as employment, client work, or proof of independent mastery before studying it.
