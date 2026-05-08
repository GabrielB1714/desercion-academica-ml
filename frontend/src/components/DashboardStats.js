const statsConfig = [
  {
    key: 'total',
    label: 'Total estudiantes',
    className: 'stat-total',
  },
  {
    key: 'high',
    label: 'Riesgo alto',
    className: 'stat-high',
  },
  {
    key: 'medium',
    label: 'Riesgo medio',
    className: 'stat-medium',
  },
  {
    key: 'low',
    label: 'Riesgo bajo',
    className: 'stat-low',
  },
];

function DashboardStats({ stats }) {
  return (
    <section className="stats-grid" aria-label="Indicadores principales">
      {statsConfig.map((item) => (
        <article className={`stat-card ${item.className}`} key={item.key}>
          <span>{item.label}</span>
          <strong>{stats[item.key]}</strong>
        </article>
      ))}
    </section>
  );
}

export default DashboardStats;
