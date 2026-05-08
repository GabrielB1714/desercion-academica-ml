const riskClassByLevel = {
  bajo: 'risk-low',
  medio: 'risk-medium',
  alto: 'risk-high',
};

function normalizeRiskLevel(level) {
  return String(level || '').trim().toLowerCase();
}

function formatPercentage(value) {
  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? value : `${numericValue.toFixed(2)}%`;
}

function HighRiskStudents({ students }) {
  return (
    <section className="panel high-risk-panel" id="estudiantes-riesgo">
      <div className="panel-header compact">
        <p className="eyebrow">Priorización</p>
        <h2>Estudiantes con mayor riesgo</h2>
      </div>

      {students.length === 0 ? (
        <p className="empty-state">No hay predicciones registradas</p>
      ) : (
        <div className="risk-list">
          {students.map((student) => {
            const riskClass =
              riskClassByLevel[normalizeRiskLevel(student.riskLevel)] ||
              'risk-neutral';

            return (
              <article className="risk-list-item" key={student.id}>
                <div>
                  <strong>{student.studentName}</strong>
                  <span>{student.faculty} · {student.course}</span>
                </div>
                <div className="risk-list-score">
                  <span>{formatPercentage(student.riskPercentage)}</span>
                  <small className={`risk-badge ${riskClass}`}>
                    {student.riskLevel}
                  </small>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default HighRiskStudents;
