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

function StudentsTable({ students }) {
  if (students.length === 0) {
    return (
      <section className="panel history-card empty-history">
        No hay predicciones registradas
      </section>
    );
  }

  return (
    <section className="panel history-card">
      <div className="history-header">
        <div>
          <p className="eyebrow">Historial académico</p>
          <h2>Predicciones registradas por curso</h2>
        </div>
        <span>
          {students.length} estudiante{students.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="table-wrapper">
        <table className="students-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Facultad</th>
              <th>Curso</th>
              <th>Promedio académico</th>
              <th>Total clases</th>
              <th>Faltas</th>
              <th>Asistencia</th>
              <th>Materias perdidas</th>
              <th>Nivel socioeconómico</th>
              <th>Porcentaje de riesgo</th>
              <th>Nivel de riesgo</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const riskClass =
                riskClassByLevel[normalizeRiskLevel(student.riskLevel)] ||
                'risk-neutral';

              return (
                <tr key={student.id}>
                  <td data-label="Nombre">{student.studentName}</td>
                  <td data-label="Facultad">{student.faculty}</td>
                  <td data-label="Curso">{student.course}</td>
                  <td data-label="Promedio académico">
                    {student.averageGrade.toFixed(2)}
                  </td>
                  <td data-label="Total clases">{student.totalClasses}</td>
                  <td data-label="Faltas">{student.absences}</td>
                  <td data-label="Asistencia">
                    {student.attendancePercentage.toFixed(2)}%
                  </td>
                  <td data-label="Materias perdidas">
                    {student.failedSubjects}
                  </td>
                  <td data-label="Nivel socioeconómico">
                    {student.socioeconomicLevel}
                  </td>
                  <td data-label="Porcentaje de riesgo">
                    {formatPercentage(student.riskPercentage)}
                  </td>
                  <td data-label="Nivel de riesgo">
                    <span className={`risk-badge ${riskClass}`}>
                      {student.riskLevel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default StudentsTable;
