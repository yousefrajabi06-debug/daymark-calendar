export default function Shell({ children, section = "Overview" }) {
  return (
    <div className="app">
      <header className="site-header">
        <a className="brand" href="./">
          <span className="brand-icon">D</span>Daymark
          <span className="brand-dot">.</span>
        </a>
        <span className="header-section">Workspace / {section}</span>
        <a
          className="source"
          href="https://github.com/yousefrajabi06-debug/daymark-calendar"
        >
          View source ↗
        </a>
      </header>
      <main>{children}</main>
      <footer>
        <span>
          A learning project by{" "}
          <a href="https://github.com/yousefrajabi06-debug">Yousef Rajabi</a>
        </span>
        <span>Thoughtfully simple. Built to learn.</span>
      </footer>
    </div>
  );
}
