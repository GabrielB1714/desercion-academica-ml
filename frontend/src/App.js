import { useMemo, useState } from 'react';
import './App.css';
import FormComponent from './components/FormComponent';
import ResultComponent from './components/ResultComponent';
import StudentsTable from './components/StudentsTable';
import DashboardStats from './components/DashboardStats';
import HighRiskStudents from './components/HighRiskStudents';

function normalizeRiskLevel(level) {
  return String(level || '').trim().toLowerCase();
}

function App() {
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [studentsHistory, setStudentsHistory] = useState([]);

  const addStudentPrediction = (studentPrediction) => {
    setStudentsHistory((currentHistory) => [
      {
        id: `${Date.now()}-${currentHistory.length}`,
        ...studentPrediction,
      },
      ...currentHistory,
    ]);
  };

  const dashboardStats = useMemo(() => {
    return studentsHistory.reduce(
      (stats, student) => {
        const level = normalizeRiskLevel(student.riskLevel);

        return {
          ...stats,
          total: stats.total + 1,
          high: level === 'alto' ? stats.high + 1 : stats.high,
          medium: level === 'medio' ? stats.medium + 1 : stats.medium,
          low: level === 'bajo' ? stats.low + 1 : stats.low,
        };
      },
      { total: 0, high: 0, medium: 0, low: 0 }
    );
  }, [studentsHistory]);

  const highestRiskStudents = useMemo(() => {
    return [...studentsHistory]
      .sort((firstStudent, secondStudent) => {
        return Number(secondStudent.riskPercentage) - Number(firstStudent.riskPercentage);
      })
      .slice(0, 5);
  }, [studentsHistory]);

  return (
    <main className="dashboard-shell">
      <aside className="sidebar" aria-label="Navegación principal">
        <div className="sidebar-brand">
          <span>U</span>
          <div>
            <strong>Académico IA</strong>
            <small>Deserción estudiantil</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a href="#dashboard" className="active">Dashboard</a>
          <a href="#facultades">Facultades</a>
          <a href="#cursos">Cursos</a>
          <a href="#estudiantes-riesgo">Estudiantes en Riesgo</a>
        </nav>
      </aside>

      <section className="dashboard-content" id="dashboard">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Dashboard institucional</p>
            <h1>Predicción de deserción académica</h1>
            <p>
              Registra estudiantes por facultad y curso, calcula promedios y
              monitorea el nivel de riesgo desde un panel académico centralizado.
            </p>
          </div>
        </header>

        <DashboardStats stats={dashboardStats} />

        <section className="dashboard-grid">
          <div className="panel form-panel" id="facultades">
            <div className="panel-header">
              <p className="eyebrow">Nuevo análisis</p>
              <h2>Datos del estudiante</h2>
            </div>

            <FormComponent
              onResult={setPredictionResult}
              onLoadingChange={setIsLoading}
              onPredictionCreated={addStudentPrediction}
            />
          </div>

          <div className="side-panels">
            <ResultComponent result={predictionResult} isLoading={isLoading} />
            <HighRiskStudents students={highestRiskStudents} />
          </div>
        </section>

        <section id="cursos">
          <StudentsTable students={studentsHistory} />
        </section>
      </section>
    </main>
  );
}

export default App;